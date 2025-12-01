from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid

class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User Model with role-based access"""
    
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('fpo_admin', 'FPO Administrator'),
        ('processor', 'Processor'),
        ('retailer', 'Retailer'),
        ('admin', 'System Admin'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('bn', 'Bengali'),
        ('te', 'Telugu'),
        ('mr', 'Marathi'),
        ('ta', 'Tamil'),
        ('gu', 'Gujarati'),
        ('kn', 'Kannada'),
        ('ml', 'Malayalam'),
        ('pa', 'Punjabi'),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_regex = RegexValidator(
        regex=r'^[6-9]\d{9}$',
        message="Phone number must be 10 digits starting with 6-9"
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=10,
        unique=True,
        db_index=True
    )
    email = models.EmailField(unique=True, null=True, blank=True)
    
    # Personal Information
    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    preferred_language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='en'
    )
    
    # Verification Status
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_kyc_verified = models.BooleanField(default=False)
    
    # Account Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Device Info (for mobile app)
    fcm_token = models.TextField(blank=True, null=True)  # Firebase push notifications
    device_id = models.CharField(max_length=200, blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name', 'role']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"
    
    def get_full_name(self):
        return self.full_name


class UserProfile(models.Model):
    """Extended user profile information"""
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Details
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True
    )
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    village = models.CharField(max_length=100, blank=True)
    block = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    # Bank Details (for payments)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=11, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    
    # Education
    education_level = models.CharField(
        max_length=50,
        choices=[
            ('no_formal', 'No Formal Education'),
            ('primary', 'Primary'),
            ('secondary', 'Secondary'),
            ('higher_secondary', 'Higher Secondary'),
            ('graduate', 'Graduate'),
            ('postgraduate', 'Post Graduate'),
        ],
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"



