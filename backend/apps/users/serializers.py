"""
Serializers for Users & Authentication
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTPVerification, UserProfile
from apps.core.utils import format_phone_number, validate_phone_number


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'profile_photo', 'aadhaar_number', 'pan_number',
            'kyc_status', 'address', 'city', 'district', 'state', 'pincode',
            'latitude', 'longitude', 'language_preference'
        ]
        read_only_fields = ['kyc_status']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""
    profile = UserProfileSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'role', 'role_display',
            'is_verified', 'is_active', 'date_joined', 'last_login', 'profile'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined', 'last_login']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    phone_number = serializers.CharField(max_length=15)
    role = serializers.ChoiceField(choices=User._meta.get_field('role').choices)
    full_name = serializers.CharField(max_length=200, required=False)
    
    def validate_phone_number(self, value):
        """Validate and format phone number (accepts 10 digits)"""
        if not validate_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number. Enter 10 digits starting with 6-9. "
                "Example: 9137966960 (no need for +91)"
            )
        
        # Format to +91XXXXXXXXXX (adds +91 automatically)
        phone = format_phone_number(value)
        
        # Check if user already exists
        if User.objects.filter(phone_number=phone).exists():
            raise serializers.ValidationError("User with this phone number already exists")
        
        return phone
    
    def create(self, validated_data):
        """Create user and profile"""
        full_name = validated_data.pop('full_name', '')
        
        # Create user
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            role=validated_data['role']
        )
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            full_name=full_name
        )
        
        # Create OTP
        otp = OTPVerification.create_otp(
            phone_number=user.phone_number,
            purpose='registration',
            user=user
        )
        
        return user, otp


class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP (accepts 10 digits)"""
    phone_number = serializers.CharField(max_length=15)
    purpose = serializers.ChoiceField(choices=OTPVerification._meta.get_field('purpose').choices, default='login')
    
    def validate_phone_number(self, value):
        """Validate phone number (10 digits, auto-adds +91)"""
        if not validate_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number. Enter 10 digits starting with 6-9. "
                "Example: 9137966960"
            )
        return format_phone_number(value)


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification (accepts 10 digits)"""
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(choices=OTPVerification._meta.get_field('purpose').choices, default='login')
    
    def validate_phone_number(self, value):
        """Validate phone number (10 digits, auto-adds +91)"""
        if not validate_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number. Enter 10 digits starting with 6-9."
            )
        return format_phone_number(value)
    
    def validate(self, attrs):
        """Validate OTP"""
        phone_number = attrs.get('phone_number')
        otp = attrs.get('otp')
        purpose = attrs.get('purpose')
        
        # Bypass OTP for development: Accept 000000 as valid
        if otp == '000000':
            attrs['bypass'] = True
            return attrs
        
        # Get latest OTP
        try:
            otp_obj = OTPVerification.objects.filter(
                phone_number=phone_number,
                purpose=purpose,
                is_used=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError("No OTP found for this phone number")
        
        # Verify OTP
        if not otp_obj.verify(otp):
            raise serializers.ValidationError("Invalid or expired OTP")
        
        attrs['otp_obj'] = otp_obj
        return attrs


class LoginSerializer(serializers.Serializer):
    """Serializer for login with OTP"""
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)
    
    def validate(self, attrs):
        """Validate login credentials"""
        phone_number = format_phone_number(attrs.get('phone_number'))
        otp = attrs.get('otp')
        
        # Get user
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found. Please register first.")
        
        # Bypass OTP for development: Accept 000000 as valid
        if otp == '000000':
            # Mark user as verified if not already
            if not user.is_verified:
                user.is_verified = True
                user.save()
            attrs['user'] = user
            return attrs
        
        # Verify OTP
        try:
            otp_obj = OTPVerification.objects.filter(
                phone_number=phone_number,
                purpose='login',
                is_used=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError("No OTP found. Please request a new OTP.")
        
        if not otp_obj.verify(otp):
            raise serializers.ValidationError("Invalid or expired OTP")
        
        # Mark user as verified if not already
        if not user.is_verified:
            user.is_verified = True
            user.save()
        
        attrs['user'] = user
        return attrs
    
    def create(self, validated_data):
        """Generate JWT tokens"""
        user = validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return {
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    email = serializers.EmailField(required=False, allow_blank=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'profile_photo', 'address', 'city', 
            'district', 'state', 'pincode', 'latitude', 'longitude',
            'language_preference', 'email'
        ]
    
    def update(self, instance, validated_data):
        """Update profile and user email if provided"""
        email = validated_data.pop('email', None)
        
        # Update user email
        if email is not None:
            instance.user.email = email
            instance.user.save()
        
        # Update profile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password (optional feature)"""
    old_password = serializers.CharField(required=False)
    new_password = serializers.CharField(min_length=6)
    
    def validate(self, attrs):
        """Validate password change"""
        user = self.context['request'].user
        
        # If user has a password, verify old password
        if user.has_usable_password():
            old_password = attrs.get('old_password')
            if not old_password:
                raise serializers.ValidationError({"old_password": "This field is required"})
            if not user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "Incorrect password"})
        
        return attrs
    
    def save(self):
        """Set new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
