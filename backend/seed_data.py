#!/usr/bin/env python
"""
SeedSync Backend - Sample Data Seeder
Creates demo data for hackathon demonstration
"""
import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.farmers.models import FarmerProfile, FarmLand
from apps.fpos.models import FPOProfile, FPOMembership
from apps.processors.models import ProcessorProfile, ProcessingPlant
from apps.retailers.models import RetailerProfile, Store
from apps.lots.models import ProcurementLot
from apps.crops.models import CropMaster, CropVariety, MandiPrice, MSPRecord

User = get_user_model()

print("🌾 SeedSync Sample Data Seeder")
print("=" * 50)

# -------------------------------------------------------------
# CROP MASTER DATA
# -------------------------------------------------------------
print("\n🌱 Creating crop master data...")

crop_masters_data = [
    {
        'crop_code': 'SOYBEAN01',
        'crop_name': 'soybean',
        'hindi_name': 'सोयाबीन',
        'scientific_name': 'Glycine max',
        'oil_content_percentage': 18.5,
        'growing_season': ['kharif'],
        'maturity_days': 95,
        'water_requirement': 'medium',
        'suitable_soil_types': ['Black Cotton', 'Red Loamy', 'Alluvial'],
        'suitable_states': ['Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Karnataka'],
        'description': 'Soybean is a major oilseed and protein crop grown during kharif season.',
        'cultivation_tips': 'Requires well-drained soil, moderate rainfall, and timely weed management.'
    },
    {
        'crop_code': 'MUSTARD01',
        'crop_name': 'mustard',
        'hindi_name': 'सरसों',
        'scientific_name': 'Brassica juncea',
        'oil_content_percentage': 40.0,
        'growing_season': ['rabi'],
        'maturity_days': 120,
        'water_requirement': 'low',
        'suitable_soil_types': ['Loamy', 'Sandy Loam', 'Clay Loam'],
        'suitable_states': ['Rajasthan', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh'],
        'description': 'Mustard is a major rabi oilseed crop with high oil content.',
        'cultivation_tips': 'Grows well in cool weather, requires minimal irrigation.'
    },
    {
        'crop_code': 'GROUNDNUT01',
        'crop_name': 'groundnut',
        'hindi_name': 'मूंगफली',
        'scientific_name': 'Arachis hypogaea',
        'oil_content_percentage': 48.0,
        'growing_season': ['kharif', 'rabi'],
        'maturity_days': 110,
        'water_requirement': 'medium',
        'suitable_soil_types': ['Sandy Loam', 'Red Soil', 'Black Soil'],
        'suitable_states': ['Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'Maharashtra'],
        'description': 'Groundnut is a major oilseed crop with high oil and protein content.',
        'cultivation_tips': 'Requires well-drained sandy loam soil and calcium for pod development.'
    },
    {
        'crop_code': 'SUNFLOWER01',
        'crop_name': 'sunflower',
        'hindi_name': 'सूरजमुखी',
        'scientific_name': 'Helianthus annuus',
        'oil_content_percentage': 40.0,
        'growing_season': ['kharif', 'rabi'],
        'maturity_days': 90,
        'water_requirement': 'medium',
        'suitable_soil_types': ['Loamy', 'Clay Loam', 'Sandy Loam'],
        'suitable_states': ['Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Tamil Nadu'],
        'description': 'Sunflower is a fast-growing oilseed crop suitable for both seasons.',
        'cultivation_tips': 'Adaptable to various soil types, requires good drainage and sunlight.'
    },
    {
        'crop_code': 'SESAME01',
        'crop_name': 'sesame',
        'hindi_name': 'तिल',
        'scientific_name': 'Sesamum indicum',
        'oil_content_percentage': 50.0,
        'growing_season': ['kharif', 'summer'],
        'maturity_days': 85,
        'water_requirement': 'low',
        'suitable_soil_types': ['Sandy Loam', 'Red Soil', 'Black Soil'],
        'suitable_states': ['Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'],
        'description': 'Sesame is a drought-tolerant oilseed crop with highest oil content.',
        'cultivation_tips': 'Grows well in warm climate, minimal water requirement.'
    },
]

crop_masters = []
for data in crop_masters_data:
    crop, created = CropMaster.objects.get_or_create(
        crop_code=data['crop_code'],
        defaults=data
    )
    crop_masters.append(crop)
    status = "Created" if created else "Exists"
    print(f"  ✓ {status}: {crop.crop_name} ({crop.hindi_name})")

# -------------------------------------------------------------
# CROP VARIETIES DATA
# -------------------------------------------------------------
print("\n🌾 Creating crop varieties...")

varieties_data = [
    # Soybean Varieties
    {
        'crop_code': 'SOYBEAN01',
        'variety_name': 'JS 335',
        'variety_code': 'SOY-JS335',
        'maturity_days': 95,
        'yield_potential_quintals_per_acre': 12.0,
        'oil_content_percentage': 19.5,
        'season': 'kharif',
        'suitable_regions': ['Maharashtra', 'Madhya Pradesh', 'Rajasthan'],
        'disease_resistance': ['Yellow Mosaic Virus', 'Bacterial Blight'],
        'description': 'Most popular soybean variety with excellent yield and disease resistance.',
        'seed_rate_kg_per_acre': 30.0
    },
    {
        'crop_code': 'SOYBEAN01',
        'variety_name': 'JS 95-60',
        'variety_code': 'SOY-JS9560',
        'maturity_days': 92,
        'yield_potential_quintals_per_acre': 13.5,
        'oil_content_percentage': 20.0,
        'season': 'kharif',
        'suitable_regions': ['Maharashtra', 'Karnataka', 'Madhya Pradesh'],
        'disease_resistance': ['Yellow Mosaic Virus', 'Rust', 'Leaf Spot'],
        'description': 'High-yielding variety with better oil content.',
        'seed_rate_kg_per_acre': 32.0
    },
    {
        'crop_code': 'SOYBEAN01',
        'variety_name': 'MAUS 71',
        'variety_code': 'SOY-MAUS71',
        'maturity_days': 90,
        'yield_potential_quintals_per_acre': 11.5,
        'oil_content_percentage': 19.0,
        'season': 'kharif',
        'suitable_regions': ['Maharashtra', 'Gujarat'],
        'disease_resistance': ['Yellow Mosaic Virus'],
        'description': 'Early maturing variety suitable for Maharashtra region.',
        'seed_rate_kg_per_acre': 28.0
    },
    
    # Mustard Varieties
    {
        'crop_code': 'MUSTARD01',
        'variety_name': 'Pusa Bold',
        'variety_code': 'MUS-PBOLD',
        'maturity_days': 120,
        'yield_potential_quintals_per_acre': 8.0,
        'oil_content_percentage': 40.0,
        'season': 'rabi',
        'suitable_regions': ['Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan'],
        'disease_resistance': ['White Rust', 'Alternaria Blight'],
        'description': 'High-yielding mustard variety with bold seeds.',
        'seed_rate_kg_per_acre': 2.0
    },
    {
        'crop_code': 'MUSTARD01',
        'variety_name': 'Varuna',
        'variety_code': 'MUS-VARUNA',
        'maturity_days': 125,
        'yield_potential_quintals_per_acre': 8.5,
        'oil_content_percentage': 41.0,
        'season': 'rabi',
        'suitable_regions': ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'],
        'disease_resistance': ['White Rust'],
        'description': 'Popular variety with higher oil content.',
        'seed_rate_kg_per_acre': 2.5
    },
    {
        'crop_code': 'MUSTARD01',
        'variety_name': 'Pusa Mustard 25 (NPJ-112)',
        'variety_code': 'MUS-PM25',
        'maturity_days': 115,
        'yield_potential_quintals_per_acre': 9.0,
        'oil_content_percentage': 39.5,
        'season': 'rabi',
        'suitable_regions': ['Haryana', 'Punjab', 'Delhi'],
        'disease_resistance': ['White Rust', 'Alternaria Blight', 'Powdery Mildew'],
        'description': 'Early maturing, high-yielding variety with multiple disease resistance.',
        'seed_rate_kg_per_acre': 2.0
    },
    
    # Groundnut Varieties
    {
        'crop_code': 'GROUNDNUT01',
        'variety_name': 'TAG 24',
        'variety_code': 'GNT-TAG24',
        'maturity_days': 110,
        'yield_potential_quintals_per_acre': 10.0,
        'oil_content_percentage': 48.0,
        'season': 'kharif',
        'suitable_regions': ['Gujarat', 'Andhra Pradesh', 'Karnataka'],
        'disease_resistance': ['Tikka Disease', 'Rust'],
        'description': 'Widely cultivated groundnut variety with good oil content.',
        'seed_rate_kg_per_acre': 40.0
    },
    {
        'crop_code': 'GROUNDNUT01',
        'variety_name': 'Kadiri 6',
        'variety_code': 'GNT-K6',
        'maturity_days': 115,
        'yield_potential_quintals_per_acre': 11.0,
        'oil_content_percentage': 49.0,
        'season': 'kharif',
        'suitable_regions': ['Andhra Pradesh', 'Karnataka', 'Tamil Nadu'],
        'disease_resistance': ['Tikka Disease', 'Leaf Spot'],
        'description': 'High-yielding variety developed for South India.',
        'seed_rate_kg_per_acre': 42.0
    },
    {
        'crop_code': 'GROUNDNUT01',
        'variety_name': 'GG 20',
        'variety_code': 'GNT-GG20',
        'maturity_days': 105,
        'yield_potential_quintals_per_acre': 9.5,
        'oil_content_percentage': 47.5,
        'season': 'rabi',
        'suitable_regions': ['Gujarat', 'Maharashtra'],
        'disease_resistance': ['Rust', 'Tikka Disease'],
        'description': 'Short duration variety suitable for rabi season.',
        'seed_rate_kg_per_acre': 38.0
    },
    
    # Sunflower Varieties
    {
        'crop_code': 'SUNFLOWER01',
        'variety_name': 'KBSH 44',
        'variety_code': 'SUN-KBSH44',
        'maturity_days': 90,
        'yield_potential_quintals_per_acre': 7.5,
        'oil_content_percentage': 40.0,
        'season': 'kharif',
        'suitable_regions': ['Karnataka', 'Andhra Pradesh', 'Maharashtra'],
        'disease_resistance': ['Downy Mildew', 'Rust'],
        'description': 'Hybrid variety with uniform maturity and high oil content.',
        'seed_rate_kg_per_acre': 2.5
    },
    {
        'crop_code': 'SUNFLOWER01',
        'variety_name': 'MSFH 17',
        'variety_code': 'SUN-MSFH17',
        'maturity_days': 85,
        'yield_potential_quintals_per_acre': 8.0,
        'oil_content_percentage': 41.0,
        'season': 'rabi',
        'suitable_regions': ['Karnataka', 'Maharashtra', 'Tamil Nadu'],
        'disease_resistance': ['Downy Mildew', 'Alternaria Blight'],
        'description': 'Early maturing hybrid with excellent yield potential.',
        'seed_rate_kg_per_acre': 2.5
    },
    {
        'crop_code': 'SUNFLOWER01',
        'variety_name': 'PAC 36',
        'variety_code': 'SUN-PAC36',
        'maturity_days': 95,
        'yield_potential_quintals_per_acre': 8.5,
        'oil_content_percentage': 42.0,
        'season': 'kharif',
        'suitable_regions': ['Andhra Pradesh', 'Karnataka', 'Maharashtra'],
        'disease_resistance': ['Rust', 'Powdery Mildew'],
        'description': 'High oil content variety with good disease tolerance.',
        'seed_rate_kg_per_acre': 3.0
    },
    
    # Sesame Varieties
    {
        'crop_code': 'SESAME01',
        'variety_name': 'Gujarat Til 10',
        'variety_code': 'SES-GT10',
        'maturity_days': 85,
        'yield_potential_quintals_per_acre': 2.5,
        'oil_content_percentage': 50.0,
        'season': 'kharif',
        'suitable_regions': ['Gujarat', 'Rajasthan', 'Madhya Pradesh'],
        'disease_resistance': ['Phyllody Disease'],
        'description': 'Popular sesame variety with high oil content.',
        'seed_rate_kg_per_acre': 1.5
    },
    {
        'crop_code': 'SESAME01',
        'variety_name': 'TKG 22',
        'variety_code': 'SES-TKG22',
        'maturity_days': 80,
        'yield_potential_quintals_per_acre': 2.8,
        'oil_content_percentage': 51.0,
        'season': 'kharif',
        'suitable_regions': ['Gujarat', 'Madhya Pradesh', 'Rajasthan'],
        'disease_resistance': ['Phyllody Disease', 'Bacterial Blight'],
        'description': 'Early maturing variety with excellent oil quality.',
        'seed_rate_kg_per_acre': 1.5
    },
    {
        'crop_code': 'SESAME01',
        'variety_name': 'Rama',
        'variety_code': 'SES-RAMA',
        'maturity_days': 90,
        'yield_potential_quintals_per_acre': 3.0,
        'oil_content_percentage': 49.5,
        'season': 'summer',
        'suitable_regions': ['Uttar Pradesh', 'Madhya Pradesh', 'Bihar'],
        'disease_resistance': ['Phyllody Disease'],
        'description': 'Summer season variety with good yield potential.',
        'seed_rate_kg_per_acre': 2.0
    },
]

# Create varieties
crop_varieties = []
for var_data in varieties_data:
    crop_code = var_data.pop('crop_code')
    crop_master = CropMaster.objects.get(crop_code=crop_code)
    
    variety, created = CropVariety.objects.get_or_create(
        variety_code=var_data['variety_code'],
        defaults={**var_data, 'crop': crop_master}
    )
    crop_varieties.append(variety)
    status = "Created" if created else "Exists"
    print(f"  ✓ {status}: {variety.variety_name} - {crop_master.get_crop_name_display()}")

# -------------------------------------------------------------
# USERS
# -------------------------------------------------------------
print("\n📱 Creating users...")

# Create farmers
farmer_users = []
for i in range(10):
    user, created = User.objects.get_or_create(
        phone_number=f"+9198765432{i:02d}",
        defaults={'role': 'farmer', 'is_verified': True}
    )
    if created:
        user.set_password('farmer123')
        user.save()
    farmer_users.append(user)
    print(f"  ✓ Farmer {i+1}: {user.phone_number}")

# Create FPO user
fpo_user, created = User.objects.get_or_create(
    phone_number="+919876000001",
    defaults={'role': 'fpo', 'is_verified': True}
)
if created:
    fpo_user.set_password('fpo123')
    fpo_user.save()
print(f"  ✓ FPO: {fpo_user.phone_number}")

# Create processor users
processor_users = []
for i in range(3):
    user, created = User.objects.get_or_create(
        phone_number=f"+9198760001{i:02d}",
        defaults={'role': 'processor', 'is_verified': True}
    )
    if created:
        user.set_password('processor123')
        user.save()
    processor_users.append(user)
    print(f"  ✓ Processor {i+1}: {user.phone_number}")

# Create retailer users
retailer_users = []
for i in range(3):
    user, created = User.objects.get_or_create(
        phone_number=f"+9198760002{i:02d}",
        defaults={'role': 'retailer', 'is_verified': True}
    )
    if created:
        user.set_password('retailer123')
        user.save()
    retailer_users.append(user)
    print(f"  ✓ Retailer {i+1}: {user.phone_number}")

# Create government user
gov_user, created = User.objects.get_or_create(
    phone_number="+919876000099",
    defaults={'role': 'government', 'is_verified': True, 'is_staff': True}
)
if created:
    gov_user.set_password('gov123')
    gov_user.save()
print(f"  ✓ Government: {gov_user.phone_number}")

# -------------------------------------------------------------
# FPO PROFILE
# -------------------------------------------------------------
print("\n🏢 Creating FPO profile...")
fpo_profile, created = FPOProfile.objects.get_or_create(
    user=fpo_user,
    defaults={
        'organization_name': 'Vidarbha Farmers Collective',
        'registration_number': 'FPO2023001',
        'registration_type': 'fpo',
        'year_of_registration': 2023,
        'district': 'Nagpur',
        'state': 'Maharashtra',
        'pincode': '440001',
        'office_address': 'Katol Road, Nagpur',
        'total_members': 250,
        'active_members': 250,
        'primary_crops': ['soybean', 'mustard'],
        'is_verified': True,
        'latitude': 21.1458,
        'longitude': 79.0882
    }
)
print(f"  ✓ {fpo_profile.organization_name}")

# -------------------------------------------------------------
# FARMER PROFILES
# -------------------------------------------------------------
print("\n👨‍🌾 Creating farmer profiles...")

farmer_names = [
    "Ramesh Kumar", "Suresh Patil", "Mahesh Deshmukh", "Rajesh Singh",
    "Prakash Jadhav", "Ganesh Raut", "Dinesh Kamble", "Santosh More",
    "Vikas Shinde", "Anil Pawar"
]

farmer_profiles = []
for i, (user, name) in enumerate(zip(farmer_users, farmer_names)):
    profile, created = FarmerProfile.objects.get_or_create(
        user=user,
        defaults={
            'full_name': name,
            'gender': 'male',
            'district': 'Nagpur',
            'state': 'Maharashtra',
            'village': f'Village {i+1}',
            'pincode': '440001',
            'total_land_acres': random.uniform(2, 10),
            'farming_experience_years': random.randint(5, 30),
            'primary_crops': random.sample(['soybean', 'mustard', 'groundnut'], 2),
            'kyc_status': 'verified',
            'bank_account_number': f'1234567890{i:02d}',
            'ifsc_code': 'SBIN0001234',
            'latitude': 21.1458 + random.uniform(-0.5, 0.5),
            'longitude': 79.0882 + random.uniform(-0.5, 0.5),
            'fpo': fpo_profile if i < 7 else None
        }
    )
    farmer_profiles.append(profile)
    print(f"  ✓ {profile.full_name}")

# -------------------------------------------------------------
# FPO MEMBERSHIPS
# -------------------------------------------------------------
print("\n🤝 Creating FPO memberships...")
for profile in farmer_profiles[:7]:
    membership, created = FPOMembership.objects.get_or_create(
        farmer=profile,
        fpo=fpo_profile,
        defaults={
            'joined_date': datetime.now().date() - timedelta(days=random.randint(30, 365)),
            'share_capital': random.randint(500, 2000),
            'is_active': True
        }
    )
    if created:
        print(f"  ✓ {profile.full_name} joined {fpo_profile.organization_name}")

# -------------------------------------------------------------
# PROCESSOR PROFILES
# -------------------------------------------------------------
print("\n🏭 Creating processor profiles...")

processor_companies = [
    "Maharashtra Oil Mills Ltd",
    "Vidarbha Processing Industries",
    "Central India Oilseeds Processor"
]

processor_profiles = []
for i, (user, company) in enumerate(zip(processor_users, processor_companies)):
    profile, created = ProcessorProfile.objects.get_or_create(
        user=user,
        defaults={
            'company_name': company,
            'contact_person': f'Manager {i+1}',
            'phone': f'+9198760001{i:02d}',
            'email': f'processor{i+1}@example.com',
            'address': f'Industrial Area, Zone {i+1}',
            'city': 'Nagpur',
            'state': 'Maharashtra',
            'processing_capacity_quintals_per_day': random.uniform(100, 500),
            'is_verified': True
        }
    )
    processor_profiles.append(profile)
    print(f"  ✓ {company}")

# -------------------------------------------------------------
# PROCESSING PLANTS
# -------------------------------------------------------------
print("\n🏭 Creating processing plants...")

for i, profile in enumerate(processor_profiles):
    plant, created = ProcessingPlant.objects.get_or_create(
        processor=profile,
        plant_name=f"{profile.company_name} - Main Plant",
        defaults={
            'address': f'Plot No. {i+1}, MIDC Industrial Estate',
            'city': 'Nagpur',
            'state': 'Maharashtra',
            'capacity_quintals_per_day': random.uniform(80, 400)
        }
    )
    if created:
        print(f"  ✓ {plant.plant_name}")

# -------------------------------------------------------------
# RETAILER PROFILES
# -------------------------------------------------------------
print("\n🏪 Creating retailer profiles...")

retailer_businesses = [
    "Shree Krishna Oil Traders",
    "Mahesh Oil & Grains Store",
    "Balaji Agro Products"
]

retailer_profiles = []
for i, (user, business) in enumerate(zip(retailer_users, retailer_businesses)):
    profile, created = RetailerProfile.objects.get_or_create(
        user=user,
        defaults={
            'business_name': business,
            'contact_person': f'Owner {i+1}',
            'phone': f'+9198760002{i:02d}',
            'email': f'retailer{i+1}@example.com',
            'address': f'Shop No. {i+1}, Market Road',
            'city': 'Nagpur',
            'state': 'Maharashtra',
            'is_verified': True
        }
    )
    retailer_profiles.append(profile)
    print(f"  ✓ {business}")

# -------------------------------------------------------------
# RETAIL STORES
# -------------------------------------------------------------
print("\n🏪 Creating retail stores...")

for i, profile in enumerate(retailer_profiles):
    store, created = Store.objects.get_or_create(
        retailer=profile,
        store_name=f"{profile.business_name} - Main Branch",
        defaults={
            'address': f'{i+10}, Gandhi Chowk, Civil Lines',
            'city': 'Nagpur',
            'state': 'Maharashtra'
        }
    )
    if created:
        print(f"  ✓ {store.store_name}")

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n" + "=" * 50)
print("✅ Sample data created successfully!")
print("\n📊 Summary:")
print(f"  - Users: {User.objects.count()}")
print(f"  - Crop Masters: {CropMaster.objects.count()}")
print(f"  - Crop Varieties: {CropVariety.objects.count()}")
print(f"  - Farmers: {FarmerProfile.objects.count()}")
print(f"  - FPOs: {FPOProfile.objects.count()}")
print(f"  - Processors: {ProcessorProfile.objects.count()}")
print(f"  - Processing Plants: {ProcessingPlant.objects.count()}")
print(f"  - Retailers: {RetailerProfile.objects.count()}")
print(f"  - Stores: {Store.objects.count()}")

print("\n🔑 Test Credentials:")
print("  Farmer: +919876543200 / farmer123")
print("  FPO: +919876000001 / fpo123")
print("  Processor: +919876000100 / processor123")
print("  Retailer: +919876000200 / retailer123")
print("  Government: +919876000099 / gov123")

print("\n🚀 Ready to demo!")
