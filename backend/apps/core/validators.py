"""
Custom Validators for SeedSync Platform
"""
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re


def validate_indian_phone(value):
    """
    Validate Indian phone number.
    Accepts: 10-digit number starting with 6-9 (with optional +91 prefix)
    Examples: 9137966960, +919137966960, 919137966960
    Users only need to enter 10 digits - system auto-adds +91
    """
    # Remove spaces, hyphens, and plus signs for validation
    cleaned = value.replace(' ', '').replace('-', '').replace('+', '')
    
    # Remove leading 91 if present (user might have added country code)
    if cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    
    # Remove leading 0 if present
    if cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = cleaned[1:]
    
    # Must be exactly 10 digits starting with 6-9
    if not re.match(r'^[6-9]\d{9}$', cleaned):
        raise ValidationError(
            "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9. "
            "Example: 9137966960 (just 10 digits, no need for +91)"
        )


def validate_aadhaar(value):
    """Validate Aadhaar number (12 digits)"""
    if not re.match(r'^\d{12}$', value):
        raise ValidationError("Aadhaar number must be exactly 12 digits")


def validate_pan(value):
    """Validate PAN number"""
    if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value):
        raise ValidationError("PAN number must be in format: ABCDE1234F")


def validate_gstin(value):
    """Validate GSTIN number"""
    if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value):
        raise ValidationError("Invalid GSTIN format")


def validate_ifsc(value):
    """Validate IFSC code"""
    if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
        raise ValidationError("Invalid IFSC code format")


def validate_pincode(value):
    """Validate Indian pincode"""
    if not re.match(r'^\d{6}$', value):
        raise ValidationError("Pincode must be exactly 6 digits")


def validate_positive(value):
    """Validate that value is positive"""
    if value <= 0:
        raise ValidationError("Value must be positive")


def validate_file_size(value, max_size_mb=10):
    """Validate file size"""
    max_size = max_size_mb * 1024 * 1024  # Convert MB to bytes
    if value.size > max_size:
        raise ValidationError(f"File size must not exceed {max_size_mb}MB")


def validate_image_extension(value):
    """Validate image file extension"""
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    ext = value.name.split('.')[-1].lower()
    if f'.{ext}' not in valid_extensions:
        raise ValidationError(f"Only {', '.join(valid_extensions)} files are allowed")
