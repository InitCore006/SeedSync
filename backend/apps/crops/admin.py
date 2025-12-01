from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Crop, CropInput, CropObservation,
    HarvestRecord, CropTransaction, CropPrediction
)


# ==================== INLINE ADMINS ====================
class CropInputInline(admin.TabularInline):
    model = CropInput
    extra = 0
    fields = ['input_type', 'input_name', 'quantity', 'unit', 'application_date', 'cost']
    readonly_fields = ['added_by', 'created_at']


class CropObservationInline(admin.TabularInline):
    model = CropObservation
    extra = 0
    fields = ['observation_date', 'pest_infestation', 'disease_detected', 'disease_name', 'plant_height']
    readonly_fields = ['recorded_by', 'created_at']
    max_num = 5


class CropTransactionInline(admin.TabularInline):
    model = CropTransaction
    extra = 0
    fields = ['transaction_id', 'transaction_type', 'from_user', 'to_user', 'quantity', 'total_amount', 'payment_status']
    readonly_fields = ['transaction_id', 'transaction_date', 'created_at']
    can_delete = False


# ==================== CROP ADMIN ====================
@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = [
        'crop_id',
        'colored_crop_type',
        'variety',
        'farmer_link',
        'fpo_link',
        'planted_area',
        'colored_status',
        'planting_date',
        'days_since_planting',
        'estimated_yield',
        'actual_yield',
        'yield_efficiency',
        'quality_grade_badge',
        'has_blockchain',
        'is_verified',
        'created_at'
    ]
    
    list_filter = [
        'crop_type',
        'status',
        'quality_grade',
        'state',
        'district',
        'fpo',
        'planting_date',
        'created_at',
        ('actual_harvest_date', admin.EmptyFieldListFilter),
        ('blockchain_hash', admin.EmptyFieldListFilter),
    ]
    
    search_fields = [
        'crop_id',
        'variety',
        'farmer__full_name',
        'farmer__phone_number',
        'fpo__name',
        'location_address',
    ]
    
    autocomplete_fields = ['farmer', 'fpo', 'added_by']
    
    readonly_fields = [
        'id',
        'crop_id',
        'blockchain_hash',
        'created_at',
        'updated_at',
        'days_since_planting_display',
        'days_until_harvest_display',
        'location_map',
    ]
    
    ordering = ['-created_at']
    
    date_hierarchy = 'planting_date'
    
    fieldsets = (
        ('Crop Identification', {
            'fields': ('id', 'crop_id', 'crop_type', 'variety')
        }),
        ('Ownership & Management', {
            'fields': ('farmer', 'fpo', 'added_by')
        }),
        ('Cultivation Details', {
            'fields': (
                'planted_area',
                'planting_date',
                'expected_harvest_date',
                'actual_harvest_date',
                'days_since_planting_display',
                'days_until_harvest_display',
            )
        }),
        ('Location Information', {
            'fields': (
                'location_address',
                'district',
                'state',
                'latitude',
                'longitude',
                'location_map',
            )
        }),
        ('Status & Yield', {
            'fields': (
                'status',
                'estimated_yield',
                'actual_yield',
            )
        }),
        ('Quality Metrics', {
            'fields': (
                'oil_content_percentage',
                'moisture_content',
                'quality_grade',
            )
        }),
        ('Blockchain & Traceability', {
            'fields': ('blockchain_hash',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CropInputInline, CropObservationInline, CropTransactionInline]
    
    actions = [
        'mark_as_growing',
        'mark_as_harvested',
        'export_to_blockchain',
        'generate_quality_report',
    ]
    
    # -------------------
    # Custom Display Methods
    # -------------------
    
    @admin.display(description='Crop Type', ordering='crop_type')
    def colored_crop_type(self, obj):
        colors = {
            'groundnut': '#8B4513',
            'mustard': '#FFD700',
            'sunflower': '#FFA500',
            'soybean': '#90EE90',
            'sesame': '#D2691E',
            'safflower': '#FF6347',
            'castor': '#8B0000',
            'linseed': '#4169E1',
            'niger': '#2F4F4F',
        }
        color = colors.get(obj.crop_type, '#666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{}</span>',
            color,
            obj.get_crop_type_display()
        )
    
    @admin.display(description='Status', ordering='status')
    def colored_status(self, obj):
        colors = {
            'planted': '#6c757d',
            'growing': '#28a745',
            'flowering': '#ffc107',
            'matured': '#17a2b8',
            'harvested': '#007bff',
            'processed': '#6f42c1',
            'sold': '#20c997',
        }
        color = colors.get(obj.status, '#666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            color,
            obj.get_status_display()
        )
    
    @admin.display(description='Farmer')
    def farmer_link(self, obj):
        url = reverse('admin:users_user_change', args=[obj.farmer.id])
        return format_html('<a href="{}">{}</a>', url, obj.farmer.full_name)
    
    @admin.display(description='FPO')
    def fpo_link(self, obj):
        if obj.fpo:
            url = reverse('admin:fpos_fpo_change', args=[obj.fpo.id])
            return format_html('<a href="{}">{}</a>', url, obj.fpo.name)
        return '-'
    
    @admin.display(description='Days Since Planting')
    def days_since_planting(self, obj):
        from django.utils import timezone
        days = (timezone.now().date() - obj.planting_date).days
        if days < 30:
            color = 'green'
        elif days < 90:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} days</span>',
            color, days
        )
    
    @admin.display(description='Yield Efficiency')
    def yield_efficiency(self, obj):
        if obj.actual_yield and obj.estimated_yield:
            efficiency = (obj.actual_yield / obj.estimated_yield) * 100
            color = 'green' if efficiency >= 90 else 'orange' if efficiency >= 70 else 'red'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color, efficiency
            )
        return '-'
    
    @admin.display(description='Quality', ordering='quality_grade')
    def quality_grade_badge(self, obj):
        if obj.quality_grade:
            colors = {'A': 'success', 'B': 'info', 'C': 'warning', 'D': 'danger'}
            badge_color = colors.get(obj.quality_grade, 'secondary')
            return format_html(
                '<span class="badge badge-{}">{}</span>',
                badge_color, obj.quality_grade
            )
        return '-'
    
    @admin.display(description='Blockchain', boolean=True)
    def has_blockchain(self, obj):
        return bool(obj.blockchain_hash)
    
    @admin.display(description='Verified', boolean=True)
    def is_verified(self, obj):
        return obj.status in ['harvested', 'processed', 'sold'] and bool(obj.blockchain_hash)
    
    @admin.display(description='Days Since Planting')
    def days_since_planting_display(self, obj):
        from django.utils import timezone
        days = (timezone.now().date() - obj.planting_date).days
        return f"{days} days"
    
    @admin.display(description='Days Until Harvest')
    def days_until_harvest_display(self, obj):
        if obj.actual_harvest_date:
            return "Already harvested"
        from django.utils import timezone
        days = (obj.expected_harvest_date - timezone.now().date()).days
        if days < 0:
            return format_html('<span style="color: red;">Overdue by {} days</span>', abs(days))
        return f"{days} days remaining"
    
    @admin.display(description='Location Map')
    def location_map(self, obj):
        if obj.latitude and obj.longitude:
            map_url = f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
            return format_html(
                '<a href="{}" target="_blank">📍 View on Google Maps</a>',
                map_url
            )
        return '-'
    
    # -------------------
    # Custom Actions
    # -------------------
    
    @admin.action(description='Mark selected crops as Growing')
    def mark_as_growing(self, request, queryset):
        updated = queryset.filter(status='planted').update(status='growing')
        self.message_user(request, f'{updated} crop(s) marked as growing.')
    
    @admin.action(description='Mark selected crops as Harvested')
    def mark_as_harvested(self, request, queryset):
        from django.utils import timezone
        updated = 0
        for crop in queryset.filter(status__in=['matured', 'flowering', 'growing']):
            crop.status = 'harvested'
            crop.actual_harvest_date = timezone.now().date()
            crop.save()
            updated += 1
        self.message_user(request, f'{updated} crop(s) marked as harvested.')
    
    @admin.action(description='Generate Blockchain Hash')
    def export_to_blockchain(self, request, queryset):
        import hashlib
        import json
        updated = 0
        for crop in queryset.filter(blockchain_hash=''):
            crop_data = {
                'crop_id': crop.crop_id,
                'farmer': str(crop.farmer.id),
                'crop_type': crop.crop_type,
                'planting_date': str(crop.planting_date),
            }
            hash_string = json.dumps(crop_data, sort_keys=True)
            crop.blockchain_hash = hashlib.sha256(hash_string.encode()).hexdigest()
            crop.save()
            updated += 1
        self.message_user(request, f'{updated} crop(s) exported to blockchain.')
    
    @admin.action(description='Generate Quality Report')
    def generate_quality_report(self, request, queryset):
        # Placeholder for quality report generation
        self.message_user(request, f'Quality report generated for {queryset.count()} crop(s).')


