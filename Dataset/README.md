# Datasets used and generated

## Database Tables (Amazon DynamoDB)

| Table | Description |
|---|---|
| `EcoQuest_Users` | Stores every registered user - username, interests, phone number, verified status, and travel history |
| `EcoQuest_Quests` | Tracks every quest - target species, assigned group, location, hotspot, weather snapshot, and status (active/completed/failed) |
| `EcoQuest_Observations` | Stores photo evidence submitted by users - S3 photo URL, species detected by Rekognition, and whether it matched the quest target |
| `EcoQuest_Rewards` | Records every points transaction — points earned, movement multiplier (walking = 1.5x, biking = 1.0x, driving = 0), and reward reason |
| `EcoQuest_Stores` | Caches nearby eco-friendly pet stores from Google Places API - reduces API calls by storing store name, address, and coordinates by geohash |
| `EcoQuest_Species` | Master list of all 9 target species - habitats, active months, temperature ranges, San Diego hotspots, approach distances, iNaturalist IDs, and fun facts |
| `EcoQuest_Groups` | Tracks friend groups on quests together - group members, active quest, and group status |
| `mostAbundant` | Image data of the 100 most abundant species in San Diego to use for CV model |
