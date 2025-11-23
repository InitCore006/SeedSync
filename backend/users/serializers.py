from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from logistics.models import Vehicle, Warehouse
from logistics.serializers import VehicleSerializer, WarehouseSerializer
from .models import (
    FarmerProfile, FPOProfile, ProcessorProfile,
    RetailerProfile, LogisticsProfile, GovernmentProfile
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q


User = get_user_model()


# ============================================================================
# JWT TOKEN SERIALIZERS
# ============================================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Token with user details and approval status"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if user can login
        if not self.user.can_login:
            if self.user.role != 'GOVERNMENT' and not self.user.is_approved:
                raise serializers.ValidationError({
                    'detail': 'Your account is pending approval. Please wait for admin verification.',
                    'approval_status': self.user.approval_status
                })
        
        # Add custom user data
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
            'role': self.user.role,
            'role_display': self.user.get_role_display(),
            'approval_status': self.user.approval_status,
            'is_approved': self.user.is_approved,
            'phone_verified': self.user.phone_verified,
            'email_verified': self.user.email_verified,
            'preferred_language': self.user.preferred_language,
            'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None
        }
        
        # Add role-specific dashboard URL
        dashboard_mapping = {
            'FPO': '/fpo/dashboard',
            'PROCESSOR': '/processor/dashboard',
            'RETAILER': '/retailer/dashboard',
            'LOGISTICS': '/logistics/dashboard',
            'GOVERNMENT': '/government/dashboard',
        }
        data['redirect_to'] = dashboard_mapping.get(self.user.role, '/')
        
        return data


# ============================================================================
# PASSWORD MANAGEMENT SERIALIZERS
# ============================================================================

class PasswordChangeSerializer(serializers.Serializer):
    """Change Password"""
    
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "Password fields didn't match."
            })
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request Password Reset via Phone/Email"""
    
    identifier = serializers.CharField(
        required=True,
        help_text="Phone number or Email"
    )
    
    def validate_identifier(self, value):
        # Check if user exists with this phone/email
        user = User.objects.filter(
            Q(phone_number=value) | Q(email=value)
        ).first()
        
        if not user:
            raise serializers.ValidationError("No account found with this phone number or email.")
        
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm Password Reset with OTP"""
    
    identifier = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, max_length=6)
    new_password = serializers.CharField(
        required=True, 
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "Password fields didn't match."
            })
        return attrs


# ============================================================================
# OTP VERIFICATION SERIALIZERS
# ============================================================================

class SendOTPSerializer(serializers.Serializer):
    """Send OTP to phone number"""
    
    phone_number = serializers.CharField(required=True)
    purpose = serializers.ChoiceField(
        choices=['REGISTRATION', 'LOGIN', 'PASSWORD_RESET'],
        default='REGISTRATION'
    )


class VerifyOTPSerializer(serializers.Serializer):
    """Verify OTP"""
    
    phone_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, max_length=6)