# ==================== CROP INPUT ADMIN ====================
@admin.register(CropInput)
class CropInputAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'crop_link',
        'colored_input_type',
        'input_name',
        'quantity',
        'unit',
        'application_date',
        'cost',
        'added_by_link',
        'created_at'
    ]
    
    list_filter = [
        'input_type',
        'application_date',
        'created_at',
    ]
    
    search_fields = [
        'input_name',
        'crop__crop_id',
        'crop__farmer__full_name',
    ]
    
    autocomplete_fields = ['crop', 'added_by']
    
    readonly_fields = ['created_at']
    
    ordering = ['-application_date']
    
    date_hierarchy = 'application_date'
    
    @admin.display(description='Crop')
    def crop_link(self, obj):
        url = reverse('admin:crops_crop_change', args=[obj.crop.id])
        return format_html('<a href="{}">{}</a>', url, obj.crop.crop_id)
    
    @admin.display(description='Input Type', ordering='input_type')
    def colored_input_type(self, obj):
        colors = {
            'fertilizer': '#28a745',
            'pesticide': '#dc3545',
            'herbicide': '#ffc107',
            'seed': '#17a2b8',
            'irrigation': '#007bff',
        }
        color = colors.get(obj.input_type, '#666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            color,
            obj.get_input_type_display()
        )
    
    @admin.display(description='Added By')
    def added_by_link(self, obj):
        if obj.added_by:
            url = reverse('admin:users_user_change', args=[obj.added_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.added_by.full_name)
        return '-'


# ==================== CROP OBSERVATION ADMIN ====================
@admin.register(CropObservation)
class CropObservationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'crop_link',
        'observation_date',
        'plant_height',
        'pest_alert',
        'disease_alert',
        'has_image',
        'has_ai_analysis',
        'recorded_by_link',
        'created_at'
    ]
    
    list_filter = [
        'pest_infestation',
        'disease_detected',
        'observation_date',
        'created_at',
    ]
    
    search_fields = [
        'crop__crop_id',
        'disease_name',
        'notes',
    ]
    
    autocomplete_fields = ['crop', 'recorded_by']
    
    readonly_fields = ['ai_analysis_result', 'created_at', 'image_preview']
    
    ordering = ['-observation_date']
    
    date_hierarchy = 'observation_date'
    
    fieldsets = (
        ('Observation Info', {
            'fields': ('crop', 'observation_date', 'recorded_by')
        }),
        ('Plant Health', {
            'fields': (
                'plant_height',
                'leaf_color',
                'pest_infestation',
                'disease_detected',
                'disease_name',
            )
        }),
        ('Environmental Data', {
            'fields': ('soil_moisture', 'temperature', 'rainfall')
        }),
        ('Image & AI Analysis', {
            'fields': ('image', 'image_preview', 'ai_analysis_result')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    @admin.display(description='Crop')
    def crop_link(self, obj):
        url = reverse('admin:crops_crop_change', args=[obj.crop.id])
        return format_html('<a href="{}">{}</a>', url, obj.crop.crop_id)
    
    @admin.display(description='Pest Alert', boolean=True)
    def pest_alert(self, obj):
        return obj.pest_infestation
    
    @admin.display(description='Disease Alert', boolean=True)
    def disease_alert(self, obj):
        return obj.disease_detected
    
    @admin.display(description='Has Image', boolean=True)
    def has_image(self, obj):
        return bool(obj.image)
    
    @admin.display(description='AI Analysis', boolean=True)
    def has_ai_analysis(self, obj):
        return bool(obj.ai_analysis_result)
    
    @admin.display(description='Recorded By')
    def recorded_by_link(self, obj):
        if obj.recorded_by:
            url = reverse('admin:users_user_change', args=[obj.recorded_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.recorded_by.full_name)
        return '-'
    
    @admin.display(description='Image Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="200" />', obj.image.url)
        return '-'


# ==================== HARVEST RECORD ADMIN ====================
@admin.register(HarvestRecord)
class HarvestRecordAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'crop_link',
        'harvest_date',
        'total_yield',
        'quality_grade_badge',
        'oil_content',
        'moisture_level',
        'is_organic',
        'market_price_per_quintal',
        'total_revenue',
        'harvested_by_link',
        'created_at'
    ]
    
    list_filter = [
        'quality_grade',
        'organic_certified',
        'harvest_date',
        'created_at',
    ]
    
    search_fields = [
        'crop__crop_id',
        'storage_location',
        'certification_number',
    ]
    
    autocomplete_fields = ['crop', 'harvested_by']
    
    readonly_fields = ['created_at']
    
    ordering = ['-harvest_date']
    
    date_hierarchy = 'harvest_date'
    
    @admin.display(description='Crop')
    def crop_link(self, obj):
        url = reverse('admin:crops_crop_change', args=[obj.crop.id])
        return format_html('<a href="{}">{}</a>', url, obj.crop.crop_id)
    
    @admin.display(description='Quality Grade', ordering='quality_grade')
    def quality_grade_badge(self, obj):
        colors = {'A': 'success', 'B': 'info', 'C': 'warning', 'D': 'danger'}
        badge_color = colors.get(obj.quality_grade, 'secondary')
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            badge_color, obj.quality_grade
        )
    
    @admin.display(description='Organic', boolean=True)
    def is_organic(self, obj):
        return obj.organic_certified
    
    @admin.display(description='Harvested By')
    def harvested_by_link(self, obj):
        if obj.harvested_by:
            url = reverse('admin:users_user_change', args=[obj.harvested_by.id])
            return format_html('<a href="{}">{}</a>', url, obj.harvested_by.full_name)
        return '-'


# ==================== CROP TRANSACTION ADMIN ====================
@admin.register(CropTransaction)
class CropTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id',
        'crop_link',
        'colored_transaction_type',
        'from_user_link',
        'to_user_link',
        'quantity',
        'total_amount',
        'payment_status_badge',
        'is_verified_badge',
        'has_blockchain',
        'transaction_date'
    ]
    
    list_filter = [
        'transaction_type',
        'payment_status',
        'is_verified',
        'transaction_date',
        'created_at',
    ]
    
    search_fields = [
        'transaction_id',
        'crop__crop_id',
        'from_user__full_name',
        'to_user__full_name',
    ]
    
    autocomplete_fields = ['crop', 'from_user', 'to_user']
    
    readonly_fields = ['id', 'transaction_id', 'transaction_date', 'blockchain_hash', 'created_at']
    
    ordering = ['-transaction_date']
    
    date_hierarchy = 'transaction_date'
    
    actions = ['verify_transactions', 'mark_payment_completed']
    
    @admin.display(description='Crop')
    def crop_link(self, obj):
        url = reverse('admin:crops_crop_change', args=[obj.crop.id])
        return format_html('<a href="{}">{}</a>', url, obj.crop.crop_id)
    
    @admin.display(description='Transaction Type', ordering='transaction_type')
    def colored_transaction_type(self, obj):
        return format_html(
            '<span style="background-color: #007bff; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            obj.get_transaction_type_display()
        )
    
    @admin.display(description='From')
    def from_user_link(self, obj):
        if obj.from_user:
            url = reverse('admin:users_user_change', args=[obj.from_user.id])
            return format_html('<a href="{}">{}</a>', url, obj.from_user.full_name)
        return '-'
    
    @admin.display(description='To')
    def to_user_link(self, obj):
        if obj.to_user:
            url = reverse('admin:users_user_change', args=[obj.to_user.id])
            return format_html('<a href="{}">{}</a>', url, obj.to_user.full_name)
        return '-'
    
    @admin.display(description='Payment Status')
    def payment_status_badge(self, obj):
        colors = {'pending': 'warning', 'completed': 'success', 'failed': 'danger'}
        badge_color = colors.get(obj.payment_status, 'secondary')
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            badge_color, obj.payment_status.upper()
        )
    
    @admin.display(description='Verified', boolean=True)
    def is_verified_badge(self, obj):
        return obj.is_verified
    
    @admin.display(description='Blockchain', boolean=True)
    def has_blockchain(self, obj):
        return bool(obj.blockchain_hash)
    
    @admin.action(description='Verify selected transactions')
    def verify_transactions(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} transaction(s) verified.')
    
    @admin.action(description='Mark payment as completed')
    def mark_payment_completed(self, request, queryset):
        updated = queryset.update(payment_status='completed')
        self.message_user(request, f'{updated} transaction(s) marked as completed.')


# ==================== CROP PREDICTION ADMIN ====================
@admin.register(CropPrediction)
class CropPredictionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'crop_link',
        'colored_prediction_type',
        'confidence_score_bar',
        'model_version',
        'accuracy_display',
        'prediction_date',
        'created_at'
    ]
    
    list_filter = [
        'prediction_type',
        'model_version',
        'prediction_date',
        'created_at',
    ]
    
    search_fields = [
        'crop__crop_id',
        'model_version',
    ]
    
    autocomplete_fields = ['crop']
    
    readonly_fields = ['prediction_date', 'created_at']
    
    ordering = ['-prediction_date']
    
    date_hierarchy = 'prediction_date'
    
    @admin.display(description='Crop')
    def crop_link(self, obj):
        url = reverse('admin:crops_crop_change', args=[obj.crop.id])
        return format_html('<a href="{}">{}</a>', url, obj.crop.crop_id)
    
    @admin.display(description='Prediction Type', ordering='prediction_type')
    def colored_prediction_type(self, obj):
        colors = {
            'yield': '#28a745',
            'disease': '#dc3545',
            'quality': '#ffc107',
            'market_price': '#17a2b8',
        }
        color = colors.get(obj.prediction_type, '#666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px;">{}</span>',
            color,
            obj.get_prediction_type_display()
        )
    
    @admin.display(description='Confidence', ordering='confidence_score')
    def confidence_score_bar(self, obj):
        score = float(obj.confidence_score)
        color = 'green' if score >= 80 else 'orange' if score >= 50 else 'red'
        return format_html(
            '<div style="width: 100px; background-color: #ddd; border-radius: 4px;">'
            '<div style="width: {}%; background-color: {}; padding: 2px; border-radius: 4px; text-align: center; color: white; font-weight: bold;">{:.1f}%</div>'
            '</div>',
            score, color, score
        )
    
    @admin.display(description='Accuracy')
    def accuracy_display(self, obj):
        if obj.accuracy:
            accuracy = float(obj.accuracy)
            color = 'green' if accuracy >= 80 else 'orange' if accuracy >= 60 else 'red'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color, accuracy
            )
        return '-'