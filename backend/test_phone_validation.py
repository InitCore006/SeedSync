"""Test phone number validation and superuser creation"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.core.utils import format_phone_number

print("=" * 60)
print("TESTING PHONE NUMBER VALIDATION")
print("=" * 60)

# Test phone formatting
test_numbers = [
    '9137966960',      # Simple 10-digit
    '+919137966960',   # With +91
    '919137966960',    # With 91
    '09137966960',     # With leading 0
]

print("\n1. Testing phone number formatting:")
for num in test_numbers:
    try:
        formatted = format_phone_number(num)
        print(f"   ✓ {num:20s} → {formatted}")
    except Exception as e:
        print(f"   ✗ {num:20s} → Error: {e}")

# Test invalid numbers
invalid_numbers = [
    '5137966960',      # Starts with 5 (invalid)
    '91379669',        # Too short
    '91379669601234',  # Too long
]

print("\n2. Testing invalid phone numbers (should fail):")
for num in invalid_numbers:
    try:
        formatted = format_phone_number(num)
        print(f"   ✗ {num:20s} → {formatted} (should have failed!)")
    except Exception as e:
        print(f"   ✓ {num:20s} → Correctly rejected: {str(e)[:50]}")

print("\n" + "=" * 60)
print("TESTING SUPERUSER CREATION")
print("=" * 60)

# Clean up existing test users
deleted = User.objects.filter(phone_number__in=['+919137966960', '+918888888888']).delete()
if deleted[0] > 0:
    print(f"\n✓ Cleaned up {deleted[0]} existing test user(s)")

# Test 1: Create with 10-digit number
print("\n3. Creating superuser with 10-digit number (9137966960):")
try:
    user1 = User.objects.create_superuser(
        phone_number='9137966960',
        password='admin123'
    )
    print(f"   ✓ Superuser created successfully!")
    print(f"     - Phone: {user1.phone_number}")
    print(f"     - Role: {user1.role}")
    print(f"     - Is Staff: {user1.is_staff}")
    print(f"     - Is Superuser: {user1.is_superuser}")
    print(f"     - Is Verified: {user1.is_verified}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 2: Create with +91 prefix
print("\n4. Creating superuser with +91 prefix (+918888888888):")
try:
    user2 = User.objects.create_superuser(
        phone_number='+918888888888',
        password='admin123'
    )
    print(f"   ✓ Superuser created successfully!")
    print(f"     - Phone: {user2.phone_number}")
    print(f"     - Role: {user2.role}")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "=" * 60)
print("✓ ALL TESTS COMPLETED")
print("=" * 60)
print("\nYou can now create superuser with:")
print("  python manage.py createsuperuser")
print("\nJust enter your 10-digit number like: 9137966960")
print("=" * 60)