# ============================================================================
# USER BASE SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    """General User Serializer"""
    
    profile_complete = serializers.SerializerMethodField()
    profile_type = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'approval_status', 'is_approved',
            'phone_verified', 'email_verified', 'preferred_language',
            'profile_picture', 'is_active', 'date_joined', 'last_login',
            'login_count', 'profile_complete', 'profile_type'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'login_count',
            'approval_status', 'is_approved'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_profile_complete(self, obj):
        profile_mapping = {
            'FARMER': 'farmer_profile',
            'FPO': 'fpo_profile',
            'PROCESSOR': 'processor_profile',
            'RETAILER': 'retailer_profile',
            'LOGISTICS': 'logistics_profile',
            'GOVERNMENT': 'government_profile',
        }
        profile_attr = profile_mapping.get(obj.role)
        return hasattr(obj, profile_attr) if profile_attr else False
    
    def get_profile_type(self, obj):
        return obj.get_role_display()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Base User Registration (Step 1 for all roles)"""
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'role',
            'preferred_language', 'aadhaar_number', 'pan_number'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'phone_number': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Government users cannot self-register
        if attrs.get('role') == 'GOVERNMENT':
            raise serializers.ValidationError({
                "role": "Government officials cannot self-register. Please contact admin."
            })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Auto-generate username if not provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email'].split('@')[0]
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


# ============================================================================
# FARMER REGISTRATION SERIALIZERS (Mobile App)
# ============================================================================

class FarmerRegistrationStep1Serializer(serializers.Serializer):
    """Farmer Registration - Step 1: Personal Details"""
    
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    father_husband_name = serializers.CharField(max_length=200)
    date_of_birth = serializers.DateField()
    gender = serializers.ChoiceField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')])
    phone_number = serializers.CharField(max_length=15)
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        import re
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number."
            )
        
        # Check if already registered
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        
        return value


class FarmerRegistrationStep2Serializer(serializers.Serializer):
    """Farmer Registration - Step 2: Farm & Location Details"""
    
    total_land_area = serializers.DecimalField(max_digits=10, decimal_places=2)
    village = serializers.CharField(max_length=100)
    block = serializers.CharField(max_length=100, required=False, allow_blank=True)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    crops_grown = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of oilseed crops grown"
    )
    expected_annual_production = serializers.DecimalField(max_digits=10, decimal_places=2)
    has_storage = serializers.BooleanField(default=False)
    storage_capacity = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        default=0
    )


class FarmerRegistrationStep3Serializer(serializers.Serializer):
    """Farmer Registration - Step 3: Banking & Documents"""
    
    bank_account_number = serializers.CharField(max_length=20)
    ifsc_code = serializers.CharField(max_length=11)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    branch_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    upi_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Optional: Aadhaar for eKYC (encrypted)
    aadhaar_number = serializers.CharField(max_length=12, required=False, allow_blank=True)
    
    # Password for app login
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_ifsc_code(self, value):
        """Validate IFSC code format"""
        import re
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError(
                "Invalid IFSC code format. Example: SBIN0001234"
            )
        return value
    
    def validate_aadhaar_number(self, value):
        """Validate Aadhaar number format"""
        if value:
            import re
            if not re.match(r'^\d{12}$', value):
                raise serializers.ValidationError(
                    "Invalid Aadhaar number. Must be 12 digits."
                )
        return value
    
    def validate_upi_id(self, value):
        """Validate UPI ID format"""
        if value:
            import re
            if not re.match(r'^[\w.-]+@[\w.-]+$', value):
                raise serializers.ValidationError(
                    "Invalid UPI ID format. Example: farmer@paytm"
                )
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs


class FarmerProfileSerializer(serializers.ModelSerializer):
    """Farmer Profile with nested user data"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'
        read_only_fields = [
            'id', 'farmer_id', 'credit_score', 
            'performance_rating', 'total_transactions', 'total_revenue',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Auto-generate farmer_id
        import uuid
        validated_data['farmer_id'] = f"FR-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class FarmerProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    
    farmer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = [
            'id', 'farmer_id', 'farmer_name', 'location',
            'total_land_area', 'credit_score', 'performance_rating'
        ]
    
    def get_location(self, obj):
        return f"{obj.village}, {obj.district}, {obj.state}"




# ============================================================================
# FPO REGISTRATION SERIALIZERS
# ============================================================================

class FPORegistrationStep1Serializer(serializers.Serializer):
    """FPO Registration - Step 1: Organization Details"""
    
    organization_name = serializers.CharField(max_length=200)
    registration_type = serializers.ChoiceField(choices=FPOProfile.REGISTRATION_TYPE)
    registration_number = serializers.CharField(max_length=50)
    year_of_registration = serializers.IntegerField()
    total_members = serializers.IntegerField()
    contact_person_name = serializers.CharField(max_length=200)
    contact_person_designation = serializers.CharField(max_length=100, required=False)
    
    def validate_registration_number(self, value):
        if FPOProfile.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError("This registration number is already registered.")
        return value


class FPORegistrationStep2Serializer(serializers.Serializer):
    """FPO Registration - Step 2: Location & Coverage"""
    
    office_address = serializers.CharField()
    state = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    block = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=6)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    operational_villages = serializers.ListField(child=serializers.CharField())
    total_land_coverage = serializers.DecimalField(max_digits=10, decimal_places=2)
    primary_oilseeds = serializers.ListField(child=serializers.CharField())


class FPORegistrationStep3Serializer(serializers.Serializer):
    """FPO Registration - Step 3: Infrastructure"""
    
    has_storage = serializers.BooleanField()
    has_transport = serializers.BooleanField()
    uses_logistics_partners = serializers.BooleanField()
    average_annual_procurement = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Warehouses (optional, can add multiple)
    warehouses = WarehouseSerializer(many=True, required=False)
    
    # Vehicles (optional)
    vehicles = VehicleSerializer(many=True, required=False)


