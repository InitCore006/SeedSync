"""
Admin configuration for Farmers App
"""
from django.contrib import admin
from .models import FarmerProfile, FarmLand, CropPlanning


@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user', 'district', 'state', 'total_land_acres', 'kyc_status', 'fpo']
    list_filter = ['state', 'kyc_status', 'fpo', 'created_at']
    search_fields = ['full_name', 'user__phone_number', 'aadhaar_number', 'district']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'total_lots_created', 'total_quantity_sold_quintals', 'total_earnings']
    
    fieldsets = (
        ('User & FPO', {'fields': ('user', 'fpo')}),
        ('Personal Details', {'fields': ('full_name', 'father_name', 'date_of_birth', 'gender', 'profile_photo')}),
        ('Farm Details', {'fields': ('total_land_acres', 'farming_experience_years', 'primary_crops')}),
        ('KYC', {'fields': ('aadhaar_number', 'pan_number', 'kyc_status', 'kyc_documents')}),
        ('Bank Details', {'fields': ('bank_account_number', 'bank_account_holder_name', 'ifsc_code', 'bank_name', 'bank_branch')}),
        ('Address', {'fields': ('village', 'post_office', 'tehsil', 'district', 'state', 'pincode', 'latitude', 'longitude')}),
        ('Statistics', {'fields': ('total_lots_created', 'total_quantity_sold_quintals', 'total_earnings')}),
        ('Preferences', {'fields': ('preferred_language',)}),
    )


@admin.register(FarmLand)
class FarmLandAdmin(admin.ModelAdmin):
    list_display = ['land_name', 'farmer', 'land_area_acres', 'soil_type', 'irrigation_available', 'ownership_type']
    list_filter = ['soil_type', 'irrigation_available', 'ownership_type', 'created_at']
    search_fields = ['land_name', 'farmer__full_name', 'survey_number']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CropPlanning)
class CropPlanningAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'crop_type', 'season', 'sowing_date', 'cultivation_area_acres', 'status']
    list_filter = ['crop_type', 'season', 'status', 'organic_farming', 'sowing_date']
    search_fields = ['farmer__full_name', 'farm_land__land_name']
    ordering = ['-sowing_date']
    readonly_fields = ['created_at', 'updated_at']
