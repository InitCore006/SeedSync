from django.contrib import admin
from django.utils.html import format_html

from apps.fpos.models import FPO
from .models import Farmer

@admin.register(FPO)
class FPOAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'registration_number',
        'district',
        'state',
        'is_active',
        'created_at'
    ]

    search_fields = [
        'name',
        'registration_number',
        'district',
        'state'
    ]

    list_filter = ['state', 'is_active']

    ordering = ['name']


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = [
        'farmer_id',
        'farmer_name',
        'farmer_category',
        'caste_category',
        'is_fpo_member',
        'primary_fpo',
        'total_land_area',
        'average_yield',
        'colored_credit_score',
        'is_active',
        'is_verified',
        'created_at'
    ]
    
    list_filter = [
        'farmer_category',
        'caste_category',
        'is_fpo_member',
        'is_active',
        'is_verified',
        'has_kisan_credit_card',
        'has_pmfby_insurance',
        'has_pm_kisan',
        'created_at'
    ]

    search_fields = [
        'farmer_id',
        'user__full_name',
        'user__phone_number',
    ]

    autocomplete_fields = ['user', 'primary_fpo']

    ordering = ['-created_at']

    readonly_fields = ('credit_score', 'created_at', 'updated_at')

    fieldsets = (
        ('Linked User', {
            'fields': ('user', 'farmer_id')
        }),
        ('Land Details', {
            'fields': (
                'total_land_area',
                'irrigated_land',
                'rain_fed_land',
                'farmer_category',
                'caste_category'
            )
        }),
        ('FPO Membership', {
            'fields': ('is_fpo_member', 'primary_fpo')
        }),
        ('Government Schemes', {
            'fields': (
                'has_kisan_credit_card',
                'kcc_number',
                'has_pmfby_insurance',
                'pmfby_policy_number',
                'has_pm_kisan'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'total_production',
                'average_yield',
                'credit_score'
            )
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    # -------------------
    # Custom Display Fields
    # -------------------

    def farmer_name(self, obj):
        return obj.user.full_name
    farmer_name.short_description = "Farmer"

    def colored_credit_score(self, obj):
        score = obj.credit_score
        color = "red"

        if score >= 80:
            color = "green"
        elif score >= 50:
            color = "orange"

        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            score
        )
    colored_credit_score.short_description = "Credit Score"



