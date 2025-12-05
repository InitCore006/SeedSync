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
