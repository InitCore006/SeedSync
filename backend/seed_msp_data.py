#!/usr/bin/env python
"""
SeedSync Backend - MSP Data Seeder
Creates Minimum Support Price records for oilseed crops
"""
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.crops.models import MSPRecord

print("💰 SeedSync MSP Data Seeder")
print("=" * 50)

# -------------------------------------------------------------
# MSP RECORDS DATA
# -------------------------------------------------------------
print("\n📊 Creating MSP records...")

# Current year MSP data (2024-25)
msp_data_2024_25 = [
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

# Previous year MSP data (2023-24) for reference
msp_data_2023_24 = [
    # Kharif Season 2023-24
    {
        'crop_type': 'groundnut',
        'year': 2023,
        'season': 'kharif',
        'msp_per_quintal': 6377.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2023-24/KHARIF/001',
        'notification_date': date(2023, 6, 8),
        'effective_from': date(2023, 6, 10),
        'effective_to': date(2024, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2023-24 - Groundnut (in shell)'
    },
    {
        'crop_type': 'soybean',
        'year': 2023,
        'season': 'kharif',
        'msp_per_quintal': 4600.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2023-24/KHARIF/002',
        'notification_date': date(2023, 6, 8),
        'effective_from': date(2023, 6, 10),
        'effective_to': date(2024, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2023-24 - Soybean (yellow)'
    },
    {
        'crop_type': 'sunflower',
        'year': 2023,
        'season': 'kharif',
        'msp_per_quintal': 6760.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2023-24/KHARIF/003',
        'notification_date': date(2023, 6, 8),
        'effective_from': date(2023, 6, 10),
        'effective_to': date(2024, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2023-24 - Sunflower Seed'
    },
    {
        'crop_type': 'sesame',
        'year': 2023,
        'season': 'kharif',
        'msp_per_quintal': 8635.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2023-24/KHARIF/004',
        'notification_date': date(2023, 6, 8),
        'effective_from': date(2023, 6, 10),
        'effective_to': date(2024, 6, 14),
        'notes': 'MSP for Kharif Marketing Season 2023-24 - Sesamum'
    },
    
    # Rabi Season 2023-24
    {
        'crop_type': 'mustard',
        'year': 2023,
        'season': 'rabi',
        'msp_per_quintal': 5650.00,
        'bonus_per_quintal': 0.00,
        'notification_number': 'MSP/2023-24/RABI/001',
        'notification_date': date(2023, 9, 14),
        'effective_from': date(2023, 10, 1),
        'effective_to': date(2024, 9, 30),
        'notes': 'MSP for Rabi Marketing Season 2023-24 - Rapeseed & Mustard'
    },
]

# Combine all MSP data
all_msp_data = msp_data_2024_25 + msp_data_2023_24

# Create or update MSP records
msp_records_created = 0
msp_records_updated = 0

for msp_info in all_msp_data:
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
    
    if created:
        msp_records_created += 1
        status = "✓ Created"
    else:
        msp_records_updated += 1
        status = "✓ Updated"
    
    print(f"  {status}: {record.get_crop_type_display()} - {record.get_season_display()} {record.year} - ₹{record.msp_per_quintal}/quintal")

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n" + "=" * 50)
print("✅ MSP data seeded successfully!")
print("\n📊 Summary:")
print(f"  - Total MSP Records: {MSPRecord.objects.count()}")
print(f"  - New Records Created: {msp_records_created}")
print(f"  - Records Updated: {msp_records_updated}")
print(f"  - Current Season (2024-25): {MSPRecord.objects.filter(year=2024).count()} records")
print(f"  - Previous Season (2023-24): {MSPRecord.objects.filter(year=2023).count()} records")

print("\n💰 Current MSP Prices (2024-25 Kharif):")
current_kharif = MSPRecord.objects.filter(year=2024, season='kharif')
for record in current_kharif:
    print(f"  - {record.get_crop_type_display()}: ₹{record.get_total_msp()}/quintal")

print("\n💰 Current MSP Prices (2024-25 Rabi):")
current_rabi = MSPRecord.objects.filter(year=2024, season='rabi')
for record in current_rabi:
    print(f"  - {record.get_crop_type_display()}: ₹{record.get_total_msp()}/quintal")

print("\n🚀 MSP data ready for mobile app!")
print("📱 Mobile app will fetch MSP from: /crops/msp/current/?crop_type=<crop_name>")
