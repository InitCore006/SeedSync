"""
Admin configuration for Farmers App
"""
from django.contrib import admin
from .models import FarmerProfile, FarmLand, CropPlanning, CropPlan


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


@admin.register(CropPlan)
class CropPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'farmer', 'crop_name', 'land_acres', 'sowing_date', 'status', 'net_profit', 'created_at']
    list_filter = ['status', 'season', 'crop_type', 'sowing_date', 'created_at']
    search_fields = ['farmer__full_name', 'crop_name', 'crop_type', 'notes']
    ordering = ['-created_at', '-sowing_date']
    readonly_fields = [
        'expected_harvest_date', 'gross_revenue', 'total_input_costs', 
        'net_profit', 'profit_per_acre', 'roi_percentage',
        'converted_lot', 'conversion_date', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('farmer', 'farm_land', 'crop_type', 'crop_name', 'land_acres', 'season')
        }),
        ('Timeline', {
            'fields': ('sowing_date', 'maturity_days', 'expected_harvest_date', 'status')
        }),
        ('Yield & MSP', {
            'fields': (
                'msp_price_per_quintal', 'estimated_yield_quintals', 
                'estimated_yield_per_acre', 'actual_yield_quintals', 'gross_revenue'
            )
        }),
        ('Input Costs', {
            'fields': (
                'seed_cost', 'fertilizer_cost', 'pesticide_cost', 
                'labor_cost', 'irrigation_cost', 'total_input_costs'
            )
        }),
        ('Profitability', {
            'fields': ('net_profit', 'profit_per_acre', 'roi_percentage')
        }),
        ('Lot Conversion', {
            'fields': ('converted_lot', 'conversion_date'),
            'classes': ('collapse',)
        }),
        ('Additional', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )
