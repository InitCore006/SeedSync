"""
Complete Django Admin Access Test
Run this to verify superuser can login to admin panel
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from django.contrib.auth import authenticate
from django.test import Client

print("=" * 80)
print("COMPLETE DJANGO ADMIN ACCESS TEST")
print("=" * 80)

# Step 1: Check/Create Superuser
print("\n📋 STEP 1: Checking Superuser")
print("-" * 80)

superuser = User.objects.filter(is_superuser=True).first()

if not superuser:
    print("❌ No superuser found. Creating one...")
    superuser = User.objects.create_superuser(
        phone_number='9137966960',
        password='admin123'
    )
    print(f"✅ Superuser created: {superuser.phone_number}")
else:
    print(f"✅ Superuser exists: {superuser.phone_number}")

# Display superuser details
print(f"\n📊 Superuser Details:")
print(f"   Phone Number: {superuser.phone_number}")
print(f"   Role: {superuser.role}")
print(f"   Is Active: {'✅' if superuser.is_active else '❌'} {superuser.is_active}")
print(f"   Is Staff: {'✅' if superuser.is_staff else '❌'} {superuser.is_staff}")
print(f"   Is Superuser: {'✅' if superuser.is_superuser else '❌'} {superuser.is_superuser}")
print(f"   Is Verified: {'✅' if superuser.is_verified else '❌'} {superuser.is_verified}")
print(f"   Has Password: {'✅' if superuser.has_usable_password() else '❌'} {superuser.has_usable_password()}")

# Step 2: Test Password
print("\n📋 STEP 2: Testing Password")
print("-" * 80)

test_password = 'admin123'
superuser.set_password(test_password)
superuser.save()

if superuser.check_password(test_password):
    print(f"✅ Password '{test_password}' is set correctly")
else:
    print(f"❌ Password verification failed!")

# Step 3: Test Authentication
print("\n📋 STEP 3: Testing Authentication Backend")
print("-" * 80)

auth_user = authenticate(username=superuser.phone_number, password=test_password)
if auth_user:
    print(f"✅ Authentication SUCCESSFUL")
    print(f"   Authenticated as: {auth_user.phone_number}")
else:
    print(f"❌ Authentication FAILED")
    print(f"   This might prevent Django admin login!")

# Step 4: Test Admin Login (simulated)
print("\n📋 STEP 4: Testing Admin Login (Simulated)")
print("-" * 80)

client = Client()
response = client.post('/admin/login/', {
    'username': superuser.phone_number,
    'password': test_password,
    'next': '/admin/'
})

if response.status_code == 302:  # Redirect means successful login
    print(f"✅ Admin login SUCCESSFUL (redirected to {response.url})")
elif response.status_code == 200 and 'Please enter the correct' in str(response.content):
    print(f"❌ Admin login FAILED - Wrong credentials or configuration issue")
    print(f"   Response indicates wrong username/password")
else:
    print(f"⚠️  Admin login returned status {response.status_code}")

# Step 5: Check Configuration
print("\n📋 STEP 5: Checking Django Configuration")
print("-" * 80)

from django.conf import settings

print(f"AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")
print(f"AUTHENTICATION_BACKENDS:")
for backend in settings.AUTHENTICATION_BACKENDS:
    print(f"   - {backend}")

# Final Summary
print("\n" + "=" * 80)
print("🎯 FINAL SUMMARY")
print("=" * 80)

all_checks = [
    ("Superuser exists", superuser is not None),
    ("Is active", superuser.is_active),
    ("Is staff", superuser.is_staff),
    ("Is superuser", superuser.is_superuser),
    ("Has password", superuser.has_usable_password()),
    ("Password correct", superuser.check_password(test_password)),
    ("Authentication works", auth_user is not None),
]

passed = sum(1 for _, result in all_checks if result)
total = len(all_checks)

for check_name, result in all_checks:
    status = "✅" if result else "❌"
    print(f"{status} {check_name}")

print("\n" + "-" * 80)
if passed == total:
    print(f"🎉 ALL CHECKS PASSED ({passed}/{total})")
    print("\n📝 LOGIN CREDENTIALS FOR DJANGO ADMIN:")
    print(f"   URL: http://127.0.0.1:8000/admin/")
    print(f"   Username: {superuser.phone_number}")
    print(f"   Password: {test_password}")
    print("\n🚀 Start server with: python manage.py runserver")
else:
    print(f"⚠️  SOME CHECKS FAILED ({passed}/{total})")
    print("\n🔧 Try running this script again or recreate the superuser")

print("=" * 80)