class FPORegistrationStep4Serializer(serializers.Serializer):
    """FPO Registration - Step 4: Verification & Banking"""
    
    # User credentials
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(max_length=15, required=True)
    
    # Documents
    registration_certificate = serializers.FileField(required=False, allow_null=True)
    gstin = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
    # Banking details
    bank_account_number = serializers.CharField(max_length=20)
    ifsc_code = serializers.CharField(max_length=11)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    branch_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    cancelled_cheque = serializers.FileField(required=False, allow_null=True)
    
    # Password for login
    password = serializers.CharField(
        write_only=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        import re
        # Indian phone number validation (10 digits)
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number."
            )
        return value
    
    def validate_ifsc_code(self, value):
        """Validate IFSC code format"""
        import re
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError(
                "Invalid IFSC code format. Example: SBIN0001234"
            )
        return value
    
    def validate_gstin(self, value):
        """Validate GSTIN format if provided"""
        if value:
            import re
            if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value):
                raise serializers.ValidationError(
                    "Invalid GSTIN format. Example: 22AAAAA0000A1Z5"
                )
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

class FPOProfileSerializer(serializers.ModelSerializer):
    """Complete FPO Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    warehouses = serializers.SerializerMethodField()
    vehicles = serializers.SerializerMethodField()
    
    class Meta:
        model = FPOProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_lots_created', 'total_sales_volume', 'total_revenue']
    
    def get_warehouses(self, obj):
        warehouses = Warehouse.objects.filter(owner_type='FPO', owner_id=obj.id)
        return WarehouseSerializer(warehouses, many=True).data
    
    def get_vehicles(self, obj):
        vehicles = Vehicle.objects.filter(owner_type='FPO', owner_id=obj.id)
        return VehicleSerializer(vehicles, many=True).data


# ============================================================================
# PROCESSOR REGISTRATION SERIALIZERS
# ============================================================================

class ProcessorRegistrationStep1Serializer(serializers.Serializer):
    """Processor Registration - Step 1: Company Details"""
    
    company_name = serializers.CharField(max_length=200)
    processor_type = serializers.ChoiceField(choices=ProcessorProfile.PROCESSOR_TYPE)
    gstin = serializers.CharField(max_length=15)
    cin_number = serializers.CharField(max_length=21, required=False, allow_blank=True)
    year_of_establishment = serializers.IntegerField()
    contact_person_name = serializers.CharField(max_length=200)
    contact_person_designation = serializers.CharField(max_length=100)
    
    def validate_gstin(self, value):
        if ProcessorProfile.objects.filter(gstin=value).exists():
            raise serializers.ValidationError("This GSTIN is already registered.")
        return value


class ProcessorRegistrationStep2Serializer(serializers.Serializer):
    """Processor Registration - Step 2: Plant Location & Capacity"""
    
    plant_address = serializers.CharField()
    state = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    daily_crushing_capacity = serializers.DecimalField(max_digits=10, decimal_places=2)
    seeds_processed = serializers.ListField(child=serializers.CharField())
    operational_status = serializers.ChoiceField(choices=['FULL', 'PARTIAL', 'EXPANSION'])


class ProcessorRegistrationStep3Serializer(serializers.Serializer):
    """Processor Registration - Step 3: Storage & Logistics"""
    
    raw_material_storage = serializers.DecimalField(max_digits=10, decimal_places=2)
    finished_oil_storage = serializers.DecimalField(max_digits=10, decimal_places=2)
    has_own_warehouse = serializers.BooleanField()
    has_own_fleet = serializers.BooleanField()
    uses_third_party_logistics = serializers.BooleanField()
    fleet_size = serializers.IntegerField()
    preferred_sourcing_radius = serializers.IntegerField()
    
    warehouses = WarehouseSerializer(many=True, required=False)
    vehicles = VehicleSerializer(many=True, required=False)


class ProcessorRegistrationStep4Serializer(serializers.Serializer):
    """Processor Registration - Step 4: Licenses & Compliance"""
    
    fssai_license = serializers.CharField(max_length=14, required=False, allow_blank=True)
    fssai_expiry = serializers.DateField(required=False, allow_null=True)
    fssai_certificate = serializers.FileField(required=False, allow_null=True)
    factory_registration = serializers.CharField(max_length=50, required=False, allow_blank=True)
    factory_certificate = serializers.FileField(required=False, allow_null=True)
    pcb_clearance = serializers.CharField(max_length=50, required=False, allow_blank=True)
    pcb_certificate = serializers.FileField(required=False, allow_null=True)
    has_iso_9001 = serializers.BooleanField(default=False)
    has_haccp = serializers.BooleanField(default=False)
    has_bis = serializers.BooleanField(default=False)
    quality_certificates = serializers.FileField(required=False, allow_null=True)
    bank_account_number = serializers.CharField(max_length=20)
    ifsc_code = serializers.CharField(max_length=11)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    branch_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    cancelled_cheque = serializers.FileField(required=False, allow_null=True)


class ProcessorRegistrationStep5Serializer(serializers.Serializer):
    """Processor Registration - Step 5: Market Preferences & Finalize"""
    
    procurement_methods = serializers.ListField(child=serializers.CharField())
    expected_monthly_procurement = serializers.DecimalField(max_digits=10, decimal_places=2)
    interested_in_contract_farming = serializers.BooleanField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs


class ProcessorProfileSerializer(serializers.ModelSerializer):
    """Complete Processor Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    warehouses = serializers.SerializerMethodField()
    vehicles = serializers.SerializerMethodField()
    utilization_percentage = serializers.ReadOnlyField(source='current_utilization')
    
    class Meta:
        model = ProcessorProfile
        fields = '__all__'
        read_only_fields = ['id', 'annual_capacity', 'created_at', 'updated_at']
    
    def get_warehouses(self, obj):
        warehouses = Warehouse.objects.filter(owner_type='PROCESSOR', owner_id=obj.id)
        return WarehouseSerializer(warehouses, many=True).data
    
    def get_vehicles(self, obj):
        vehicles = Vehicle.objects.filter(owner_type='PROCESSOR', owner_id=obj.id)
        return VehicleSerializer(vehicles, many=True).data


