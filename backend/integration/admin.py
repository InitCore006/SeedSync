from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AgriStackSync, LandRecord, SoilHealthData, 
    ExternalAPILog, SatelliteImagery
)


@admin.register(AgriStackSync)
class AgriStackSyncAdmin(admin.ModelAdmin):
    """Agri-Stack Synchronization"""
    
    list_display = [
        'farmer', 'sync_type', 'last_sync_at', 
        'sync_status', 'error_preview'
    ]
    list_filter = ['sync_type', 'is_successful', 'last_sync_at']
    search_fields = ['farmer__farmer_id', 'sync_type']
    
    def sync_status(self, obj):
        if obj.is_successful:
            return format_html('<span style="color: green;">✓ Success</span>')
        return format_html('<span style="color: red;">✗ Failed</span>')
    sync_status.short_description = 'Status'
    
    def error_preview(self, obj):
        if obj.error_message:
            return format_html(
                '<span style="color: red;" title="{}">{}</span>',
                obj.error_message,
                obj.error_message[:50] + '...' if len(obj.error_message) > 50 else obj.error_message
            )
        return '-'
    error_preview.short_description = 'Error'


@admin.register(LandRecord)
class LandRecordAdmin(admin.ModelAdmin):
    """Land Records"""
    
    list_display = [
        'farmer', 'survey_number', 'land_area', 
        'location', 'ownership_type', 'verification_status'
    ]
    list_filter = ['ownership_type', 'is_verified', 'state']
    search_fields = [
        'farmer__farmer_id', 'survey_number', 
        'khasra_number', 'ulpin'
    ]
    
    fieldsets = (
        ('Farmer', {
            'fields': ('farmer',)
        }),
        ('Land Details', {
            'fields': (
                'survey_number', 'khasra_number', 
                'land_area', 'ownership_type'
            )
        }),
        ('Location', {
            'fields': (
                ('village', 'district', 'state'),
                'ulpin'
            )
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_source')
        }),
    )
    
    def location(self, obj):
        return f"{obj.village}, {obj.district}"
    
    def verification_status(self, obj):
        if obj.is_verified:
            return format_html(
                '<span style="color: green;">✓ Verified</span><br><small>{}</small>',
                obj.verified_source
            )
        return format_html('<span style="color: orange;">⏳ Pending</span>')
    verification_status.short_description = 'Verification'


@admin.register(SoilHealthData)
class SoilHealthDataAdmin(admin.ModelAdmin):
    """Soil Health Cards"""
    
    list_display = [
        'farmer', 'test_date', 'ph_level', 
        'nutrient_summary', 'testing_lab'
    ]
    list_filter = ['test_date', 'nitrogen', 'phosphorus', 'potassium']
    search_fields = ['farmer__farmer_id', 'testing_lab']
    date_hierarchy = 'test_date'
    
    def nutrient_summary(self, obj):
        return format_html(
            'N: {} | P: {} | K: {}',
            obj.nitrogen, obj.phosphorus, obj.potassium
        )
    nutrient_summary.short_description = 'NPK Status'


@admin.register(ExternalAPILog)
class ExternalAPILogAdmin(admin.ModelAdmin):
    """External API Call Logs"""
    
    list_display = [
        'api_name', 'endpoint_preview', 'http_status', 
        'status_indicator', 'response_time', 'created_at'
    ]
    list_filter = ['api_name', 'is_successful', 'http_status', 'created_at']
    search_fields = ['endpoint']
    date_hierarchy = 'created_at'
    
    def endpoint_preview(self, obj):
        return obj.endpoint[:50] + '...' if len(obj.endpoint) > 50 else obj.endpoint
    endpoint_preview.short_description = 'Endpoint'
    
    def status_indicator(self, obj):
        if obj.is_successful:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    status_indicator.short_description = 'Success'


@admin.register(SatelliteImagery)
class SatelliteImageryAdmin(admin.ModelAdmin):
    """Satellite Imagery Analysis"""
    
    list_display = [
        'farmer', 'capture_date', 'satellite_source', 
        'ndvi_display', 'crop_health_score', 'anomaly_status'
    ]
    list_filter = ['satellite_source', 'anomaly_detected', 'capture_date']
    search_fields = ['farmer__farmer_id']
    date_hierarchy = 'capture_date'
    
    def ndvi_display(self, obj):
        if obj.ndvi_value:
            ndvi = float(obj.ndvi_value)
            color = '#28a745' if ndvi > 0.6 else '#ffc107' if ndvi > 0.3 else '#dc3545'
            return format_html(
                '<span style="color: {};">{:.3f}</span>',
                color, ndvi
            )
        return '-'
    ndvi_display.short_description = 'NDVI'
    
    def anomaly_status(self, obj):
        if obj.anomaly_detected:
            return format_html(
                '<span style="color: red;">⚠ {}</span>',
                obj.anomaly_type
            )
        return format_html('<span style="color: green;">✓ Normal</span>')
    anomaly_status.short_description = 'Anomaly'