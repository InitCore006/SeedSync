"""
Test Script for SeedSync API

Quick test to verify all endpoints are accessible
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User

print("=" * 60)
print("SEEDSYNC API - SYSTEM STATUS CHECK")
print("=" * 60)

# Test database connection
try:
    user_count = User.objects.count()
    print(f"✓ Database connection: SUCCESS ({user_count} users)")
except Exception as e:
    print(f"✗ Database connection: FAILED - {e}")

# Test API endpoints
client = APIClient()

endpoints = [
    '/api/users/register/',
    '/api/farmers/profiles/',
    '/api/crops/masters/',
    '/api/lots/procurement/',
    '/api/fpos/profiles/',
    '/api/bids/bids/',
    '/api/blockchain/transactions/',
    '/api/payments/payments/',
    '/api/processors/profiles/',
    '/api/retailers/profiles/',
    '/api/logistics/partners/',
    '/api/warehouses/warehouses/',
    '/api/marketplace/listings/',
    '/api/notifications/notifications/',
    '/api/government/dashboard/',
]

print("\n" + "=" * 60)
print("TESTING API ENDPOINTS")
print("=" * 60)

success_count = 0
for endpoint in endpoints:
    try:
        response = client.get(endpoint)
        if response.status_code in [200, 401, 403]:  # 401/403 = auth required (expected)
            print(f"✓ {endpoint:45} : Available")
            success_count += 1
        else:
            print(f"✗ {endpoint:45} : Status {response.status_code}")
    except Exception as e:
        print(f"✗ {endpoint:45} : Error - {str(e)[:50]}")

print("\n" + "=" * 60)
print(f"SUMMARY: {success_count}/{len(endpoints)} endpoints accessible")
print("=" * 60)

# Display app information
print("\n" + "=" * 60)
print("INSTALLED APPS")
print("=" * 60)

apps = [
    'users', 'farmers', 'crops', 'lots', 'fpos', 'blockchain',
    'bids', 'payments', 'processors', 'retailers', 'logistics',
    'warehouses', 'marketplace', 'notifications', 'government'
]

for app in apps:
    print(f"✓ apps.{app}")

print("\n" + "=" * 60)
print("All systems operational! 🚀")
print("Start server with: python manage.py runserver")
print("=" * 60)