# ============================================================================
# RETAILER REGISTRATION SERIALIZERS
# ============================================================================

class RetailerRegistrationStep1Serializer(serializers.Serializer):
    """Retailer Registration - Step 1: Business Details"""
    
    business_name = serializers.CharField(max_length=200)
    business_type = serializers.ChoiceField(choices=RetailerProfile.BUSINESS_TYPE)
    gstin = serializers.CharField(max_length=15)
    trade_license = serializers.CharField(max_length=50, required=False, allow_blank=True)
    contact_person_name = serializers.CharField(max_length=200)
    contact_person_designation = serializers.CharField(max_length=100)


class RetailerRegistrationStep2Serializer(serializers.Serializer):
    """Retailer Registration - Step 2: Operational Details"""
    
    number_of_outlets = serializers.IntegerField()
    main_office_address = serializers.CharField()
    state = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=6)
    monthly_oil_sales_volume = serializers.DecimalField(max_digits=10, decimal_places=2)
    oil_types_sold = serializers.ListField(child=serializers.CharField())
    has_warehouse = serializers.BooleanField()
    storage_capacity = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    warehouse_location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    procurement_frequency = serializers.ChoiceField(choices=['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'])


class RetailerRegistrationStep3Serializer(serializers.Serializer):
    """Retailer Registration - Step 3: Preferences & Banking"""
    
    sourcing_preferences = serializers.ListField(child=serializers.CharField())
    packaging_preference = serializers.ListField(child=serializers.CharField())
    fssai_license = serializers.CharField(max_length=14, required=False, allow_blank=True)
    fssai_certificate = serializers.FileField(required=False, allow_null=True)
    bank_account_number = serializers.CharField(max_length=20)
    ifsc_code = serializers.CharField(max_length=11)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    branch_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    cancelled_cheque = serializers.FileField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs


