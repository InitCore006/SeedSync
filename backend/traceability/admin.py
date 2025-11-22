from django.contrib import admin
from django.utils.html import format_html
from .models import Batch, SupplyChainEvent, QualityTest, ProductTrace


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    """Batch/Lot Management"""
    
    list_display = [
        'batch_id', 'farmer', 'crop_cycle', 
        'quantity', 'quality_grade', 'harvest_date', 
        'blockchain_status', 'qr_preview'
    ]
    list_filter = ['quality_grade', 'is_organic', 'harvest_date']
    search_fields = ['batch_id', 'farmer__farmer_id', 'blockchain_hash']
    date_hierarchy = 'harvest_date'
    
    fieldsets = (
        ('Batch Info', {
            'fields': ('batch_id', 'crop_cycle', 'farmer', 'harvest_date')
        }),
        ('Quantity & Quality', {
            'fields': (
                'quantity', 'quality_grade', 
                'moisture_content', 'oil_content', 'is_organic'
            )
        }),
        ('Certification', {
            'fields': ('quality_certificate_url',)
        }),
        ('Blockchain', {
            'fields': ('blockchain_hash', 'blockchain_timestamp'),
            'classes': ('collapse',)
        }),
        ('QR Code', {
            'fields': ('qr_code',)
        }),
    )
    
    readonly_fields = ['batch_id']
    
    def blockchain_status(self, obj):
        if obj.blockchain_hash:
            return format_html(
                '<span style="color: green;">✓ Registered</span><br><small>{}</small>',
                obj.blockchain_hash[:16] + '...'
            )
        return format_html('<span style="color: orange;">⏳ Pending</span>')
    blockchain_status.short_description = 'Blockchain'
    
    def qr_preview(self, obj):
        if obj.qr_code:
            return format_html(
                '<img src="{}" width="50" height="50" />',
                obj.qr_code.url
            )
        return '-'
    qr_preview.short_description = 'QR'


class SupplyChainEventInline(admin.TabularInline):
    """Inline events for batch"""
    model = SupplyChainEvent
    extra = 0
    fields = ['event_type', 'timestamp', 'location', 'notes']
    readonly_fields = ['timestamp']


@admin.register(SupplyChainEvent)
class SupplyChainEventAdmin(admin.ModelAdmin):
    """Supply Chain Tracking"""
    
    list_display = [
        'batch', 'event_type_badge', 'timestamp', 
        'get_actor', 'location', 'blockchain_status'
    ]
    list_filter = ['event_type', 'timestamp']
    search_fields = ['batch__batch_id', 'location']
    date_hierarchy = 'timestamp'
    
    def event_type_badge(self, obj):
        colors = {
            'HARVESTED': '#28a745',
            'STORED_FARM': '#17a2b8',
            'COLLECTED_FPO': '#007bff',
            'DISPATCHED': '#ffc107',
            'RECEIVED_PROCESSOR': '#fd7e14',
            'PROCESSING_STARTED': '#6610f2',
            'PROCESSING_COMPLETED': '#6f42c1',
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">{}</span>',
            colors.get(obj.event_type, '#6c757d'), obj.get_event_type_display()
        )
    event_type_badge.short_description = 'Event'
    
    def get_actor(self, obj):
        if obj.actor_farmer:
            return f"Farmer: {obj.actor_farmer.farmer_id}"
        elif obj.actor_fpo:
            return f"FPO: {obj.actor_fpo.fpo_name}"
        elif obj.actor_processor:
            return f"Processor: {obj.actor_processor.company_name}"
        return '-'
    get_actor.short_description = 'Actor'
    
    def blockchain_status(self, obj):
        if obj.blockchain_hash:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: gray;">-</span>')
    blockchain_status.short_description = 'BC'


@admin.register(QualityTest)
class QualityTestAdmin(admin.ModelAdmin):
    """Quality Testing Records"""
    
    list_display = [
        'batch', 'tested_by', 'test_date', 
        'final_grade', 'quality_summary', 'certificate_link'
    ]
    list_filter = ['final_grade', 'is_passed', 'test_date']
    search_fields = ['batch__batch_id', 'tested_by']
    
    def quality_summary(self, obj):
        return format_html(
            'Moisture: {}% | Oil: {}% | FM: {}%',
            obj.moisture_content, obj.oil_content, obj.foreign_matter
        )
    quality_summary.short_description = 'Parameters'
    
    def certificate_link(self, obj):
        if obj.certificate_url:
            return format_html('<a href="{}" target="_blank">View</a>', obj.certificate_url)
        return '-'
    certificate_link.short_description = 'Certificate'


@admin.register(ProductTrace)
class ProductTraceAdmin(admin.ModelAdmin):
    """Final Product Traceability"""
    
    list_display = [
        'product_id', 'product_name', 'processor', 
        'net_weight', 'packaging_date', 'expiry_date', 
        'certifications', 'qr_preview'
    ]
    list_filter = ['is_organic_certified', 'packaging_date']
    search_fields = ['product_id', 'product_name', 'brand_name']
    filter_horizontal = ['source_batches']
    
    def certifications(self, obj):
        badges = []
        badges.append(f'<span style="background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">FSSAI</span>')
        if obj.is_organic_certified:
            badges.append('<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">ORGANIC</span>')
        return format_html(' '.join(badges))
    certifications.short_description = 'Certifications'
    
    def qr_preview(self, obj):
        if obj.consumer_qr_code:
            return format_html(
                '<img src="{}" width="50" height="50" />',
                obj.consumer_qr_code.url
            )
        return '-'
    qr_preview.short_description = 'QR'