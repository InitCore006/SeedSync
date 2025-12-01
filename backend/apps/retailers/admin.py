from django.contrib import admin
from django.utils.html import format_html
from .models import Retailer


@admin.register(Retailer)
class RetailerAdmin(admin.ModelAdmin):
    list_display = ['retailer_code', 'business_name', 'user', 'retailer_type',
                    'city', 'state', 'status_badge', 'created_at']
    list_filter = ['is_verified', 'is_active', 'retailer_type', 'state', 'created_at']
    search_fields = ['business_name', 'retailer_code', 'user__full_name', 'gstin']
    readonly_fields = ['retailer_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'business_name', 'retailer_code', 'retailer_type')
        }),
        ('Location', {
            'fields': ('city', 'state', 'pincode')
        }),
        ('Compliance', {
            'fields': ('gstin', 'fssai_license')
        }),
        ('Business', {
            'fields': ('monthly_requirement', 'payment_terms')
        }),
        ('Contact', {
            'fields': ('contact_person', 'contact_phone', 'contact_email')
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