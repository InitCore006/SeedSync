from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from .models import MarketPrice, PriceForecast, MarketListing, Order


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    """Market Price History"""
    
    list_display = [
        'crop_type', 'state', 'district', 'date', 
        'price_range', 'modal_price', 'source'
    ]
    list_filter = ['crop_type', 'state', 'date', 'source']
    search_fields = ['crop_type__name', 'state', 'district', 'market_name']
    date_hierarchy = 'date'
    
    def price_range(self, obj):
        return f"₹{obj.min_price} - ₹{obj.max_price}"
    price_range.short_description = 'Price Range (₹/quintal)'


@admin.register(PriceForecast)
class PriceForecastAdmin(admin.ModelAdmin):
    """AI Price Forecasts"""
    
    list_display = [
        'crop_type', 'state', 'forecast_date', 
        'predicted_price', 'confidence_interval', 'accuracy_badge'
    ]
    list_filter = ['crop_type', 'state', 'forecast_date']
    search_fields = ['crop_type__name', 'state']
    date_hierarchy = 'forecast_date'
    
    def confidence_interval(self, obj):
        return f"₹{obj.confidence_interval_low} - ₹{obj.confidence_interval_high}"
    confidence_interval.short_description = 'Confidence Interval'
    
    def accuracy_badge(self, obj):
        if obj.accuracy_score:
            accuracy = float(obj.accuracy_score)
            color = 'green' if accuracy >= 80 else 'orange' if accuracy >= 60 else 'red'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, accuracy
            )
        return '-'
    accuracy_badge.short_description = 'Accuracy'


@admin.register(MarketListing)
class MarketListingAdmin(admin.ModelAdmin):
    """Market Listings"""
    
    list_display = [
        'listing_type_badge', 'crop_type', 'get_seller', 
        'quantity', 'quality_grade', 'asking_price', 
        'location', 'status_badge'
    ]
    list_filter = ['listing_type', 'crop_type', 'is_active', 'is_fulfilled', 'state']
    search_fields = [
        'farmer__farmer_id', 'fpo__fpo_name', 
        'crop_type__name', 'district'
    ]
    
    def listing_type_badge(self, obj):
        color = '#28a745' if obj.listing_type == 'SELL' else '#007bff'
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.listing_type
        )
    listing_type_badge.short_description = 'Type'
    
    def get_seller(self, obj):
        if obj.farmer:
            return f"Farmer: {obj.farmer.farmer_id}"
        elif obj.fpo:
            return f"FPO: {obj.fpo.fpo_name}"
        return '-'
    get_seller.short_description = 'Seller'
    
    def location(self, obj):
        return f"{obj.district}, {obj.state}"
    
    def status_badge(self, obj):
        if obj.is_fulfilled:
            return format_html('<span style="color: green;">✓ Fulfilled</span>')
        elif obj.is_active:
            return format_html('<span style="color: blue;">● Active</span>')
        else:
            return format_html('<span style="color: gray;">○ Inactive</span>')
    status_badge.short_description = 'Status'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Order Management"""
    
    list_display = [
        'order_id', 'get_crop', 'get_buyer', 
        'quantity_ordered', 'total_amount', 
        'status_badge', 'payment_status', 'created_at'
    ]
    list_filter = ['status', 'is_paid', 'created_at']
    search_fields = ['order_id', 'listing__crop_type__name']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Order Info', {
            'fields': ('order_id', 'listing', 'status')
        }),
        ('Buyer', {
            'fields': ('buyer_processor', 'buyer_fpo')
        }),
        ('Order Details', {
            'fields': ('quantity_ordered', 'agreed_price', 'total_amount')
        }),
        ('Delivery', {
            'fields': (
                'delivery_address', 
                'expected_delivery_date', 
                'actual_delivery_date'
            )
        }),
        ('Payment', {
            'fields': ('advance_payment', 'is_paid', 'payment_date')
        }),
    )
    
    readonly_fields = ['order_id', 'total_amount']
    
    def get_crop(self, obj):
        return obj.listing.crop_type.name
    get_crop.short_description = 'Crop'
    
    def get_buyer(self, obj):
        if obj.buyer_processor:
            return f"Processor: {obj.buyer_processor.company_name}"
        elif obj.buyer_fpo:
            return f"FPO: {obj.buyer_fpo.fpo_name}"
        return '-'
    get_buyer.short_description = 'Buyer'
    
    def status_badge(self, obj):
        colors = {
            'PENDING': '#ffc107',
            'ACCEPTED': '#17a2b8',
            'IN_TRANSIT': '#007bff',
            'DELIVERED': '#28a745',
            'CANCELLED': '#dc3545',
            'COMPLETED': '#6c757d'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#6c757d'), obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def payment_status(self, obj):
        if obj.is_paid:
            return format_html('<span style="color: green;">✓ Paid</span>')
        elif obj.advance_payment > 0:
            percentage = (obj.advance_payment / obj.total_amount) * 100
            return format_html(
                '<span style="color: orange;">{:.0f}% Advanced</span>',
                percentage
            )
        return format_html('<span style="color: red;">✗ Unpaid</span>')
    payment_status.short_description = 'Payment'