"""Test superuser authentication for Django admin"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from django.contrib.auth import authenticate

print("=" * 70)
print("TESTING SUPERUSER & DJANGO ADMIN LOGIN")
print("=" * 70)

# Get all superusers
superusers = User.objects.filter(is_superuser=True)
print(f"\n1. Found {superusers.count()} superuser(s):")
for user in superusers:
    print(f"\n   Phone: {user.phone_number}")
    print(f"   Role: {user.role}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Is Active: {user.is_active}")
    print(f"   Is Verified: {user.is_verified}")
    print(f"   Has Password: {user.has_usable_password()}")
    
    # Try to authenticate
    print(f"\n   Testing authentication with password 'admin123':")
    
    # Test with phone number
    auth_user = authenticate(username=user.phone_number, password='admin123')
    if auth_user:
        print(f"   ✓ Authentication SUCCESSFUL with {user.phone_number}")
    else:
        print(f"   ✗ Authentication FAILED")
        
        # Check password manually
        if user.check_password('admin123'):
            print(f"   ✓ Password check PASSED (password is correct)")
            print(f"   ✗ But authenticate() failed - Check authentication backend!")
        else:
            print(f"   ✗ Password check FAILED (wrong password)")

# Check Django settings
print("\n" + "=" * 70)
print("2. Checking Django Configuration:")
print("=" * 70)

from django.conf import settings

print(f"\nAUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")
print(f"\nAUTHENTICATION_BACKENDS:")
for backend in settings.AUTHENTICATION_BACKENDS:
    print(f"   - {backend}")

print("\n" + "=" * 70)
print("3. Testing Password Creation:")
print("=" * 70)

# Create a test user to verify password setting works
test_phone = "+919999999999"
User.objects.filter(phone_number=test_phone).delete()

test_user = User.objects.create_user(
    phone_number='9999999999',
    role='farmer',
    password='test123'
)

print(f"\nCreated test user: {test_user.phone_number}")
print(f"Has usable password: {test_user.has_usable_password()}")
print(f"Password check 'test123': {test_user.check_password('test123')}")

auth_test = authenticate(username=test_user.phone_number, password='test123')
print(f"Authentication result: {'✓ SUCCESS' if auth_test else '✗ FAILED'}")

test_user.delete()

print("\n" + "=" * 70)
print("DIAGNOSIS COMPLETE")
print("=" * 70)
