"""
User Models for SeedSync Platform
Phone-based authentication with OTP
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import timedelta
import uuid

from apps.core.models import TimeStampedModel
from apps.core.constants import USER_ROLE_CHOICES, KYC_STATUS_CHOICES, INDIAN_STATES
from apps.core.validators import validate_indian_phone, validate_aadhaar, validate_pan, validate_pincode
from apps.core.utils import generate_otp, format_phone_number


class UserManager(BaseUserManager):
    """Custom user manager for phone-based authentication"""
    
    def create_user(self, phone_number, role, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')
        if not role:
            raise ValueError('User role is required')
        
        phone_number = format_phone_number(phone_number)
        user = self.model(phone_number=phone_number, role=role, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone_number, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('role', 'government')
        
        # Role is already in extra_fields, don't pass it again
        return self.create_user(phone_number, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with phone-based authentication
    No email required, OTP-based verification
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(
        max_length=15, 
        unique=True, 
        validators=[validate_indian_phone],
        help_text="10-digit mobile number starting with 6-9 (e.g., 9137966960). No need to add +91."
    )
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=USER_ROLE_CHOICES)
    
    # Status fields
    is_verified = models.BooleanField(default=False, help_text="Phone number verified via OTP")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.phone_number} ({self.get_role_display()})"
    
    def get_full_name(self):
        if hasattr(self, 'profile'):
            return self.profile.full_name
        return self.phone_number
    
    def get_short_name(self):
        return self.phone_number


class OTPVerification(TimeStampedModel):
    """
    OTP verification for phone numbers
    Used for registration and login
    """
    OTP_PURPOSE_CHOICES = [
        ('registration', 'Registration'),
        ('login', 'Login'),
        ('password_reset', 'Password Reset'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps', null=True, blank=True)
    phone_number = models.CharField(max_length=15, validators=[validate_indian_phone])
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=OTP_PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'otp_verifications'
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.phone_number} - {self.purpose}"
    
    def is_valid(self):
        """Check if OTP is still valid"""
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        if self.attempts >= 3:
            return False
        return True
    
    def verify(self, otp_input):
        """Verify OTP"""
        self.attempts += 1
        self.save()
        
        if not self.is_valid():
            return False
        
        if self.otp == otp_input:
            self.is_used = True
            self.save()
            return True
        
        return False
    
    @classmethod
    def create_otp(cls, phone_number, purpose, user=None):
        """Create new OTP"""
        otp_code = generate_otp()
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Deactivate all previous OTPs for this phone and purpose
        cls.objects.filter(
            phone_number=phone_number, 
            purpose=purpose, 
            is_used=False
        ).update(is_used=True)
        
        # Create new OTP
        otp = cls.objects.create(
            user=user,
            phone_number=format_phone_number(phone_number),
            otp=otp_code,
            purpose=purpose,
            expires_at=expires_at
        )
        
        return otp


class UserProfile(TimeStampedModel):
    """
    Extended user profile with additional information
    One-to-one relationship with User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # KYC Details
    aadhaar_number = models.CharField(
        max_length=12, 
        blank=True, 
        validators=[validate_aadhaar],
        help_text="12-digit Aadhaar number"
    )
    pan_number = models.CharField(
        max_length=10, 
        blank=True, 
        validators=[validate_pan],
        help_text="PAN format: ABCDE1234F"
    )
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='pending')
    
    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, choices=INDIAN_STATES, blank=True)
    pincode = models.CharField(max_length=6, blank=True, validators=[validate_pincode])
    
    # Location coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Additional
    language_preference = models.CharField(max_length=10, default='hi', choices=[('en', 'English'), ('hi', 'Hindi')])
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.full_name}"
