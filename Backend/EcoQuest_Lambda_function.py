import boto3
import json
import uuid
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')

users_table        = dynamodb.Table('EcoQuest_Users')
quests_table       = dynamodb.Table('EcoQuest_Quests')
observations_table = dynamodb.Table('EcoQuest_Observations')
rewards_table      = dynamodb.Table('EcoQuest_Rewards')
stores_table       = dynamodb.Table('EcoQuest_Stores')
species_table = dynamodb.Table('EcoQuest_Species')
groups_table  = dynamodb.Table('EcoQuest_Groups')

def respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body)
    }

def lambda_handler(event, context):
    logger.info(f"Event: {json.dumps(event)}")

    path = event.get('rawPath') or event.get('path', '')

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return respond(400, {"error": "Invalid JSON in request body"})

    try:

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
            # TODO: trigger SNS SMS here
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

        # --- SUBMIT OBSERVATION (photo) ---
        elif "/observation/submit" in path:
            quest_id = body.get('questId')
            s3_url = body.get('s3_photo_url')
            if not quest_id or not s3_url:
                return respond(400, {"error": "questId and s3_photo_url are required"})

            obs_id = str(uuid.uuid4())
            observations_table.put_item(Item={
                'PK': f"OBS#{obs_id}",
                'SK': f"QUEST#{quest_id}",
                's3_photo_url': s3_url,
                'species_detected': None,
                'verified': False,
                'submitted_at': datetime.utcnow().isoformat()
            })
            return respond(201, {"observationId": obs_id, "msg": "Photo submitted for review."})

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