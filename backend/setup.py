"""
Setup Script for SeedSync Backend
Run migrations and create initial data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command

print("🚀 SeedSync Backend Setup")
print("=" * 50)

# Run migrations
print("\n📦 Running database migrations...")
call_command('makemigrations')
call_command('migrate')

print("\n✅ Setup complete!")
print("\nNext steps:")
print("1. python manage.py createsuperuser")
print("2. python manage.py runserver")
print("\nAPI Documentation: http://localhost:8000/api/")
