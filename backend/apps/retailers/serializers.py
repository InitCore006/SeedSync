from rest_framework import serializers
from .models import Retailer
from apps.users.models import User, UserProfile
from apps.users.serializers import UserListSerializer
import re


class RetailerRegistrationStep1Serializer(serializers.Serializer):
    """Step 1: Basic User Account"""
    phone_number = serializers.CharField(max_length=10)
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    preferred_language = serializers.ChoiceField(
        choices=User.LANGUAGE_CHOICES,
        default='en'
    )
    
    def validate_phone_number(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be 10 digits starting with 6-9"
            )
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        return value
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords don't match"
            })
        return attrs


class RetailerRegistrationStep2Serializer(serializers.Serializer):
    """Step 2: User Profile Details (NO city field here!)"""
    # Personal
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(
        choices=UserProfile.GENDER_CHOICES,
        required=False,
        allow_null=True
    )
    
    # Address (UserProfile fields only)
    address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True)
    block = serializers.CharField(max_length=100, required=False, allow_blank=True)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    
    # Bank Details (Optional)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    account_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    ifsc_code = serializers.CharField(max_length=11, required=False, allow_blank=True)
    account_holder_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    def validate_pincode(self, value):
        if not re.match(r'^[1-9][0-9]{5}$', value):
            raise serializers.ValidationError("Invalid pincode format")
        return value
    
    def validate_ifsc_code(self, value):
        if value and not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError("Invalid IFSC code format")
        return value


class RetailerRegistrationStep3Serializer(serializers.Serializer):
    """Step 3: Retailer Business Details"""
    # Business Info
    business_name = serializers.CharField(max_length=200)
    retailer_type = serializers.ChoiceField(
        choices=Retailer.RETAILER_TYPE_CHOICES
    )
    
    # Location (Retailer-specific, can override from profile)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100, required=False)
    pincode = serializers.CharField(max_length=6, required=False)
    
    # Compliance
    gstin = serializers.CharField(max_length=15)
    fssai_license = serializers.CharField(max_length=14, required=False, allow_blank=True)
    
    # Business Terms
    monthly_requirement = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    payment_terms = serializers.ChoiceField(
        choices=[
            ('advance', 'Advance'),
            ('credit_15', '15 Days'),
            ('credit_30', '30 Days'),
        ],
        default='credit_15'
    )
    
    # Contact
    contact_person = serializers.CharField(max_length=200)
    contact_phone = serializers.CharField(max_length=10)
    contact_email = serializers.EmailField()
    
    def validate_gstin(self, value):
        if not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', value):
            raise serializers.ValidationError("Invalid GSTIN format")
        if Retailer.objects.filter(gstin=value).exists():
            raise serializers.ValidationError("GSTIN already registered")
        return value
    
    def validate_contact_phone(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError("Invalid phone number")
        return value
    
    def validate_monthly_requirement(self, value):
        if value <= 0:
            raise serializers.ValidationError("Monthly requirement must be greater than 0")
        return value


class RetailerRegistrationCompleteSerializer(serializers.Serializer):
    """Complete Retailer Registration Data"""
    # Step 1
    phone_number = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    preferred_language = serializers.CharField(default='en')
    
    # Step 2
    profile = RetailerRegistrationStep2Serializer()
    
    # Step 3
    retailer = RetailerRegistrationStep3Serializer()


class RetailerSerializer(serializers.ModelSerializer):
    """Retailer Serializer"""
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Retailer
        fields = [
            'id', 'user', 'user_details', 'business_name', 'retailer_code',
            'retailer_type', 'city', 'state', 'pincode',
            'gstin', 'fssai_license',
            'monthly_requirement', 'payment_terms',
            'contact_person', 'contact_phone', 'contact_email',
            'is_verified', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'retailer_code', 'created_at', 'updated_at', 'user_details']
    
    def get_user_details(self, obj):
        return {
            'id': str(obj.user.id),
            'full_name': obj.user.full_name,
            'phone_number': obj.user.phone_number,
            'email': obj.user.email,
        }


class RetailerListSerializer(serializers.ModelSerializer):
    """Lightweight retailer list"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Retailer
        fields = [
            'id', 'retailer_code', 'business_name', 'user_name',
            'retailer_type', 'city', 'state',
            'monthly_requirement', 'is_verified', 'is_active'
        ]