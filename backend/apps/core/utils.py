"""
Utility Functions for SeedSync Platform
"""
import hashlib
import random
import string
from datetime import datetime, timedelta
from django.core.validators import RegexValidator
from apps.core.constants import PHONE_REGEX, OTP_LENGTH


def generate_otp(length=OTP_LENGTH):
    """Generate random OTP"""
    return ''.join(random.choices(string.digits, k=length))


def generate_unique_code(prefix='', length=10):
    """Generate unique alphanumeric code"""
    characters = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(characters, k=length))
    return f"{prefix}{code}" if prefix else code


def generate_hash(data):
    """Generate SHA-256 hash of data"""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def format_phone_number(phone):
    """Format phone number to +91XXXXXXXXXX"""
    # Remove all non-digit characters (spaces, hyphens, plus signs, etc.)
    phone = ''.join(filter(str.isdigit, phone))
    
    # Remove leading 91 if present (user entered country code)
    if phone.startswith('91') and len(phone) == 12:
        phone = phone[2:]
    
    # Remove leading 0 if present (some users might add it)
    if phone.startswith('0') and len(phone) == 11:
        phone = phone[1:]
    
    # Validate: must be exactly 10 digits after cleanup
    if len(phone) != 10:
        from django.core.exceptions import ValidationError
        raise ValidationError(
            f"Phone number must be 10 digits (6-9 as first digit). "
            f"You entered {len(phone)} digits. "
            f"Just enter your 10-digit mobile number without +91."
        )
    
    # Validate: must start with 6, 7, 8, or 9 (Indian mobile numbers)
    if phone[0] not in '6789':
        from django.core.exceptions import ValidationError
        raise ValidationError(
            f"Indian mobile numbers must start with 6, 7, 8, or 9. "
            f"Your number starts with {phone[0]}."
        )
    
    # Always return with +91 prefix for consistency
    return f"+91{phone}"


def validate_phone_number(phone):
    """Validate Indian phone number (accepts 10 digits or +91 prefix)"""
    # Remove all non-digit characters
    cleaned = ''.join(filter(str.isdigit, phone))
    
    # Remove leading 91 if present
    if cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    
    # Remove leading 0 if present
    if cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = cleaned[1:]
    
    # Must be exactly 10 digits starting with 6-9
    if len(cleaned) == 10 and cleaned[0] in '6789':
        return True
    
    return False


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates (in km)
    Using Haversine formula
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)


def calculate_road_distance(origin_lat, origin_lon, dest_lat, dest_lon):
    """
    Calculate actual road distance using OSRM (OpenStreetMap Routing)
    Returns distance in km and estimated duration in minutes
    Falls back to Haversine formula if OSRM fails
    """
    import requests
    from django.core.cache import cache
    
    # Create cache key for 7 days (roads don't change often)
    cache_key = f"road_dist_{origin_lat}_{origin_lon}_{dest_lat}_{dest_lon}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # OSRM API endpoint (free public server)
    url = f"http://router.project-osrm.org/route/v1/driving/{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    
    params = {
        'overview': 'false',
        'alternatives': 'false',
        'steps': 'false'
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get('code') == 'Ok' and data.get('routes'):
            distance_meters = data['routes'][0]['distance']
            duration_seconds = data['routes'][0]['duration']
            
            result = {
                'distance_km': round(distance_meters / 1000, 2),
                'duration_minutes': round(duration_seconds / 60, 2),
                'method': 'osrm'
            }
            
            # Cache for 7 days
            cache.set(cache_key, result, 60 * 60 * 24 * 7)
            return result
    except Exception as e:
        print(f"OSRM API Error: {e}")
    
    # Fallback to Haversine with road approximation (25% extra for curves)
    straight_distance = calculate_distance(origin_lat, origin_lon, dest_lat, dest_lon)
    estimated_road_distance = round(straight_distance * 1.25, 2)
    
    result = {
        'distance_km': estimated_road_distance,
        'duration_minutes': round(estimated_road_distance / 50 * 60, 2),  # Assume 50 km/h average
        'method': 'estimated'
    }
    
    # Cache fallback for 1 day only
    cache.set(cache_key, result, 60 * 60 * 24)
    return result


def select_optimal_vehicle(quantity_quintals):
    """
    Select appropriate vehicle type based on load quantity
    1 quintal = 100 kg = 0.1 ton
    """
    quantity_tons = float(quantity_quintals) * 0.1
    
    if quantity_tons < 1:
        return 'mini_truck'
    elif quantity_tons <= 3:
        return 'small_truck'
    elif quantity_tons <= 7:
        return 'medium_truck'
    elif quantity_tons <= 15:
        return 'large_truck'
    else:
        return 'trailer'


def calculate_logistics_cost(distance_km, vehicle_type, quantity_quintals):
    """
    Calculate total logistics cost including transport, loading, unloading, and tolls
    Returns breakdown and total cost in INR
    """
    # Vehicle rates per km (INR)
    VEHICLE_RATES = {
        'mini_truck': 12,
        'small_truck': 18,
        'medium_truck': 25,
        'large_truck': 35,
        'trailer': 50,
    }
    
    # Fixed costs per quintal (INR)
    LOADING_COST_PER_QUINTAL = 20
    UNLOADING_COST_PER_QUINTAL = 20
    
    # Toll estimation (INR per km)
    TOLL_RATE_PER_KM = 0.5
    
    # Calculate components
    transport_cost = float(distance_km) * VEHICLE_RATES.get(vehicle_type, 25)
    loading_cost = float(quantity_quintals) * LOADING_COST_PER_QUINTAL
    unloading_cost = float(quantity_quintals) * UNLOADING_COST_PER_QUINTAL
    toll_cost = float(distance_km) * TOLL_RATE_PER_KM
    
    total_cost = transport_cost + loading_cost + unloading_cost + toll_cost
    
    return {
        'transport_cost': round(transport_cost, 2),
        'loading_cost': round(loading_cost, 2),
        'unloading_cost': round(unloading_cost, 2),
        'toll_cost': round(toll_cost, 2),
        'total_logistics_cost': round(total_cost, 2)
    }


def get_financial_year():
    """Get current Indian financial year (April to March)"""
    now = datetime.now()
    if now.month >= 4:
        return f"FY{now.year}-{now.year + 1}"
    else:
        return f"FY{now.year - 1}-{now.year}"


def format_currency(amount):
    """Format amount in Indian currency format"""
    return f"₹{amount:,.2f}"


def calculate_commission(amount, percentage=2.5):
    """Calculate commission amount"""
    return round(amount * (percentage / 100), 2)


def get_season_from_month(month=None):
    """
    Get agricultural season based on month
    Kharif: June-October (6-10)
    Rabi: November-March (11-3)
    Zaid: March-June (3-6)
    """
    from apps.core.constants import SEASON_KHARIF, SEASON_RABI, SEASON_ZAID
    
    if month is None:
        month = datetime.now().month
    
    if 6 <= month <= 10:
        return SEASON_KHARIF
    elif month >= 11 or month <= 3:
        return SEASON_RABI
    else:
        return SEASON_ZAID


def response_success(message, data=None, meta=None):
    """Generate standard success response"""
    response = {
        'status': 'success',
        'message': message,
        'data': data or {},
        'meta': meta or {'timestamp': datetime.now().isoformat()}
    }
    return response


def response_error(message, errors=None, meta=None):
    """Generate standard error response"""
    response = {
        'status': 'error',
        'message': message,
        'errors': errors or {},
        'meta': meta or {'timestamp': datetime.now().isoformat()}
    }
    return response
