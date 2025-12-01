from rest_framework import serializers
from .models import FPO, FPOMembership
from apps.users.models import User, UserProfile
from apps.users.serializers import UserProfileSerializer
import re


class FPORegistrationStep1Serializer(serializers.Serializer):
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


class FPORegistrationStep2Serializer(serializers.Serializer):
    """Step 2: User Profile Details"""
    # Personal
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(
        choices=UserProfile.GENDER_CHOICES,
        required=False,
        allow_null=True
    )
    
    # Address
    address_line1 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True)
    block = serializers.CharField(max_length=100, required=False, allow_blank=True)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    
    # Bank Details (Optional for FPO admin)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    account_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    ifsc_code = serializers.CharField(max_length=11, required=False, allow_blank=True)
    account_holder_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    # Education
    education_level = serializers.ChoiceField(
        choices=UserProfile._meta.get_field('education_level').choices,
        required=False,
        allow_blank=True
    )
    
    def validate_pincode(self, value):
        if not re.match(r'^[1-9][0-9]{5}$', value):
            raise serializers.ValidationError("Invalid pincode format")
        return value
    
    def validate_ifsc_code(self, value):
        if value and not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError("Invalid IFSC code format")
        return value


class FPORegistrationStep3Serializer(serializers.Serializer):
    """Step 3: FPO Details"""
    # Basic Info
    name = serializers.CharField(max_length=200)
    registration_number = serializers.CharField(max_length=50)
    gstin = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
    # Location (will inherit from profile but can override)
    district = serializers.CharField(max_length=100, required=False)
    state = serializers.CharField(max_length=100, required=False)
    pincode = serializers.CharField(max_length=6, required=False)
    
    # Contact
    contact_person = serializers.CharField(max_length=200)
    contact_phone = serializers.CharField(max_length=10)
    contact_email = serializers.EmailField()
    
    # Business Metrics
    total_land_area = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    monthly_capacity = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    
    def validate_name(self, value):
        if FPO.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("FPO with this name already exists")
        return value
    
    def validate_registration_number(self, value):
        if FPO.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("Registration number already exists")
        return value
    
    def validate_gstin(self, value):
        if value and not re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', value):
            raise serializers.ValidationError("Invalid GSTIN format")
        if value and FPO.objects.filter(gstin=value).exists():
            raise serializers.ValidationError("GSTIN already registered")
        return value
    
    def validate_contact_phone(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError("Invalid phone number")
        return value


class FPORegistrationCompleteSerializer(serializers.Serializer):
    """Complete FPO Registration Data"""
    # Step 1
    phone_number = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    preferred_language = serializers.CharField(default='en')
    
    # Step 2
    profile = FPORegistrationStep2Serializer()
    
    # Step 3
    fpo = FPORegistrationStep3Serializer()


class FPOSerializer(serializers.ModelSerializer):
    """FPO Serializer"""
    owner_details = serializers.SerializerMethodField()
    
    class Meta:
        model = FPO
        fields = [
            'id', 'owner', 'owner_details', 'name', 'fpo_code',
            'district', 'state', 'pincode',
            'contact_person', 'contact_phone', 'contact_email',
            'registration_number', 'gstin',
            'total_members', 'total_land_area', 'monthly_capacity',
            'is_verified', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'fpo_code', 'created_at', 'updated_at', 'owner_details']
    
    def get_owner_details(self, obj):
        return {
            'id': str(obj.owner.id),
            'full_name': obj.owner.full_name,
            'phone_number': obj.owner.phone_number,
            'email': obj.owner.email,
        }


class FPOListSerializer(serializers.ModelSerializer):
    """Lightweight FPO list"""
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    
    class Meta:
        model = FPO
        fields = [
            'id', 'fpo_code', 'name', 'owner_name',
            'district', 'state', 'total_members',
            'monthly_capacity', 'is_verified', 'is_active'
        ]


class FPOMembershipSerializer(serializers.ModelSerializer):
    """FPO Membership Serializer"""
    farmer_details = serializers.SerializerMethodField()
    fpo_name = serializers.CharField(source='fpo.name', read_only=True)
    
    class Meta:
        model = FPOMembership
        fields = [
            'id', 'fpo', 'fpo_name', 'farmer', 'farmer_details',
            'land_area', 'is_active', 'joined_at'
        ]
        read_only_fields = ['id', 'joined_at', 'farmer_details', 'fpo_name']
    
    def get_farmer_details(self, obj):
        return {
            'id': str(obj.farmer.id),
            'full_name': obj.farmer.full_name,
            'phone_number': obj.farmer.phone_number,
        }