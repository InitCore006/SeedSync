from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CropType, CropCycle, WeatherAlert, 
    PestDiseaseDetection, CropAdvisory
)


@admin.register(CropType)
class CropTypeAdmin(admin.ModelAdmin):
    """Crop Type Master Data"""
    
    list_display = [
        'name', 'scientific_name', 'growing_season', 
        'maturity_days', 'temperature_range'
    ]
    list_filter = ['growing_season']
    search_fields = ['name', 'scientific_name']
    
    def temperature_range(self, obj):
        return f"{obj.ideal_temperature_min}°C - {obj.ideal_temperature_max}°C"
    temperature_range.short_description = 'Ideal Temperature'


@admin.register(CropCycle)
class CropCycleAdmin(admin.ModelAdmin):
    """Crop Cycle Management"""
    
    list_display = [
        'cycle_id', 'get_farmer_name', 'crop_type', 
        'area_planted', 'status', 'yield_comparison', 'sowing_date'
    ]
    list_filter = ['status', 'crop_type', 'sowing_date']
    search_fields = ['cycle_id', 'farmer__user__first_name', 'farmer__farmer_id']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('cycle_id', 'farmer', 'crop_type', 'status')
        }),
        ('Planting Details', {
            'fields': ('area_planted', 'sowing_date', 'expected_harvest_date', 'actual_harvest_date')
        }),
        ('Yield', {
            'fields': ('predicted_yield', 'actual_yield')
        }),
        ('AI Metadata', {
            'fields': ('ai_recommendation_score',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['cycle_id']
    
    def get_farmer_name(self, obj):
        return obj.farmer.user.get_full_name() or obj.farmer.farmer_id
    get_farmer_name.short_description = 'Farmer'
    
    def yield_comparison(self, obj):
        """Compare predicted vs actual yield"""
        if obj.predicted_yield and obj.actual_yield:
            accuracy = (min(obj.actual_yield, obj.predicted_yield) / 
                       max(obj.actual_yield, obj.predicted_yield)) * 100
            color = 'green' if accuracy >= 80 else 'orange' if accuracy >= 60 else 'red'
            return format_html(
                'Predicted: {} | Actual: {} | <span style="color: {};">{:.1f}% Accuracy</span>',
                obj.predicted_yield, obj.actual_yield, color, accuracy
            )
        return '-'
    yield_comparison.short_description = 'Yield Analysis'


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    """Weather Alerts"""
    
    list_display = [
        'farmer', 'alert_type', 'severity_badge', 
        'valid_from', 'valid_till', 'is_read'
    ]
    list_filter = ['severity', 'alert_type', 'is_read', 'valid_from']
    search_fields = ['farmer__farmer_id', 'alert_type']
    date_hierarchy = 'valid_from'
    
    def severity_badge(self, obj):
        colors = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107',
            'HIGH': '#fd7e14',
            'CRITICAL': '#dc3545'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            colors.get(obj.severity, '#6c757d'), obj.severity
        )
    severity_badge.short_description = 'Severity'


@admin.register(PestDiseaseDetection)
class PestDiseaseDetectionAdmin(admin.ModelAdmin):
    """Pest/Disease Detection"""
    
    list_display = [
        'crop_cycle', 'detected_pest', 'confidence_badge', 
        'severity_level', 'is_treated', 'created_at'
    ]
    list_filter = ['severity_level', 'is_treated', 'created_at']
    search_fields = ['detected_pest', 'crop_cycle__cycle_id']
    
    fieldsets = (
        ('Detection', {
            'fields': ('crop_cycle', 'image', 'detected_pest', 'confidence_score')
        }),
        ('Recommendation', {
            'fields': ('severity_level', 'treatment_recommendation')
        }),
        ('Treatment Status', {
            'fields': ('is_treated', 'treatment_date')
        }),
    )
    
    def confidence_badge(self, obj):
        confidence = float(obj.confidence_score)
        color = 'green' if confidence >= 80 else 'orange' if confidence >= 60 else 'red'
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color, confidence
        )
    confidence_badge.short_description = 'AI Confidence'


@admin.register(CropAdvisory)
class CropAdvisoryAdmin(admin.ModelAdmin):
    """Crop Advisories"""
    
    list_display = [
        'farmer', 'advisory_type', 'title', 
        'ai_confidence', 'is_read', 'farmer_feedback', 'created_at'
    ]
    list_filter = ['advisory_type', 'is_read', 'created_at']
    search_fields = ['farmer__farmer_id', 'title']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Advisory', {
            'fields': ('farmer', 'crop_cycle', 'advisory_type', 'title', 'message')
        }),
        ('AI Metadata', {
            'fields': ('ai_confidence', 'data_sources'),
            'classes': ('collapse',)
        }),
        ('Engagement', {
            'fields': ('is_read', 'farmer_feedback')
        }),
    )