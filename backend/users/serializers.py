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

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.db.models import Q
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import FarmerProfile

User = get_user_model()



# ============================================================================
# HELPER SERIALIZERS
# ============================================================================

class PhoneNumberSerializer(serializers.Serializer):
    """Simple phone number validation for OTP sending"""
    
    phone_number = serializers.CharField(
        required=True,
        max_length=15,
        help_text="10-digit Indian mobile number"
    )
    
    def validate_phone_number(self, value):
        """Validate and clean Indian phone number"""
        import re
        
        # Remove country code, spaces, dashes
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '').strip()
        
        # Validate format: Must start with 6-9, exactly 10 digits
        if not re.match(r'^[6-9]\d{9}$', cleaned_number):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number starting with 6-9."
            )
        
        return cleaned_number

# ============================================================================
# JWT TOKEN SERIALIZERS
# ============================================================================

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that accepts phone_number or username"""
    
    username_field = 'username'  # Keep this for compatibility
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username not required, we'll handle it manually
        self.fields['username'].required = False
        # Add phone_number field
        self.fields['phone_number'] = serializers.CharField(required=False)
    
    def validate(self, attrs):
        """
        Custom validation to support both username and phone_number login
        """
        # Get credentials
        username = attrs.get('username')
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        # Require either username or phone_number
        if not username and not phone_number:
            raise serializers.ValidationError({
                'detail': 'Either username or phone_number is required'
            })
        
        # If phone_number provided, find user and use their username
        if phone_number:
            # Clean phone number
            import re
            cleaned_number = phone_number.replace('+91', '').replace(' ', '').replace('-', '').strip()
            
            try:
                user = User.objects.get(phone_number__icontains=cleaned_number)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'detail': 'No account found with this phone number'
                })
        
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError({
                'detail': 'Incorrect password. Please try again.'
            })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account has been deactivated. Please contact support.'
            })
        
        # Check approval status for non-farmers
        if user.role != 'FARMER' and not user.is_approved:
            raise serializers.ValidationError({
                'detail': f'Your {user.get_role_display()} account is pending approval. Please wait for admin approval.'
            })
        
        # Check if farmer profile exists
        if user.role == 'FARMER':
            if not hasattr(user, 'farmer_profile'):
                raise serializers.ValidationError({
                    'detail': 'Farmer profile not found. Please complete registration.'
                })
        
        # Generate tokens using parent method
        refresh = self.get_token(user)
        
        # Prepare response data
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        # Add user data
        from .serializers import UserSerializer
        data['user'] = UserSerializer(user).data
        
        # Add role-specific data
        if user.role == 'FARMER' and hasattr(user, 'farmer_profile'):
            data['farmer_profile'] = {
                'farmer_id': user.farmer_profile.farmer_id,
                'profile_completed': user.farmer_profile.profile_completed,
                'profile_completion_percentage': user.farmer_profile.profile_completion_percentage,
            }
            data['redirect_to'] = '/farmer/dashboard'
        
        return data
# ============================================================================
# PASSWORD MANAGEMENT SERIALIZERS
# ============================================================================

class PasswordChangeSerializer(serializers.Serializer):
    """Change Password (for authenticated users)"""
    
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Verify old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "Password fields didn't match."
            })
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request Password Reset via Phone Number"""
    
    phone_number = serializers.CharField(
        required=True,
        help_text="10-digit Indian mobile number"
    )
    
    def validate_phone_number(self, value):
        """Validate phone number format and existence"""
        import re
        
        # Clean phone number (remove +91 prefix if exists)
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '')
        
        # Validate format
        if not re.match(r'^[6-9]\d{9}$', cleaned_number):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number starting with 6-9."
            )
        
        # Check if user exists
        user = User.objects.filter(phone_number__icontains=cleaned_number).first()
        if not user:
            raise serializers.ValidationError(
                "No account found with this phone number."
            )
        
        return cleaned_number


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm Password Reset with OTP"""
    
    phone_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, max_length=6, min_length=6)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_otp(self, value):
        """Validate OTP format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
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
    
    phone_number = serializers.CharField(required=True, max_length=15)
    purpose = serializers.ChoiceField(
        choices=[
            ('REGISTRATION', 'Registration'),
            ('LOGIN', 'Login'),
            ('PASSWORD_RESET', 'Password Reset'),
            ('PHONE_VERIFICATION', 'Phone Verification')
        ],
        default='REGISTRATION'
    )
    
    def validate_phone_number(self, value):
        """Validate and clean phone number"""
        import re
        
        # Clean phone number
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '')
        
        # Validate format
        if not re.match(r'^[6-9]\d{9}$', cleaned_number):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number."
            )
        
        # Check if already registered (only for REGISTRATION purpose)
        purpose = self.initial_data.get('purpose', 'REGISTRATION')
        if purpose == 'REGISTRATION':
            if User.objects.filter(phone_number__icontains=cleaned_number).exists():
                raise serializers.ValidationError(
                    "This phone number is already registered. Please login instead."
                )
        
        return cleaned_number


