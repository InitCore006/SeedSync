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
from apps.crops.models import CropMaster, MandiPrice, MSPRecord

User = get_user_model()

print("🌾 SeedSync Sample Data Seeder")
print("=" * 50)

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
