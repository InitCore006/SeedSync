from django.contrib import admin
from django.utils.html import format_html
from .models import FPO, FPOMembership


@admin.register(FPO)
class FPOAdmin(admin.ModelAdmin):
    list_display = ['fpo_code', 'name', 'owner', 'district', 'state', 
                    'total_members', 'status_badge', 'created_at']
    list_filter = ['is_verified', 'is_active', 'state', 'created_at']
    search_fields = ['name', 'fpo_code', 'owner__full_name', 'registration_number']
    readonly_fields = ['fpo_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('owner', 'name', 'fpo_code')
        }),
        ('Location', {
            'fields': ('district', 'state', 'pincode')
        }),
        ('Contact', {
            'fields': ('contact_person', 'contact_phone', 'contact_email')
        }),
        ('Registration', {
            'fields': ('registration_number', 'gstin')
        }),
        ('Metrics', {
            'fields': ('total_members', 'total_land_area', 'monthly_capacity')
        }),
        ('Status', {
            'fields': ('is_verified', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def status_badge(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✅ Verified</span>')
        return format_html('<span style="color: orange;">⏳ Pending</span>')
    status_badge.short_description = 'Status'


@admin.register(FPOMembership)
class FPOMembershipAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'fpo', 'land_area', 'is_active', 'joined_at']
    list_filter = ['is_active', 'fpo', 'joined_at']
    search_fields = ['farmer__full_name', 'fpo__name']
    readonly_fields = ['joined_at']