class VerifyOTPSerializer(serializers.Serializer):
    """Verify OTP"""
    
    phone_number = serializers.CharField(required=True, max_length=15)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    
    def validate_phone_number(self, value):
        """Clean phone number"""
        import re
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '').strip()
        
        if not re.match(r'^[6-9]\d{9}$', cleaned_number):
            raise serializers.ValidationError("Invalid phone number format")
        
        return cleaned_number
    
    def validate_otp(self, value):
        """Validate OTP format"""
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be exactly 6 digits")
        return value


# ============================================================================
# USER BASE SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    """General User Serializer (Read-Only)"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'role_display', 'approval_status', 'is_approved',
            'phone_verified', 'email_verified', 'preferred_language',
            'profile_picture', 'is_active', 'date_joined', 'last_login',
            'login_count'
        ]
        read_only_fields = [
            'id', 'username', 'date_joined', 'last_login', 'login_count',
            'approval_status', 'is_approved', 'phone_verified', 'email_verified'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Update User Basic Info"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'preferred_language',
            'profile_picture'
        ]
        extra_kwargs = {
            'email': {'required': False}
        }
    
    def validate_email(self, value):
        """Check if email is already taken by another user"""
        user = self.context['request'].user
        if value and User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value


# ============================================================================
# FARMER REGISTRATION SERIALIZERS (Mobile App - 3 Steps)
# ============================================================================

class FarmerRegistrationPhoneVerifySerializer(serializers.Serializer):
    """Step 0: Phone Number Verification (OTP sent separately)"""
    
    phone_number = serializers.CharField(required=True, max_length=15)
    otp = serializers.CharField(required=True, max_length=6, min_length=6)
    
    def validate_phone_number(self, value):
        """Validate and clean phone number"""
        import re
        
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '')
        
        if not re.match(r'^[6-9]\d{9}$', cleaned_number):
            raise serializers.ValidationError(
                "Invalid phone number. Must be a valid 10-digit Indian mobile number."
            )
        
        if User.objects.filter(phone_number__icontains=cleaned_number).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )
        
        return cleaned_number


class FarmerRegistrationStep1Serializer(serializers.Serializer):
    """
    Farmer Registration - Step 1: Personal Details
    (After OTP verification)
    """
    
    phone_number = serializers.CharField(required=True, max_length=15)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    father_husband_name = serializers.CharField(required=True, max_length=200)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(
        required=True,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    
    def validate_phone_number(self, value):
        """Phone should already be verified"""
        cleaned_number = value.replace('+91', '').replace(' ', '').replace('-', '')
        
        # Check if phone is already registered
        if User.objects.filter(phone_number__icontains=cleaned_number).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )
        
        return cleaned_number
    
    def validate_email(self, value):
        """Check if email exists (optional field)"""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )
        return value


class FarmerRegistrationStep2Serializer(serializers.Serializer):
    """
    Farmer Registration - Step 2: Location & Farm Details
    """
    
    # Location
    village = serializers.CharField(required=True, max_length=100)
    district = serializers.CharField(required=True, max_length=100)
    state = serializers.CharField(required=True, max_length=100)
    pincode = serializers.CharField(required=True, max_length=6)
    
    # GPS Coordinates (auto-captured from mobile)
    latitude = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=10, decimal_places=7,
    )
    longitude = serializers.DecimalField(
        required=False,
        allow_null=True,
        max_digits=10, decimal_places=7,
    )
    
    # Farm Details
    total_land_area = serializers.DecimalField(
        required=True,
        max_digits=10,
        decimal_places=2,
        min_value=0.1
    )
    primary_crops = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        min_length=1,
        help_text="List of oilseed crops: ['Groundnut', 'Mustard', 'Sesame']"
    )
    expected_annual_production = serializers.DecimalField(
        required=True,
        max_digits=10,
        decimal_places=2,
        min_value=0,
        help_text="Expected yearly production in quintals"
    )
    
    def validate_pincode(self, value):
        """Validate PIN code format"""
        import re
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError(
                "Invalid PIN code. Must be exactly 6 digits."
            )
        return value


class FarmerRegistrationStep3Serializer(serializers.Serializer):
    """
    Farmer Registration - Step 3: Bank Details & Password
    (Optional bank details, but password required)
    """
    
    # Bank Details (Optional but recommended)
    bank_account_number = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20
    )
    ifsc_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=11
    )
    bank_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100
    )
    branch_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100
    )
    account_holder_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=200
    )
    
    # UPI (Alternative to bank account)
    upi_id = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100
    )
    
    # Password (Required for login)
    password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_ifsc_code(self, value):
        """Validate IFSC code format"""
        if value:
            import re
            if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value.upper()):
                raise serializers.ValidationError(
                    "Invalid IFSC code format. Example: SBIN0001234"
                )
            return value.upper()
        return value
    
    def validate_upi_id(self, value):
        """Validate UPI ID format"""
        if value:
            import re
            if not re.match(r'^[\w.-]+@[\w.-]+$', value):
                raise serializers.ValidationError(
                    "Invalid UPI ID format. Example: farmer@paytm or 9999999999@upi"
                )
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        
        # Password match check
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Password fields didn't match."
            })
        
        # Either bank account or UPI should be provided
        has_bank = attrs.get('bank_account_number') and attrs.get('ifsc_code')
        has_upi = attrs.get('upi_id')
        
        if not (has_bank or has_upi):
            raise serializers.ValidationError(
                "Please provide either bank account details (Account Number + IFSC) or UPI ID for receiving payments."
            )
        
        return attrs