class RetailerProfileSerializer(serializers.ModelSerializer):
    """Complete Retailer Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    warehouses = serializers.SerializerMethodField()
    
    class Meta:
        model = RetailerProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_warehouses(self, obj):
        if obj.has_warehouse:
            warehouses = Warehouse.objects.filter(owner_type='RETAILER', owner_id=obj.id)
            return WarehouseSerializer(warehouses, many=True).data
        return []


# ============================================================================
# LOGISTICS REGISTRATION SERIALIZERS
# ============================================================================

class LogisticsRegistrationStep1Serializer(serializers.Serializer):
    """Logistics Registration - Step 1: Company Details"""
    
    company_name = serializers.CharField(max_length=200)
    service_type = serializers.ChoiceField(choices=LogisticsProfile.SERVICE_TYPE)
    gstin = serializers.CharField(max_length=15)
    contact_person_name = serializers.CharField(max_length=200)


class LogisticsRegistrationStep2Serializer(serializers.Serializer):
    """Logistics Registration - Step 2: Fleet & Infrastructure"""
    
    fleet_small_trucks = serializers.IntegerField(default=0)
    fleet_medium_trucks = serializers.IntegerField(default=0)
    fleet_large_trucks = serializers.IntegerField(default=0)
    fleet_tankers = serializers.IntegerField(default=0)
    fleet_refrigerated = serializers.IntegerField(default=0)
    has_gps_tracking = serializers.BooleanField()
    coverage_states = serializers.ListField(child=serializers.CharField())
    
    warehouses = WarehouseSerializer(many=True, required=False)
    vehicles = VehicleSerializer(many=True, required=False)


class LogisticsRegistrationStep3Serializer(serializers.Serializer):
    """Logistics Registration - Step 3: Compliance & Banking"""
    
    transport_license = serializers.CharField(max_length=50, required=False, allow_blank=True)
    transport_certificate = serializers.FileField(required=False, allow_null=True)
    warehouse_license = serializers.CharField(max_length=50, required=False, allow_blank=True)
    warehouse_certificate = serializers.FileField(required=False, allow_null=True)
    insurance_certificate = serializers.FileField(required=False, allow_null=True)
    bank_account_number = serializers.CharField(max_length=20)
    ifsc_code = serializers.CharField(max_length=11)
    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    branch_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    cancelled_cheque = serializers.FileField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs


class LogisticsProfileSerializer(serializers.ModelSerializer):
    """Complete Logistics Profile Serializer"""
    
    user = UserSerializer(read_only=True)
    total_fleet_size = serializers.ReadOnlyField()
    warehouses = serializers.SerializerMethodField()
    vehicles = serializers.SerializerMethodField()
    
    class Meta:
        model = LogisticsProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_warehouses(self, obj):
        warehouses = Warehouse.objects.filter(owner_type='LOGISTICS', owner_id=obj.id)
        return WarehouseSerializer(warehouses, many=True).data
    
    def get_vehicles(self, obj):
        vehicles = Vehicle.objects.filter(owner_type='LOGISTICS', owner_id=obj.id)
        return VehicleSerializer(vehicles, many=True).data


# ============================================================================
# GOVERNMENT PROFILE SERIALIZERS
# ============================================================================

class GovernmentProfileSerializer(serializers.ModelSerializer):
    """Government Official Profile"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GovernmentProfile
        fields = '__all__'
        read_only_fields = ['id', 'total_approvals', 'total_rejections', 'last_active', 'created_at', 'updated_at']


# ============================================================================
# APPROVAL MANAGEMENT SERIALIZERS
# ============================================================================

class ApprovalActionSerializer(serializers.Serializer):
    """Government Approval/Rejection Action"""
    
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT', 'SUSPEND'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        if attrs['action'] == 'REJECT' and not attrs.get('rejection_reason'):
            raise serializers.ValidationError({
                "rejection_reason": "Rejection reason is required when rejecting an application."
            })
        return attrs


class PendingApprovalSerializer(serializers.Serializer):
    """List of Pending Approvals for Government Dashboard"""
    
    user_id = serializers.UUIDField()
    applicant_name = serializers.CharField()
    role = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    applied_date = serializers.DateTimeField()
    organization_name = serializers.CharField(required=False)
    
    # Role-specific details
    registration_number = serializers.CharField(required=False)
    gstin = serializers.CharField(required=False)
    location = serializers.CharField(required=False)


# ============================================================================
# COMPLETE USER PROFILE SERIALIZER
# ============================================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile with role-specific data"""
    
    farmer_profile = FarmerProfileSerializer(read_only=True)
    fpo_profile = FPOProfileSerializer(read_only=True)
    processor_profile = ProcessorProfileSerializer(read_only=True)
    retailer_profile = RetailerProfileSerializer(read_only=True)
    logistics_profile = LogisticsProfileSerializer(read_only=True)
    government_profile = GovernmentProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'role', 'approval_status', 'is_approved',
            'phone_verified', 'email_verified', 'preferred_language',
            'profile_picture', 'farmer_profile', 'fpo_profile',
            'processor_profile', 'retailer_profile', 'logistics_profile',
            'government_profile'
        ]