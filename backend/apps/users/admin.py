from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['phone_number', 'full_name', 'email', 'role', 'verification_badges', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_kyc_verified', 'is_phone_verified', 'date_joined']
    search_fields = ['phone_number', 'full_name', 'email']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('phone_number', 'password')
        }),
        ('Personal Info', {
            'fields': ('full_name', 'email', 'role', 'preferred_language')
        }),
        ('Verification Status', {
            'fields': ('is_phone_verified', 'is_email_verified', 'is_kyc_verified')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': ('phone_number', 'full_name', 'email', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined')
    
    def verification_badges(self, obj):
        badges = []
        if obj.is_phone_verified:
            badges.append('<span style="color: green;">📱 Phone</span>')
        if obj.is_email_verified:
            badges.append('<span style="color: green;">📧 Email</span>')
        if obj.is_kyc_verified:
            badges.append('<span style="color: green;">✅ KYC</span>')
        
        return format_html(' '.join(badges) if badges else '<span style="color: red;">❌ None</span>')
    
    verification_badges.short_description = 'Verified'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'district', 'state', 'gender', 'education_level']
    list_filter = ['state', 'gender', 'education_level']
    search_fields = ['user__full_name', 'district', 'state', 'village']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Details', {
            'fields': ('date_of_birth', 'gender', 'profile_picture', 'education_level')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'village', 'block', 'district', 'state', 'pincode')
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_number', 'ifsc_code', 'account_holder_name')
        }),
    )



