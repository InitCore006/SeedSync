"""
Admin configuration for Users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPVerification, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['phone_number', 'role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['phone_number', 'email']
    ordering = ['-date_joined']
    
    # Important: Specify that phone_number is the username field
    username_field = 'phone_number'
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('email', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'role', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'otp', 'purpose', 'is_used', 'expires_at', 'created_at']
    list_filter = ['purpose', 'is_used', 'created_at']
    search_fields = ['phone_number', 'otp']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'city', 'state', 'kyc_status']
    list_filter = ['kyc_status', 'state', 'language_preference']
    search_fields = ['full_name', 'user__phone_number', 'aadhaar_number', 'pan_number']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
