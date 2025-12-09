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
from apps.fpos.models import FPOProfile, FPOMembership, FPOWarehouse
from apps.processors.models import ProcessorProfile, ProcessingPlant
from apps.retailers.models import RetailerProfile, Store
from apps.lots.models import ProcurementLot, LotImage
from apps.crops.models import CropMaster, CropVariety, MandiPrice, MSPRecord
from apps.bids.models import Bid, BidAcceptance
from apps.logistics.models import LogisticsPartner, Vehicle, Shipment
from apps.payments.models import Payment, Wallet
from apps.warehouses.models import Warehouse, Inventory, StockMovement
from apps.marketplace.models import Listing, Order, Review
from datetime import date
from decimal import Decimal
from django.utils import timezone

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
# MSP RECORDS
# -------------------------------------------------------------
print("\n💰 Creating MSP records...")

msp_data = [
    # Kharif Season 2024-25
    {
        'crop_type': 'groundnut',
        'year': 2024,
        'season': 'kharif',
        'msp_per_quintal': 6377.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/KHARIF/001',
        'notification_date': date(2024, 6, 12),
        'effective_from': date(2024, 6, 15),
        'effective_to': date(2025, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2024-25 - Groundnut (in shell)'
    },
    {
        'crop_type': 'soybean',
        'year': 2024,
        'season': 'kharif',
        'msp_per_quintal': 4892.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/KHARIF/002',
        'notification_date': date(2024, 6, 12),
        'effective_from': date(2024, 6, 15),
        'effective_to': date(2025, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2024-25 - Soybean (yellow)'
    },
    {
        'crop_type': 'sunflower',
        'year': 2024,
        'season': 'kharif',
        'msp_per_quintal': 7050.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/KHARIF/003',
        'notification_date': date(2024, 6, 12),
        'effective_from': date(2024, 6, 15),
        'effective_to': date(2025, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2024-25 - Sunflower Seed'
    },
    {
        'crop_type': 'sesame',
        'year': 2024,
        'season': 'kharif',
        'msp_per_quintal': 8635.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/KHARIF/004',
        'notification_date': date(2024, 6, 12),
        'effective_from': date(2024, 6, 15),
        'effective_to': date(2025, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2024-25 - Sesamum'
    },
    # Rabi Season 2024-25
    {
        'crop_type': 'mustard',
        'year': 2024,
        'season': 'rabi',
        'msp_per_quintal': 5650.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/RABI/001',
        'notification_date': date(2024, 9, 18),
        'effective_from': date(2024, 10, 1),
        'effective_to': date(2025, 9, 30),
        'notes': 'MSP for Rabi Marketing Season 2024-25 - Rapeseed & Mustard'
    },
    {
        'crop_type': 'groundnut',
        'year': 2024,
        'season': 'rabi',
        'msp_per_quintal': 6377.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/RABI/002',
        'notification_date': date(2024, 9, 18),
        'effective_from': date(2024, 10, 1),
        'effective_to': date(2025, 9, 30),
        'notes': 'MSP for Rabi Marketing Season 2024-25 - Groundnut (in shell)'
    },
    {
        'crop_type': 'sunflower',
        'year': 2024,
        'season': 'rabi',
        'msp_per_quintal': 7050.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2024-25/RABI/003',
        'notification_date': date(2024, 9, 18),
        'effective_from': date(2024, 10, 1),
        'effective_to': date(2025, 9, 30),
        'notes': 'MSP for Rabi Marketing Season 2024-25 - Sunflower Seed'
    },
]

for msp_info in msp_data:
    record, created = MSPRecord.objects.update_or_create(
        crop_type=msp_info['crop_type'],
        year=msp_info['year'],
        season=msp_info['season'],
        defaults={
            'msp_per_quintal': msp_info['msp_per_quintal'],
            'bonus_per_quintal': msp_info['bonus_per_quintal'],
            'notification_number': msp_info['notification_number'],
            'notification_date': msp_info['notification_date'],
            'effective_from': msp_info['effective_from'],
            'effective_to': msp_info['effective_to'],
            'notes': msp_info['notes']
        }
    )
    status = "Created" if created else "Updated"
    print(f"  ✓ {status}: {record.get_crop_type_display()} - {record.get_season_display()} {record.year} - ₹{record.msp_per_quintal}/quintal")

# -------------------------------------------------------------
# WAREHOUSES & FPO WAREHOUSES
# -------------------------------------------------------------
print("\n🏭 Creating warehouses...")

# Get FPO for warehouse association
fpo_profiles = list(FPOProfile.objects.all())

if fpo_profiles:
    # Use the first FPO for all warehouses (since we only have one)
    main_fpo = fpo_profiles[0]
    
    warehouses_data = [
        {
            'warehouse_name': 'Gujarat Groundnut Storage Hub',
            'warehouse_code': 'WH-GJ-001',
            'warehouse_type': 'warehouse',
            'address': 'APMC Yard, Rajkot',
            'district': 'Rajkot',
            'state': 'Gujarat',
            'pincode': '360001',
            'capacity_quintals': Decimal('5000.00'),
            'current_stock_quintals': Decimal('3200.00'),
            'fpo': main_fpo,
        },
        {
            'warehouse_name': 'Maharashtra Soybean Warehouse',
            'warehouse_code': 'WH-MH-002',
            'warehouse_type': 'warehouse',
            'address': 'Agri Complex, Latur',
            'district': 'Latur',
            'state': 'Maharashtra',
            'pincode': '413512',
            'capacity_quintals': Decimal('8000.00'),
            'current_stock_quintals': Decimal('5400.00'),
            'fpo': main_fpo,
        },
        {
            'warehouse_name': 'Rajasthan Mustard Storage',
            'warehouse_code': 'WH-RJ-003',
            'warehouse_type': 'godown',
            'address': 'Mandi Samiti, Jaipur',
            'district': 'Jaipur',
            'state': 'Rajasthan',
            'pincode': '302001',
            'capacity_quintals': Decimal('6000.00'),
            'current_stock_quintals': Decimal('4100.00'),
            'fpo': main_fpo,
        },
    ]

    fpo_warehouses = []
    for wh_data in warehouses_data:
        warehouse, created = FPOWarehouse.objects.get_or_create(
            warehouse_code=wh_data['warehouse_code'],
            defaults=wh_data
        )
        fpo_warehouses.append(warehouse)
        status = "Created" if created else "Exists"
        print(f"  ✓ {status}: {warehouse.warehouse_name} ({warehouse.district})")
else:
    fpo_warehouses = []
    print("  ⚠ No FPO found, skipping warehouse creation")

# -------------------------------------------------------------
# PROCUREMENT LOTS
# -------------------------------------------------------------
print("\n📦 Creating procurement lots...")

farmers = list(FarmerProfile.objects.all()[:10])
today = timezone.now()

lots_data = [
    {
        'farmer': farmers[0] if farmers else None,
        'crop_type': 'groundnut',
        'crop_variety': 'GG-20',
        'harvest_date': today.date() - timedelta(days=15),
        'quantity_quintals': Decimal('125.50'),
        'available_quantity_quintals': Decimal('125.50'),
        'quality_grade': 'A',
        'moisture_content': Decimal('7.5'),
        'oil_content': Decimal('48.2'),
        'expected_price_per_quintal': Decimal('6500.00'),
        'pickup_address': 'Village Kheralu, Mehsana, Gujarat',
        'status': 'available',
        'storage_conditions': 'Cool, dry warehouse storage',
        'organic_certified': False,
    },
    {
        'farmer': farmers[1] if len(farmers) > 1 else None,
        'crop_type': 'soybean',
        'crop_variety': 'JS-335',
        'harvest_date': today.date() - timedelta(days=10),
        'quantity_quintals': Decimal('200.00'),
        'available_quantity_quintals': Decimal('150.00'),
        'quality_grade': 'A',
        'moisture_content': Decimal('11.0'),
        'oil_content': Decimal('19.5'),
        'expected_price_per_quintal': Decimal('5000.00'),
        'pickup_address': 'Latur District, Maharashtra',
        'status': 'partially_sold',
        'storage_conditions': 'FPO warehouse',
        'organic_certified': True,
    },
    {
        'farmer': farmers[2] if len(farmers) > 2 else None,
        'crop_type': 'mustard',
        'crop_variety': 'Pusa Bold',
        'harvest_date': today.date() - timedelta(days=20),
        'quantity_quintals': Decimal('180.75'),
        'available_quantity_quintals': Decimal('0.00'),
        'quality_grade': 'B+',
        'moisture_content': Decimal('8.2'),
        'oil_content': Decimal('39.8'),
        'expected_price_per_quintal': Decimal('5800.00'),
        'final_price_per_quintal': Decimal('5900.00'),
        'pickup_address': 'Tonk Road, Jaipur, Rajasthan',
        'status': 'sold',
        'sold_date': today - timedelta(days=5),
        'storage_conditions': 'Farm storage',
        'organic_certified': False,
    },
    {
        'farmer': farmers[3] if len(farmers) > 3 else None,
        'crop_type': 'sunflower',
        'crop_variety': 'KBSH-44',
        'harvest_date': today.date() - timedelta(days=7),
        'quantity_quintals': Decimal('95.25'),
        'available_quantity_quintals': Decimal('95.25'),
        'quality_grade': 'A+',
        'moisture_content': Decimal('6.8'),
        'oil_content': Decimal('41.5'),
        'expected_price_per_quintal': Decimal('7200.00'),
        'pickup_address': 'Belgaum District, Karnataka',
        'status': 'available',
        'storage_conditions': 'Cool storage',
        'organic_certified': False,
    },
    {
        'farmer': farmers[4] if len(farmers) > 4 else None,
        'crop_type': 'sesame',
        'crop_variety': 'Gujarat Til-2',
        'harvest_date': today.date() - timedelta(days=12),
        'quantity_quintals': Decimal('45.50'),
        'available_quantity_quintals': Decimal('45.50'),
        'quality_grade': 'A',
        'moisture_content': Decimal('7.0'),
        'oil_content': Decimal('50.5'),
        'expected_price_per_quintal': Decimal('8800.00'),
        'pickup_address': 'Banaskantha, Gujarat',
        'status': 'available',
        'storage_conditions': 'Farm shed',
        'organic_certified': True,
    },
]

procurement_lots = []
for lot_data in lots_data:
    lot = ProcurementLot.objects.create(**lot_data)
    procurement_lots.append(lot)
    print(f"  ✓ Created: {lot.lot_number} - {lot.crop_type} ({lot.quantity_quintals}Q)")

# -------------------------------------------------------------
# LOGISTICS PARTNERS & VEHICLES
# -------------------------------------------------------------
print("\n🚚 Creating logistics partners and vehicles...")

# Create logistics users
logistics_users_data = [
    {
        'phone_number': '+919876001001',
        'role': 'logistics',
        'is_active': True,
        'profile_data': {
            'full_name': 'Express Transport Services',
            'address': 'Transport Nagar, Ahmedabad',
            'city': 'Ahmedabad',
            'state': 'Gujarat',
            'pincode': '380001'
        },
        'logistics_data': {
            'company_name': 'Express Transport Services',
            'gst_number': 'GST24ABCDE1234F1Z5',
            'transport_license': 'TL-GJ-2024-001',
            'is_verified': True,
            'service_states': ['Gujarat', 'Maharashtra', 'Rajasthan'],
            'average_rating': Decimal('4.5'),
            'total_deliveries': 156,
        }
    },
    {
        'phone_number': '+919876001002',
        'role': 'logistics',
        'is_active': True,
        'profile_data': {
            'full_name': 'Reliable Logistics Pvt Ltd',
            'address': 'Logistics Hub, Pune',
            'city': 'Pune',
            'state': 'Maharashtra',
            'pincode': '411001'
        },
        'logistics_data': {
            'company_name': 'Reliable Logistics Pvt Ltd',
            'gst_number': 'GST27XYZAB5678G2Z1',
            'transport_license': 'TL-MH-2023-089',
            'is_verified': True,
            'service_states': ['Maharashtra', 'Karnataka', 'Telangana'],
            'average_rating': Decimal('4.7'),
            'total_deliveries': 234,
        }
    },
]

logistics_partners = []
for log_data in logistics_users_data:
    user, created = User.objects.get_or_create(
        phone_number=log_data['phone_number'],
        defaults={
            'role': log_data['role'],
            'is_active': log_data['is_active']
        }
    )
    if created:
        user.set_password('logistics123')
        user.save()
    
    # Create user profile
    from apps.users.models import UserProfile
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults=log_data['profile_data']
    )
    
    # Create logistics partner profile
    partner, created = LogisticsPartner.objects.get_or_create(
        user=user,
        defaults=log_data['logistics_data']
    )
    logistics_partners.append(partner)
    status = "Created" if created else "Exists"
    print(f"  ✓ {status}: {partner.company_name}")

# Create vehicles for logistics partners
vehicles_data = [
    {
        'logistics_partner': logistics_partners[0],
        'vehicle_number': 'GJ-01-AB-1234',
        'vehicle_type': 'medium_truck',
        'capacity_quintals': Decimal('300.00'),
        'vehicle_model': 'Tata LPT 1613',
        'year_of_manufacture': 2022,
        'is_active': True,
        'is_available': True,
    },
    {
        'logistics_partner': logistics_partners[0],
        'vehicle_number': 'GJ-01-CD-5678',
        'vehicle_type': 'large_truck',
        'capacity_quintals': Decimal('500.00'),
        'vehicle_model': 'Ashok Leyland 2518',
        'year_of_manufacture': 2021,
        'is_active': True,
        'is_available': False,
    },
    {
        'logistics_partner': logistics_partners[1] if len(logistics_partners) > 1 else logistics_partners[0],
        'vehicle_number': 'MH-12-EF-9101',
        'vehicle_type': 'medium_truck',
        'capacity_quintals': Decimal('350.00'),
        'vehicle_model': 'Eicher Pro 3015',
        'year_of_manufacture': 2023,
        'is_active': True,
        'is_available': True,
    },
]

vehicles = []
for veh_data in vehicles_data:
    vehicle, created = Vehicle.objects.get_or_create(
        vehicle_number=veh_data['vehicle_number'],
        defaults=veh_data
    )
    vehicles.append(vehicle)
    status = "Created" if created else "Exists"
    print(f"  ✓ {status}: {vehicle.vehicle_number} ({vehicle.get_vehicle_type_display()})")

# -------------------------------------------------------------
# BIDS
# -------------------------------------------------------------
print("\n💰 Creating bids...")

# Get FPOs and Processors for bidding
fpos = list(FPOProfile.objects.all()[:3])
processors = list(ProcessorProfile.objects.all()[:2])

bids_data = [
    {
        'lot': procurement_lots[0] if procurement_lots else None,
        'bidder_type': 'fpo',
        'bidder_id': fpos[0].id if fpos else None,
        'bidder_name': fpos[0].organization_name if fpos else 'Test FPO',
        'bidder_user': fpos[0].user if fpos else None,
        'offered_price_per_quintal': Decimal('6550.00'),
        'quantity_quintals': Decimal('125.50'),
        'pickup_location': 'FPO Collection Center, Mehsana',
        'expected_pickup_date': (today + timedelta(days=7)).date(),
        'payment_terms': '7_days',
        'advance_payment_percentage': Decimal('25.00'),
        'status': 'pending',
        'message': 'We offer competitive pricing and immediate payment terms.',
    },
    {
        'lot': procurement_lots[0] if procurement_lots else None,
        'bidder_type': 'processor',
        'bidder_id': processors[0].id if processors else None,
        'bidder_name': processors[0].company_name if processors else 'Test Processor',
        'bidder_user': processors[0].user if processors else None,
        'offered_price_per_quintal': Decimal('6600.00'),
        'quantity_quintals': Decimal('125.50'),
        'pickup_location': 'Processing Plant, Rajkot',
        'expected_pickup_date': (today + timedelta(days=5)).date(),
        'payment_terms': '15_days',
        'advance_payment_percentage': Decimal('30.00'),
        'status': 'accepted',
        'message': 'Premium quality required for oil extraction.',
    },
    {
        'lot': procurement_lots[1] if len(procurement_lots) > 1 else None,
        'bidder_type': 'fpo',
        'bidder_id': fpos[0].id if fpos else None,
        'bidder_name': fpos[0].organization_name if fpos else 'Test FPO',
        'bidder_user': fpos[0].user if fpos else None,
        'offered_price_per_quintal': Decimal('5050.00'),
        'quantity_quintals': Decimal('50.00'),
        'pickup_location': 'Latur FPO Warehouse',
        'expected_pickup_date': (today + timedelta(days=10)).date(),
        'payment_terms': '7_days',
        'advance_payment_percentage': Decimal('20.00'),
        'status': 'accepted',
        'message': 'Bulk purchase for aggregation.',
    },
]

bids = []
for bid_data in bids_data:
    if bid_data['lot'] and bid_data['bidder_user']:
        bid = Bid.objects.create(**bid_data)
        bids.append(bid)
        print(f"  ✓ Created: Bid on {bid.lot.lot_number} - ₹{bid.offered_price_per_quintal}/Q ({bid.status})")

# -------------------------------------------------------------
# PAYMENTS & WALLETS
# -------------------------------------------------------------
print("\n💳 Creating wallets and payments...")

# Create wallets for all users
all_users = User.objects.filter(is_active=True)
for user in all_users:
    wallet, created = Wallet.objects.get_or_create(
        user=user,
        defaults={
            'balance': Decimal('50000.00') if user.role in ['fpo', 'processor', 'retailer'] else Decimal('5000.00'),
            'is_active': True
        }
    )
    if created:
        print(f"  ✓ Created wallet for {user.phone_number} - ₹{wallet.balance}")

# Create payments for accepted bids
accepted_bids = [bid for bid in bids if bid.status == 'accepted']
for bid in accepted_bids[:2]:  # Create payments for first 2 accepted bids
    payment = Payment.objects.create(
        lot=bid.lot,
        bid=bid,
        payer_id=bid.bidder_id,
        payer_name=bid.bidder_name,
        payer_type=bid.bidder_type,
        payee_id=bid.lot.farmer.id if bid.lot.farmer else None,
        payee_name=bid.lot.farmer.full_name if bid.lot.farmer else 'Unknown',
        gross_amount=bid.total_amount,
        commission_percentage=Decimal('2.5'),
        commission_amount=bid.total_amount * Decimal('0.025'),
        payment_method='bank_transfer',
        status='completed' if bid == accepted_bids[0] else 'pending',
        completed_at=today if bid == accepted_bids[0] else None,
    )
    print(f"  ✓ Created: Payment {payment.payment_id} - ₹{payment.net_amount} ({payment.status})")

# -------------------------------------------------------------
# SHIPMENTS
# -------------------------------------------------------------
print("\n📦 Creating shipments...")

if logistics_partners and vehicles and procurement_lots:
    shipments_data = [
        {
            'logistics_partner': logistics_partners[0],
            'lot': procurement_lots[2] if len(procurement_lots) > 2 else procurement_lots[0],
            'vehicle': vehicles[1] if len(vehicles) > 1 else vehicles[0],
            'status': 'delivered',
            'scheduled_pickup_date': today - timedelta(days=4),
            'actual_pickup_date': today - timedelta(days=4),
            'scheduled_delivery_date': today - timedelta(days=2),
            'actual_delivery_date': today - timedelta(days=2),
            'pickup_address': 'Tonk Road, Jaipur',
            'delivery_address': 'Processing Plant, Ajmer',
            'quoted_price': Decimal('3500.00'),
            'final_price': Decimal('3500.00'),
            'driver_name': 'Ramesh Kumar',
            'driver_phone': '+919898989898',
        },
        {
            'logistics_partner': logistics_partners[0],
            'lot': procurement_lots[0] if procurement_lots else None,
            'vehicle': vehicles[0],
            'status': 'accepted',
            'scheduled_pickup_date': today + timedelta(days=3),
            'pickup_address': 'Village Kheralu, Mehsana',
            'delivery_address': 'Processing Plant, Rajkot',
            'quoted_price': Decimal('2800.00'),
            'driver_name': 'Suresh Patel',
            'driver_phone': '+919787878787',
        },
    ]
    
    shipments = []
    for ship_data in shipments_data:
        if ship_data['lot']:
            shipment = Shipment.objects.create(**ship_data)
            shipments.append(shipment)
            print(f"  ✓ Created: Shipment #{shipment.id} - {shipment.get_status_display()}")

# -------------------------------------------------------------
# MARKETPLACE LISTINGS
# -------------------------------------------------------------
print("\n🛒 Creating marketplace listings...")

if procurement_lots:
    listings_data = [
        {
            'lot': procurement_lots[0],
            'is_active': True,
            'featured': True,
        },
        {
            'lot': procurement_lots[3] if len(procurement_lots) > 3 else procurement_lots[0],
            'is_active': True,
            'featured': False,
        },
    ]
    
    listings = []
    for list_data in listings_data:
        listing, created = Listing.objects.get_or_create(
            lot=list_data['lot'],
            defaults=list_data
        )
        listings.append(listing)
        status = "Created" if created else "Exists"
        print(f"  ✓ {status}: Listing for {listing.lot.lot_number}")

# -------------------------------------------------------------
# INVENTORY & STOCK MOVEMENTS
# -------------------------------------------------------------
print("\n📊 Creating inventory records...")

if fpo_warehouses and procurement_lots:
    # Create inventory for lots stored in warehouses
    inventory_data = [
        {
            'warehouse': fpo_warehouses[0],
            'lot': procurement_lots[1] if len(procurement_lots) > 1 else procurement_lots[0],
            'quantity': Decimal('200.00'),
        },
        {
            'warehouse': fpo_warehouses[1] if len(fpo_warehouses) > 1 else fpo_warehouses[0],
            'lot': procurement_lots[4] if len(procurement_lots) > 4 else procurement_lots[0],
            'quantity': Decimal('45.50'),
        },
    ]
    
    for inv_data in inventory_data:
        inventory, created = Inventory.objects.get_or_create(
            warehouse=inv_data['warehouse'],
            lot=inv_data['lot'],
            defaults={'quantity': inv_data['quantity']}
        )
        status = "Created" if created else "Exists"
        print(f"  ✓ {status}: Inventory - {inventory.lot.lot_number} in {inventory.warehouse.warehouse_name}")
        
        # Create stock movement record
        if created:
            movement = StockMovement.objects.create(
                warehouse=inv_data['warehouse'],
                lot=inv_data['lot'],
                movement_type='in',
                quantity=inv_data['quantity'],
                remarks='Initial stock entry from farmer'
            )
            print(f"  ✓ Created: Stock IN - {movement.quantity}Q")

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
print(f"  - FPO Warehouses: {FPOWarehouse.objects.count()}")
print(f"  - Processors: {ProcessorProfile.objects.count()}")
print(f"  - Processing Plants: {ProcessingPlant.objects.count()}")
print(f"  - Retailers: {RetailerProfile.objects.count()}")
print(f"  - Stores: {Store.objects.count()}")
print(f"  - Logistics Partners: {LogisticsPartner.objects.count()}")
print(f"  - Vehicles: {Vehicle.objects.count()}")
print(f"  - Procurement Lots: {ProcurementLot.objects.count()}")
print(f"  - Bids: {Bid.objects.count()}")
print(f"  - Payments: {Payment.objects.count()}")
print(f"  - Wallets: {Wallet.objects.count()}")
print(f"  - Shipments: {Shipment.objects.count()}")
print(f"  - Marketplace Listings: {Listing.objects.count()}")
print(f"  - Inventory Records: {Inventory.objects.count()}")
print(f"  - Stock Movements: {StockMovement.objects.count()}")
print(f"  - MSP Records: {MSPRecord.objects.count()}")

print("\n🔑 Test Credentials:")
print("  Farmer: +919876543200 / farmer123")
print("  FPO: +919876000001 / fpo123")
print("  Processor: +919876000100 / processor123")
print("  Retailer: +919876000200 / retailer123")
print("  Logistics: +919876001001 / logistics123")
print("  Government: +919876000099 / gov123")

print("\n🚀 Ready to demo!")
