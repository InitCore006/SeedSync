"""Reset superuser password for Django admin login"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

print("=" * 70)
print("RESET SUPERUSER PASSWORD")
print("=" * 70)

# Find the superuser
superuser = User.objects.filter(is_superuser=True).first()

if not superuser:
    print("\n✗ No superuser found! Creating one...")
    superuser = User.objects.create_superuser(
        phone_number='9137966960',
        password='admin123'
    )
    print(f"✓ Superuser created: {superuser.phone_number}")
else:
    print(f"\n✓ Found superuser: {superuser.phone_number}")
    print(f"  Role: {superuser.role}")
    print(f"  Is Staff: {superuser.is_staff}")
    print(f"  Is Active: {superuser.is_active}")

# Set a new password
new_password = 'admin123'
superuser.set_password(new_password)
superuser.save()

print(f"\n✓ Password reset successfully!")
print(f"\n{'=' * 70}")
print("DJANGO ADMIN LOGIN CREDENTIALS")
print("=" * 70)
print(f"\nUsername: {superuser.phone_number}")
print(f"Password: {new_password}")
print(f"\n{'=' * 70}")
print("HOW TO ACCESS DJANGO ADMIN")
print("=" * 70)
print("\n1. Start the Django server:")
print("   python manage.py runserver")
print("\n2. Open your browser and go to:")
print("   http://127.0.0.1:8000/admin/")
print("\n3. Login with:")
print(f"   Username: {superuser.phone_number}")
print(f"   Password: {new_password}")
print("\n" + "=" * 70)

# Verify the password works
if superuser.check_password(new_password):
    print("✓ Password verification: SUCCESS")
else:
    print("✗ Password verification: FAILED")

from django.contrib.auth import authenticate
auth_user = authenticate(username=superuser.phone_number, password=new_password)
if auth_user:
    print("✓ Authentication test: SUCCESS")
    print("\n✓✓✓ YOU CAN NOW LOGIN TO DJANGO ADMIN! ✓✓✓")
else:
    print("✗ Authentication test: FAILED")

print("=" * 70)