# ============================================================================
# FARMER PROFILE SERIALIZERS
# ============================================================================

class FarmerProfileSerializer(serializers.ModelSerializer):
    """
    Complete Farmer Profile Serializer
    Used for: Profile View, Profile Update
    """
    
    # Nested user data (read-only)
    user_details = UserSerializer(source='user', read_only=True)
    
    # Computed fields
    location_display = serializers.CharField(read_only=True)
    bank_details_added = serializers.BooleanField(read_only=True)
    can_create_lot = serializers.BooleanField(read_only=True)
    can_receive_payment = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = FarmerProfile
        fields = [
            'id',
            'user',
            'user_details',
            'farmer_id',
            
            # Personal Details
            'father_husband_name',
            'date_of_birth',
            'gender',
            
            # Location
            'village',
            'district',
            'state',
            'pincode',
            'latitude',
            'longitude',
            'location_display',
            
            # Farm Details
            'total_land_area',
            'primary_crops',
            'expected_annual_production',
            
            # Bank Details
            'bank_account_number',
            'ifsc_code',
            'bank_name',
            'branch_name',
            'account_holder_name',
            'upi_id',
            'bank_details_added',
            
            # Verification
            'aadhaar_verified',
            'land_records_uploaded',
            
            # Performance Metrics (read-only)
            'total_transactions',
            'total_revenue',
            'performance_rating',
            'total_ratings',
            'credit_score',
            
            # Profile Status
            'profile_completed',
            'profile_completion_percentage',
            'can_create_lot',
            'can_receive_payment',
            
            # Activity
            'last_lot_created_at',
            'last_transaction_at',
            'is_active_seller',
            
            # Timestamps
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'farmer_id',
            'total_transactions',
            'total_revenue',
            'performance_rating',
            'total_ratings',
            'credit_score',
            'profile_completed',
            'profile_completion_percentage',
            'last_lot_created_at',
            'last_transaction_at',
            'aadhaar_verified',
            'land_records_uploaded',
            'created_at',
            'updated_at',
        ]


class FarmerProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Update Farmer Profile (Editable Fields Only)
    """
    
    class Meta:
        model = FarmerProfile
        fields = [
            # Personal
            'father_husband_name',
            'date_of_birth',
            'gender',
            
            # Location (can update if moved)
            'village',
            'district',
            'state',
            'pincode',
            'latitude',
            'longitude',
            
            # Farm
            'total_land_area',
            'primary_crops',
            'expected_annual_production',
            
            # Bank (can update)
            'bank_account_number',
            'ifsc_code',
            'bank_name',
            'branch_name',
            'account_holder_name',
            'upi_id',
        ]


class FarmerProfileListSerializer(serializers.ModelSerializer):
    """
    Lightweight Farmer Profile for List Views
    Used in: Admin Dashboard, Search Results
    """
    
    farmer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = [
            'id',
            'farmer_id',
            'farmer_name',
            'phone_number',
            'location',
            'total_land_area',
            'primary_crops',
            'performance_rating',
            'total_transactions',
            'is_active_seller',
            'created_at',
        ]
    
    def get_location(self, obj):
        return obj.location_display


class FarmerDashboardSerializer(serializers.ModelSerializer):
    """
    Farmer Dashboard Summary
    Used in: Mobile App Dashboard
    """
    
    user = UserSerializer(read_only=True)
    
    # Stats (these will come from related models)
    active_lots_count = serializers.SerializerMethodField()
    pending_bids_count = serializers.SerializerMethodField()
    this_month_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = [
            'farmer_id',
            'user',
            'location_display',
            'profile_completion_percentage',
            'performance_rating',
            'total_transactions',
            'total_revenue',
            'active_lots_count',
            'pending_bids_count',
            'this_month_revenue',
            'can_create_lot',
            'can_receive_payment',
        ]
    
    def get_active_lots_count(self, obj):
        """Get count of active lots (from procurement app)"""
        # TODO: Import after procurement models are ready
        return 0
    
    def get_pending_bids_count(self, obj):
        """Get count of pending bids (from procurement app)"""
        # TODO: Import after procurement models are ready
        return 0
    
    def get_this_month_revenue(self, obj):
        """Calculate this month's revenue"""
        # TODO: Calculate from transactions
        return 0.00







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

