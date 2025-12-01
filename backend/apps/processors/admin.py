from django.contrib import admin
from django.utils.html import format_html
from .models import Processor


@admin.register(Processor)
class ProcessorAdmin(admin.ModelAdmin):
    list_display = ['processor_code', 'company_name', 'user', 'city', 'state',
                    'business_scale', 'status_badge', 'created_at']
    list_filter = ['is_verified', 'is_active', 'business_scale', 'state', 'created_at']
    search_fields = ['company_name', 'processor_code', 'user__full_name', 'gstin']
    readonly_fields = ['processor_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'company_name', 'processor_code', 'business_scale')
        }),
        ('Location', {
            'fields': ('city', 'state', 'pincode')
        }),
        ('Compliance', {
            'fields': ('gstin', 'fssai_license')
        }),
        ('Capacity', {
            'fields': ('monthly_capacity', 'monthly_requirement')
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