from rest_framework import serializers
from django.db.models import Sum, Avg
from .models import Farmer
from apps.users.serializers import UserWithProfileSerializer


class FarmerSerializer(serializers.ModelSerializer):
    """Farmer serializer with user and profile"""
    
    user = UserWithProfileSerializer(read_only=True)
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'user', 'farmer_id',
            'total_land_area', 'irrigated_land', 'rain_fed_land',
            'farmer_category', 'caste_category',
            'is_fpo_member', 'primary_fpo',
            'has_kisan_credit_card', 'kcc_number',
            'has_pmfby_insurance', 'pmfby_policy_number',
            'has_pm_kisan',
            'total_production', 'average_yield', 'credit_score',
            'is_active', 'is_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'farmer_id', 'total_production', 'average_yield',
            'credit_score', 'created_at', 'updated_at'
        ]


class UpdateFarmerSerializer(serializers.Serializer):
    """Serializer for updating farmer profile"""
    
    # Farmer fields
    total_land_area = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    irrigated_land = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    rain_fed_land = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    farmer_category = serializers.ChoiceField(
        choices=['marginal', 'small', 'semi_medium', 'medium', 'large'],
        required=False
    )
    caste_category = serializers.ChoiceField(
        choices=['general', 'obc', 'sc', 'st'],
        required=False
    )
    
    # Government schemes
    has_kisan_credit_card = serializers.BooleanField(required=False)
    kcc_number = serializers.CharField(required=False, allow_blank=True)
    has_pmfby_insurance = serializers.BooleanField(required=False)
    pmfby_policy_number = serializers.CharField(required=False, allow_blank=True)
    has_pm_kisan = serializers.BooleanField(required=False)
    
    # Farm details
    primary_soil_type = serializers.CharField(required=False, allow_blank=True)
    irrigation_method = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate land areas"""
        if 'total_land_area' in attrs or 'irrigated_land' in attrs or 'rain_fed_land' in attrs:
            farmer = self.instance
            total = attrs.get('total_land_area', farmer.total_land_area)
            irrigated = attrs.get('irrigated_land', farmer.irrigated_land)
            rain_fed = attrs.get('rain_fed_land', farmer.rain_fed_land)
            
            if (irrigated + rain_fed) > total:
                raise serializers.ValidationError({
                    "total_land_area": "Irrigated + Rain-fed land cannot exceed total land"
                })
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update farmer profile"""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


class FarmerRegistrationSerializer(serializers.Serializer):
    """Complete Farmer Registration - combines User + Profile + Farmer"""
    
    # User fields
    phone_number = serializers.CharField(max_length=10)
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField(required=False, allow_blank=True)
    preferred_language = serializers.CharField(default='en')
    
    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['M', 'F', 'O'], required=False)
    address_line1 = serializers.CharField(required=False, allow_blank=True)
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    village = serializers.CharField(required=False, allow_blank=True)
    block = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField()
    state = serializers.CharField()
    pincode = serializers.CharField(max_length=6)
    
    # Bank details (optional)
    bank_name = serializers.CharField(required=False, allow_blank=True)
    account_number = serializers.CharField(required=False, allow_blank=True)
    ifsc_code = serializers.CharField(required=False, allow_blank=True)
    account_holder_name = serializers.CharField(required=False, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    
    # Farmer fields
    total_land_area = serializers.DecimalField(max_digits=10, decimal_places=2)
    irrigated_land = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    rain_fed_land = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    farmer_category = serializers.ChoiceField(
        choices=['marginal', 'small', 'semi_medium', 'medium', 'large'],
        default='marginal'
    )
    caste_category = serializers.ChoiceField(
        choices=['general', 'obc', 'sc', 'st'],
        default='general'
    )
    
    # Government schemes (optional)
    has_kisan_credit_card = serializers.BooleanField(default=False)
    kcc_number = serializers.CharField(required=False, allow_blank=True)
    has_pmfby_insurance = serializers.BooleanField(default=False)
    pmfby_policy_number = serializers.CharField(required=False, allow_blank=True)
    has_pm_kisan = serializers.BooleanField(default=False)
    
    def validate_phone_number(self, value):
        """Validate phone number format and uniqueness"""
        import re
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be 10 digits starting with 6-9"
            )
        
        from apps.users.models import User
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return value
    
    def validate_pincode(self, value):
        """Validate pincode"""
        import re
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Pincode must be 6 digits")
        return value
    
    def validate(self, attrs):
        """Validate password match and land areas"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })
        
        # Validate land areas
        total = attrs['total_land_area']
        irrigated = attrs.get('irrigated_land', 0)
        rain_fed = attrs.get('rain_fed_land', 0)
        
        if (irrigated + rain_fed) > total:
            raise serializers.ValidationError({
                "total_land_area": "Irrigated + Rain-fed land cannot exceed total land"
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create User + Profile + Farmer in transaction"""
        from apps.users.models import User, UserProfile
        from django.db import transaction
        import random
        
        # Remove password_confirm
        validated_data.pop('password_confirm')
        
        # Extract user data
        user_data = {
            'phone_number': validated_data.pop('phone_number'),
            'full_name': validated_data.pop('full_name'),
            'email': validated_data.pop('email', None),
            'preferred_language': validated_data.pop('preferred_language', 'en'),
            'role': 'farmer',
            'is_phone_verified': True  # Assuming OTP verified before this
        }
        password = validated_data.pop('password')
        
        # Extract profile data
        profile_data = {
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'gender': validated_data.pop('gender', None),
            'address_line1': validated_data.pop('address_line1', ''),
            'address_line2': validated_data.pop('address_line2', ''),
            'village': validated_data.pop('village', ''),
            'block': validated_data.pop('block', ''),
            'district': validated_data.pop('district'),
            'state': validated_data.pop('state'),
            'pincode': validated_data.pop('pincode'),
            'bank_name': validated_data.pop('bank_name', ''),
            'account_number': validated_data.pop('account_number', ''),
            'ifsc_code': validated_data.pop('ifsc_code', ''),
            'account_holder_name': validated_data.pop('account_holder_name', ''),
            'education_level': validated_data.pop('education_level', ''),
        }
        
        # Remaining data is farmer data
        farmer_data = validated_data
        
        with transaction.atomic():
            # 1. Create User
            user = User.objects.create(**user_data)
            user.set_password(password)
            user.save()
            
            # 2. Create Profile
            UserProfile.objects.create(user=user, **profile_data)
            
            # 3. Generate Farmer ID
            farmer_id = f"FRM{str(user.id).replace('-', '')[:8].upper()}{random.randint(100, 999)}"
            
            # 4. Create Farmer
            farmer = Farmer.objects.create(
                user=user,
                farmer_id=farmer_id,
                **farmer_data
            )
            
            return farmer