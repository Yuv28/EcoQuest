import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
table = dynamodb.Table('EcoQuest_Species')

species_list = [
    {
        'PK': 'SPECIES#monarch-butterfly',
        'common_name': 'Monarch Butterfly',
        'scientific_name': 'Danaus plexippus',
        'habitats': ['parks', 'gardens', 'coastal'],
        'active_months': [3, 4, 9, 10, 11],
        'active_temp_min': 55,
        'active_temp_max': 85,
        'active_time': ['morning', 'afternoon'],
        'weather_conditions': ['sunny', 'partly-cloudy'],
        'san_diego_hotspots': [
            {'name': 'Balboa Park', 'lat': '32.7341', 'lng': '-117.1446'},
            {'name': 'Torrey Pines', 'lat': '32.9193', 'lng': '-117.2530'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 3,
        'iNaturalist_taxon_id': 48662,
        'fun_fact': 'Monarchs migrate up to 3000 miles each year!',
        'research_impact': 'high',
        'category': 'insects'
    },
    {
        'PK': 'SPECIES#san-diego-bumblebee',
        'common_name': 'San Diego Bumblebee',
        'scientific_name': 'Bombus crotchii',
        'habitats': ['wildflowers', 'coastal-sage', 'gardens'],
        'active_months': [3, 4, 5, 6, 7, 8],
        'active_temp_min': 55,
        'active_temp_max': 80,
        'active_time': ['morning'],
        'weather_conditions': ['sunny', 'partly-cloudy'],
        'san_diego_hotspots': [
            {'name': 'Mission Trails Regional Park', 'lat': '32.8162', 'lng': '-117.0436'},
            {'name': 'Cabrillo National Monument', 'lat': '32.6735', 'lng': '-117.2425'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 5,
        'iNaturalist_taxon_id': 119019,
        'fun_fact': 'The San Diego Bumblebee is critically endangered and rarely spotted!',
        'research_impact': 'high',
        'category': 'insects'
    },
    {
        'PK': 'SPECIES#ochre-sea-star',
        'common_name': 'Ochre Sea Star',
        'scientific_name': 'Pisaster ochraceus',
        'habitats': ['tide-pools', 'rocky-shore'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 40,
        'active_temp_max': 75,
        'active_time': ['morning', 'afternoon'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'overcast'],
        'san_diego_hotspots': [
            {'name': 'Cabrillo Tide Pools', 'lat': '32.6719', 'lng': '-117.2431'},
            {'name': 'La Jolla Cove', 'lat': '32.8508', 'lng': '-117.2727'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 2,
        'iNaturalist_taxon_id': 43706,
        'fun_fact': 'Sea stars can regenerate lost arms over several months!',
        'research_impact': 'high',
        'category': 'marine'
    },
    {
        'PK': 'SPECIES#burrowing-owl',
        'common_name': 'Burrowing Owl',
        'scientific_name': 'Athene cunicularia',
        'habitats': ['grasslands', 'open-fields', 'airports'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 45,
        'active_temp_max': 90,
        'active_time': ['dawn', 'dusk'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'clear'],
        'san_diego_hotspots': [
            {'name': 'Otay Mesa', 'lat': '32.5707', 'lng': '-116.9800'},
            {'name': 'Marine Corps Air Station Miramar', 'lat': '32.8684', 'lng': '-117.1425'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 20,
        'iNaturalist_taxon_id': 71965,
        'fun_fact': 'Burrowing Owls are one of the smallest owls in North America!',
        'research_impact': 'high',
        'category': 'birds'
    },
    {
        'PK': 'SPECIES#squirrel',
        'common_name': 'California Ground Squirrel',
        'scientific_name': 'Otospermophilus beecheyi',
        'habitats': ['parks', 'urban-trees', 'grasslands'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 45,
        'active_temp_max': 95,
        'active_time': ['morning', 'afternoon'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'overcast'],
        'san_diego_hotspots': [
            {'name': 'Balboa Park', 'lat': '32.7341', 'lng': '-117.1446'},
            {'name': 'Sunset Cliffs', 'lat': '32.7191', 'lng': '-117.2567'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 10,
        'iNaturalist_taxon_id': 64548,
        'fun_fact': 'Ground squirrels are immune to rattlesnake venom!',
        'research_impact': 'medium',
        'category': 'mammals'
    },
    {
        'PK': 'SPECIES#brown-pelican',
        'common_name': 'Brown Pelican',
        'scientific_name': 'Pelecanus occidentalis',
        'habitats': ['beaches', 'bays', 'coastal'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 50,
        'active_temp_max': 90,
        'active_time': ['morning', 'afternoon'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'overcast'],
        'san_diego_hotspots': [
            {'name': 'La Jolla Cove', 'lat': '32.8508', 'lng': '-117.2727'},
            {'name': 'Mission Bay', 'lat': '32.7693', 'lng': '-117.2282'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 15,
        'iNaturalist_taxon_id': 4849,
        'fun_fact': 'Brown Pelicans were once endangered but made a full comeback!',
        'research_impact': 'high',
        'category': 'birds'
    },
    {
        'PK': 'SPECIES#ridgways-rail',
        'common_name': "Ridgway's Rail",
        'scientific_name': 'Rallus obsoletus',
        'habitats': ['salt-marshes', 'wetlands'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 45,
        'active_temp_max': 85,
        'active_time': ['dawn', 'dusk'],
        'weather_conditions': ['overcast', 'partly-cloudy', 'sunny'],
        'san_diego_hotspots': [
            {'name': 'Tijuana Estuary', 'lat': '32.5707', 'lng': '-117.1243'},
            {'name': 'San Diego Bay Wildlife Refuge', 'lat': '32.6141', 'lng': '-117.1100'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 30,
        'iNaturalist_taxon_id': 8231,
        'fun_fact': "Ridgway's Rail is endangered with only ~1000 left in the wild!",
        'research_impact': 'high',
        'category': 'birds'
    },
    {
        'PK': 'SPECIES#great-blue-heron',
        'common_name': 'Great Blue Heron',
        'scientific_name': 'Ardea herodias',
        'habitats': ['lakes', 'wetlands', 'coastal', 'rivers'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 40,
        'active_temp_max': 95,
        'active_time': ['morning', 'afternoon', 'dusk'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'overcast'],
        'san_diego_hotspots': [
            {'name': 'Lake Murray', 'lat': '32.7799', 'lng': '-117.0436'},
            {'name': 'San Elijo Lagoon', 'lat': '33.0158', 'lng': '-117.2800'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 20,
        'iNaturalist_taxon_id': 4849,
        'fun_fact': 'Great Blue Herons can stand still for hours waiting for fish!',
        'research_impact': 'medium',
        'category': 'birds'
    },
    {
        'PK': 'SPECIES#snowy-egret',
        'common_name': 'Snowy Egret',
        'scientific_name': 'Egretta thula',
        'habitats': ['wetlands', 'estuaries', 'coastal', 'lagoons'],
        'active_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'active_temp_min': 45,
        'active_temp_max': 90,
        'active_time': ['morning', 'afternoon'],
        'weather_conditions': ['sunny', 'partly-cloudy', 'overcast'],
        'san_diego_hotspots': [
            {'name': 'Famosa Slough', 'lat': '32.7565', 'lng': '-117.2199'},
            {'name': 'Batiquitos Lagoon', 'lat': '33.0900', 'lng': '-117.3000'}
        ],
        'human_friendly': True,
        'approach_distance_ft': 15,
        'iNaturalist_taxon_id': 13859,
        'fun_fact': 'Snowy Egrets were nearly hunted to extinction for their feathers in the 1800s!',
        'research_impact': 'medium',
        'category': 'birds'
    }
]

def seed_species():
    success = 0
    for species in species_list:
        try:
            table.put_item(Item=species)
            print(f"✓ Added: {species['common_name']}")
            success += 1
        except Exception as e:
            print(f"✗ Failed: {species['common_name']} — {str(e)}")
    
    print(f"\nDone! {success}/{len(species_list)} species added to EcoQuest_Species")

if __name__ == '__main__':
    seed_species()
