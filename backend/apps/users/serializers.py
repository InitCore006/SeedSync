from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile
import re





class UserProfileSerializer(serializers.ModelSerializer):
    """User Profile Serializer"""
    
    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 'gender', 'profile_picture',
            'address_line1', 'address_line2', 'village', 'block',
            'district', 'state', 'pincode',
            'bank_name', 'account_number', 'ifsc_code', 'account_holder_name',
            'education_level', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_pincode(self, value):
        """Validate Indian pincode"""
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Pincode must be 6 digits")
        return value
    
    def validate_ifsc_code(self, value):
        """Validate IFSC code"""
        if value and not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', value):
            raise serializers.ValidationError("Invalid IFSC code format")
        return value


class UserSerializer(serializers.ModelSerializer):
    """User Serializer with nested profile"""
    
    profile = UserProfileSerializer(required=False)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'full_name', 'role',
            'preferred_language', 'is_phone_verified', 'is_email_verified',
            'is_kyc_verified', 'is_active', 'date_joined', 'last_login',
            'password', 'password_confirm', 'profile'
        ]
        read_only_fields = [
            'id', 'is_phone_verified', 'is_email_verified', 
            'is_kyc_verified', 'date_joined', 'last_login'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate_phone_number(self, value):
        """Validate Indian phone number"""
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be 10 digits starting with 6-9"
            )
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with profile"""
        validated_data.pop('password_confirm')
        profile_data = validated_data.pop('profile', None)
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create profile
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        else:
            UserProfile.objects.create(user=user)
        
        return user
    
    def update(self, instance, validated_data):
        """Update user and profile"""
        profile_data = validated_data.pop('profile', None)
        validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        # Update user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists"""
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'full_name', 
            'role', 'is_active', 'date_joined'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Registration serializer"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'phone_number', 'email', 'full_name', 'role',
            'preferred_language', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create empty profile
        UserProfile.objects.create(user=user)
        
        return user


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        if phone_number and password:
            user = authenticate(
                request=self.context.get('request'),
                username=phone_number,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.',
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Must include "phone_number" and "password".',
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PhoneVerificationSerializer(serializers.Serializer):
    """Phone verification OTP request"""
    
    phone_number = serializers.CharField(required=True)
    
    def validate_phone_number(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be 10 digits starting with 6-9"
            )
        return value


class VerifyOTPSerializer(serializers.Serializer):
    """Verify OTP"""
    
    phone_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)


class ForgotPasswordSerializer(serializers.Serializer):
    """Forgot password - send OTP"""
    
    phone_number = serializers.CharField(required=True)
    
    def validate_phone_number(self, value):
        try:
            User.objects.get(phone_number=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this phone number does not exist")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with OTP"""
    
    phone_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class UserStatsSerializer(serializers.Serializer):
    """User statistics"""
    
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    verified_users = serializers.IntegerField()
    users_by_role = serializers.DictField()
    users_by_state = serializers.DictField()
    recent_registrations = serializers.IntegerField()
    
    
    
class UserWithProfileSerializer(serializers.ModelSerializer):
    """Complete User Serializer with nested profile"""
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'full_name', 'role',
            'preferred_language', 'is_phone_verified', 'is_email_verified',
            'is_kyc_verified', 'is_active', 'date_joined', 'last_login',
            'profile'
        ]
        read_only_fields = [
            'id', 'is_phone_verified', 'is_email_verified', 
            'is_kyc_verified', 'date_joined', 'last_login', 'role'
        ]
    
    
    
class UpdateUserProfileSerializer(serializers.Serializer):
    """Serializer for updating user + profile in one request"""
    
    # User fields
    full_name = serializers.CharField(max_length=200, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)
    preferred_language = serializers.CharField(required=False)
    
    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['M', 'F', 'O'], required=False)
    address_line1 = serializers.CharField(required=False, allow_blank=True)
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    village = serializers.CharField(required=False, allow_blank=True)
    block = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=6, required=False)
    
    # Bank details
    bank_name = serializers.CharField(required=False, allow_blank=True)
    account_number = serializers.CharField(required=False, allow_blank=True)
    ifsc_code = serializers.CharField(required=False, allow_blank=True)
    account_holder_name = serializers.CharField(required=False, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    
    def validate_pincode(self, value):
        if value and not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Pincode must be 6 digits")
        return value
    
    def update(self, instance, validated_data):
        """Update user and profile"""
        user = instance
        profile = user.profile
        
        # Update user fields
        user_fields = ['full_name', 'email', 'preferred_language']
        for field in user_fields:
            if field in validated_data:
                setattr(user, field, validated_data[field])
        user.save()
        
        # Update profile fields
        profile_fields = [
            'date_of_birth', 'gender', 'address_line1', 'address_line2',
            'village', 'block', 'district', 'state', 'pincode',
            'bank_name', 'account_number', 'ifsc_code', 
            'account_holder_name', 'education_level'
        ]
        for field in profile_fields:
            if field in validated_data:
                setattr(profile, field, validated_data[field])
        profile.save()
        
        return user

    
    
    
    
    
    
    
    