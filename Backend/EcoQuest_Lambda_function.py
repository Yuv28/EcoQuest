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

        else:
            return respond(404, {"error": f"Route not found: {path}"})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return respond(500, {"error": "Internal server error", "detail": str(e)})