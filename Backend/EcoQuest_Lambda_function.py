import boto3
import json
import uuid
import logging
import boto3.session
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client(
    's3',
    region_name='us-east-2',
    config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4')
)
rekognition = boto3.client('rekognition', region_name='us-east-2')

users_table        = dynamodb.Table('EcoQuest_Users')
quests_table       = dynamodb.Table('EcoQuest_Quests')
observations_table = dynamodb.Table('EcoQuest_Observations')
rewards_table      = dynamodb.Table('EcoQuest_Rewards')
stores_table       = dynamodb.Table('EcoQuest_Stores')
species_table      = dynamodb.Table('EcoQuest_Species')
groups_table       = dynamodb.Table('EcoQuest_Groups')

BUCKET_NAME = 'ecoquest-quest-photos'

def default_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }


def respond(status_code, body):
    return {
        'statusCode': status_code,
        'headers': default_headers(),
        'body': json.dumps(body)
    }


def options_response():
    return {
        'statusCode': 200,
        'headers': default_headers(),
        'body': ''
    }


def lambda_handler(event, context):
    logger.info(f"Event: {json.dumps(event)}")

    path = event.get('rawPath') or event.get('path', '')

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return respond(400, {"error": "Invalid JSON in request body"})

    try:

        # Handle CORS preflight OPTIONS requests
        if event.get('httpMethod') == 'OPTIONS' or event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
            return options_response()

        # --- REGISTER USER ---
        if "/register" in path:
            username = body.get('username')
            if not username:
                return respond(400, {"error": "username is required"})

            user_id = str(uuid.uuid4())
            users_table.put_item(Item={
                'PK': f"USER#{user_id}",
                'username': username,
                'interests': body.get('interests', []),
                'travel_history': [],
                'verified': False,
                'created_at': datetime.utcnow().isoformat()
            })
            return respond(201, {"userId": user_id, "msg": "Welcome to EcoQuest!"})

        # --- LOGIN USER ---
        elif "/auth/login" in path:
            username = body.get('username') or body.get('email')  # Support both username and email
            if not username:
                return respond(400, {"error": "username or email is required"})

            # Query user by username (this is a simple scan - in production use GSI)
            response = users_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('username').eq(username)
            )
            users = response.get('Items', [])
            
            if not users:
                return respond(401, {"error": "User not found"})
            
            user = users[0]
            user_id = user['PK'].replace('USER#', '')
            
            # Return user data with mock token
            return respond(200, {
                "token": f"mock_token_{user_id}",
                "user": {
                    "id": user_id,
                    "name": user['username'],
                    "interests": user.get('interests', []),
                    "xp": 0,  # Add XP calculation later
                    "level": 1
                }
            })

        # --- PHONE VERIFICATION ---
        elif "/verify" in path:
            phone = body.get('phone')
            user_id = body.get('userId')
            if not phone or not user_id:
                return respond(400, {"error": "phone and userId are required"})

            users_table.update_item(
                Key={'PK': f"USER#{user_id}"},
                UpdateExpression="SET verified = :v, phone = :p",
                ExpressionAttributeValues={':v': True, ':p': phone}
            )
            return respond(200, {"msg": f"Verification sent to {phone}"})

        # --- CREATE A QUEST ---
        elif "/quest/create" in path:
            user_id = body.get('userId')
            species = body.get('species_target', 'Squirrel')
            location = body.get('location', {})
            if not user_id:
                return respond(400, {"error": "userId is required"})

            quest_id = str(uuid.uuid4())
            quests_table.put_item(Item={
                'PK': f"QUEST#{quest_id}",
                'SK': f"USER#{user_id}",
                'species_target': species,
                'location': location,
                'status': 'active',
                'reward_points': 0,
                'created_at': datetime.utcnow().isoformat()
            })
            return respond(201, {"questId": quest_id, "msg": f"Quest started! Find a {species}."})

        # --- STEP 1: GET PRESIGNED URL (phone uploads photo directly to S3) ---
        elif "/photo/upload" in path:
            quest_id = body.get('questId')
            user_id = body.get('userId')

            if not quest_id or not user_id:
                return respond(400, {"error": "questId and userId are required"})

            # Generate unique file name
            photo_key = f"quests/{quest_id}/{uuid.uuid4()}.jpg"

            # Presigned URL — phone uses this to upload directly to S3
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': photo_key,
                    'ContentType': 'image/jpeg'
                },
                ExpiresIn=300  # expires in 5 minutes
            )

            # Save observation record to DynamoDB
            obs_id = str(uuid.uuid4())
            s3_url = f"https://{BUCKET_NAME}.s3.us-east-2.amazonaws.com/{photo_key}"

            observations_table.put_item(Item={
                'PK': f"OBS#{obs_id}",
                'SK': f"QUEST#{quest_id}",
                's3_photo_url': s3_url,
                's3_key': photo_key,
                'species_detected': None,
                'confidence_score': None,
                'verified': False,
                'submitted_at': datetime.utcnow().isoformat()
            })

            return respond(200, {
                "observationId": obs_id,
                "uploadUrl": presigned_url,   # phone uses this to upload
                "s3Url": s3_url,              # permanent URL after upload
                "msg": "Upload your photo using the uploadUrl within 5 minutes"
            })

        # --- STEP 2: VERIFY PHOTO WITH REKOGNITION ---
        elif "/photo/verify" in path:
            obs_id = body.get('observationId')
            quest_id = body.get('questId')
            species_target = body.get('speciesTarget')
            user_id = body.get('userId')

            if not obs_id or not quest_id or not species_target:
                return respond(400, {"error": "observationId, questId and speciesTarget are required"})

            # Get the observation to find the S3 key
            obs = observations_table.get_item(
                Key={'PK': f"OBS#{obs_id}", 'SK': f"QUEST#{quest_id}"}
            ).get('Item')

            if not obs:
                return respond(404, {"error": "Observation not found"})

            # Run Rekognition on the photo
            rek_response = rekognition.detect_labels(
                Image={
                    'S3Object': {
                        'Bucket': BUCKET_NAME,
                        'Name': obs['s3_key']
                    }
                },
                MaxLabels=10,
                MinConfidence=70
            )

            # Extract detected labels
            labels = [label['Name'] for label in rek_response['Labels']]
            top_label = rek_response['Labels'][0] if rek_response['Labels'] else None

            logger.info(f"Rekognition labels: {labels}")

            # Check if target species is in detected labels
            quest_verified = any(
                species_target.lower() in label.lower() for label in labels
            )

            # Update observation with Rekognition results
            observations_table.update_item(
                Key={'PK': f"OBS#{obs_id}", 'SK': f"QUEST#{quest_id}"},
                UpdateExpression="SET species_detected = :s, confidence_score = :c, verified = :v, labels = :l",
                ExpressionAttributeValues={
                    ':s': top_label['Name'] if top_label else None,
                    ':c': str(top_label['Confidence']) if top_label else None,
                    ':v': quest_verified,
                    ':l': labels
                }
            )

            if quest_verified:
                # Mark quest as completed
                quests_table.update_item(
                    Key={'PK': f"QUEST#{quest_id}", 'SK': f"USER#{user_id}"},
                    UpdateExpression="SET #s = :s, completed_at = :t",
                    ExpressionAttributeNames={'#s': 'status'},
                    ExpressionAttributeValues={
                        ':s': 'completed',
                        ':t': datetime.utcnow().isoformat()
                    }
                )
                return respond(200, {
                    "verified": True,
                    "speciesDetected": top_label['Name'] if top_label else None,
                    "confidence": str(top_label['Confidence']) if top_label else None,
                    "labels": labels,
                    "msg": f"Quest complete! You found a {species_target}!"
                })
            else:
                return respond(200, {
                    "verified": False,
                    "speciesDetected": top_label['Name'] if top_label else None,
                    "labels": labels,
                    "msg": f"No {species_target} detected. Try again!"
                })

        # --- GET USER QUESTS ---
        elif "/quests/user/" in path and event.get('httpMethod') == 'GET':
            # Extract user_id from path: /quests/user/{userId}
            path_parts = path.split('/')
            if len(path_parts) >= 4:
                user_id = path_parts[3]
            else:
                return respond(400, {"error": "userId required in path"})

            # Query quests for this user
            response = quests_table.query(
                IndexName='UserQuestsIndex',  # Assuming GSI exists
                KeyConditionExpression=boto3.dynamodb.conditions.Key('SK').eq(f"USER#{user_id}")
            )
            
            quests = response.get('Items', [])
            
            # Format quests for frontend
            formatted_quests = []
            for quest in quests:
                formatted_quests.append({
                    'id': quest['PK'].replace('QUEST#', ''),
                    'species': quest['species_target'],
                    'status': quest.get('status', 'active'),
                    'location': quest.get('location', {}),
                    'xp': quest.get('reward_points', 0),
                    'created_at': quest.get('created_at'),
                    'completed_at': quest.get('completed_at')
                })
            
            return respond(200, {"quests": formatted_quests})

        # --- ADD REWARD POINTS ---
        elif "/rewards/add" in path:
            user_id = body.get('userId')
            points = body.get('points', 0)
            reason = body.get('reason', 'quest_complete')
            movement = body.get('movement_type', 'walking')
            if not user_id:
                return respond(400, {"error": "userId is required"})

            multiplier = 1.5 if movement == 'walking' else 1.0
            final_points = int(points * multiplier)

            rewards_table.put_item(Item={
                'PK': f"USER#{user_id}",
                'SK': f"REWARD#{datetime.utcnow().isoformat()}",
                'points_earned': final_points,
                'multiplier': str(multiplier),
                'reason': reason,
                'movement_type': movement,
                'created_at': datetime.utcnow().isoformat()
            })
            return respond(201, {"pointsAwarded": final_points, "multiplier": multiplier})
        
        # --- MATCH: RECOMMEND COMPATIBLE USERS ---
        elif "/match/recommend" in path:
            import pickle, boto3, numpy as np
            from itertools import combinations

            user_id = body.get('userId')
            group_size = body.get('groupSize', 4)

            if not user_id:
                return respond(400, {"error": "userId is required"})

            # 1. Load the requesting user's answers from DynamoDB
            requester = users_table.get_item(Key={'PK': f"USER#{user_id}"}).get('Item')
            if not requester:
                return respond(404, {"error": "User not found"})

            new_user_answers = requester.get('answers', {})
            if not new_user_answers:
                return respond(400, {"error": "User has no survey answers"})

            # 2. Load model.pkl from S3
            model_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key='ml/model.pkl')
            model = pickle.loads(model_obj['Body'].read())

            kmeans   = model['kmeans']
            encoder  = model['encoder']   # not used directly — we encode manually
            scaler   = model['scaler']
            QUESTIONS = model['questions']
            FEATURE_WEIGHTS = model['weights']

            KEYS = [q['key'] for q in QUESTIONS]
            weight_vec = np.array([FEATURE_WEIGHTS[k] for k in KEYS])

            # 3. Encode helper functions (mirror of notebook)
            def encode_user(answers):
                row = []
                for q in QUESTIONS:
                    val = answers.get(q['key'], q['options'][0])
                    idx = q['options'].index(val) if val in q['options'] else 0
                    row.append(float(idx))
                return np.array(row)

            def compute_similarity(a, b):
                a, b = a * weight_vec, b * weight_vec
                denom = np.linalg.norm(a) * np.linalg.norm(b)
                return float(np.dot(a, b) / denom) if denom > 0 else 0.0

            # 4. Encode the requesting user
            new_vec = encode_user(new_user_answers)
            new_vec_scaled = scaler.transform([new_vec])
            new_cluster = int(kmeans.predict(new_vec_scaled)[0])

            # 5. Scan all other users from DynamoDB
            scan_result = users_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('username').exists()
            )
            all_users = [u for u in scan_result.get('Items', [])
                        if u['PK'] != f"USER#{user_id}" and u.get('answers')]

            # 6. Score each user against the requester
            scored = []
            for u in all_users:
                vec = encode_user(u['answers'])
                score = compute_similarity(new_vec, vec)
                uid = u['PK'].replace('USER#', '')
                scored.append({
                    'userId': uid,
                    'username': u.get('username'),
                    'score': round(score, 4),
                    'cluster': int(kmeans.predict(scaler.transform([vec]))[0]),
                    'answers': u.get('answers', {})
                })

            # 7. Sort by score and return top matches
            scored.sort(key=lambda x: x['score'], reverse=True)
            top_matches = scored[:10]  # return top 10 for the UI

            # Strip answers before returning (frontend doesn't need raw answers)
            for m in top_matches:
                del m['answers']

            return respond(200, {
                "userId": user_id,
                "assignedCluster": new_cluster,
                "recommendedUsers": top_matches
            })

        else:
            return respond(404, {"error": f"Route not found: {path}"})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return respond(500, {"error": "Internal server error", "detail": str(e)})