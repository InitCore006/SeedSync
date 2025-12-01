import uuid
from django.core.cache import cache

def create_registration_token():
    """Create a unique registration token"""
    token = str(uuid.uuid4())
    return token

def store_registration_data(token, step, data):
    """Store registration data with token"""
    cache_key = f'processor_registration_{token}_{step}'
    cache.set(cache_key, data, timeout=3600)  # 1 hour timeout
    return True

def get_registration_data(token, step):
    """Retrieve registration data"""
    cache_key = f'processor_registration_{token}_{step}'
    return cache.get(cache_key)

def clear_registration_data(token):
    """Clear all registration data for token"""
    for step in ['step1', 'step2']:
        cache_key = f'processor_registration_{token}_{step}'
        cache.delete(cache_key)
    return True