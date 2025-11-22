from rest_framework import serializers
from .models import MarketPrice, PriceForecast, MarketListing, Order
from advisory.serializers import CropTypeSerializer
from users.serializers import FarmerProfileListSerializer


class MarketPriceSerializer(serializers.ModelSerializer):
    """Market Price Data"""
    
    crop_type_name = serializers.CharField(source='crop_type.name', read_only=True)
    price_range = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketPrice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_price_range(self, obj):
        return {
            'min': float(obj.min_price),
            'max': float(obj.max_price),
            'modal': float(obj.modal_price)
        }


class PriceForecastSerializer(serializers.ModelSerializer):
    """Price Forecasting"""
    
    crop_type_name = serializers.CharField(source='crop_type.name', read_only=True)
    confidence_interval = serializers.SerializerMethodField()
    
    class Meta:
        model = PriceForecast
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_confidence_interval(self, obj):
        return {
            'low': float(obj.confidence_interval_low),
            'high': float(obj.confidence_interval_high),
            'predicted': float(obj.predicted_price)
        }


class MarketListingSerializer(serializers.ModelSerializer):
    """Market Listings (Buy/Sell)"""
    
    crop_type_details = CropTypeSerializer(source='crop_type', read_only=True)
    seller_details = serializers.SerializerMethodField()
    buyer_details = serializers.SerializerMethodField()
    quality_info = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketListing
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_seller_details(self, obj):
        if obj.farmer:
            return {
                'type': 'farmer',
                'id': str(obj.farmer.id),
                'name': obj.farmer.user.get_full_name(),
                'farmer_id': obj.farmer.farmer_id,
                'location': f"{obj.farmer.district}, {obj.farmer.state}"
            }
        elif obj.fpo:
            return {
                'type': 'fpo',
                'id': str(obj.fpo.id),
                'name': obj.fpo.fpo_name,
                'location': f"{obj.fpo.district}, {obj.fpo.state}"
            }
        return None
    
    def get_buyer_details(self, obj):
        if obj.buyer_processor:
            return {
                'type': 'processor',
                'id': str(obj.buyer_processor.id),
                'name': obj.buyer_processor.company_name
            }
        elif obj.buyer_fpo:
            return {
                'type': 'fpo',
                'id': str(obj.buyer_fpo.id),
                'name': obj.buyer_fpo.fpo_name
            }
        return None
    
    def get_quality_info(self, obj):
        return {
            'grade': obj.quality_grade,
            'moisture_content': float(obj.moisture_content) if obj.moisture_content else None,
            'oil_content': float(obj.oil_content) if obj.oil_content else None
        }


class MarketListingListSerializer(serializers.ModelSerializer):
    """Lightweight listing for browse"""
    
    crop_name = serializers.CharField(source='crop_type.name', read_only=True)
    seller_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketListing
        fields = [
            'id', 'listing_type', 'crop_name', 'seller_name',
            'quantity', 'quality_grade', 'asking_price',
            'district', 'state', 'is_active', 'created_at'
        ]
    
    def get_seller_name(self, obj):
        if obj.farmer:
            return obj.farmer.user.get_full_name()
        elif obj.fpo:
            return obj.fpo.fpo_name
        return 'Unknown'


class OrderSerializer(serializers.ModelSerializer):
    """Order Management"""
    
    listing_details = MarketListingListSerializer(source='listing', read_only=True)
    buyer_details = serializers.SerializerMethodField()
    payment_summary = serializers.SerializerMethodField()
    delivery_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_id', 'total_amount', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-generate order_id and calculate total_amount
        import uuid
        from datetime import datetime
        validated_data['order_id'] = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        validated_data['total_amount'] = validated_data['quantity_ordered'] * validated_data['agreed_price']
        return super().create(validated_data)
    
    def get_buyer_details(self, obj):
        if obj.buyer_processor:
            return {
                'type': 'processor',
                'name': obj.buyer_processor.company_name,
                'id': str(obj.buyer_processor.id)
            }
        elif obj.buyer_fpo:
            return {
                'type': 'fpo',
                'name': obj.buyer_fpo.fpo_name,
                'id': str(obj.buyer_fpo.id)
            }
        return None
    
    def get_payment_summary(self, obj):
        return {
            'total_amount': float(obj.total_amount),
            'advance_payment': float(obj.advance_payment),
            'balance': float(obj.total_amount - obj.advance_payment),
            'is_paid': obj.is_paid,
            'payment_date': obj.payment_date
        }
    
    def get_delivery_status(self, obj):
        from django.utils import timezone
        if obj.actual_delivery_date:
            return {
                'status': 'delivered',
                'date': obj.actual_delivery_date,
                'on_time': obj.actual_delivery_date <= obj.expected_delivery_date if obj.expected_delivery_date else None
            }
        elif obj.expected_delivery_date:
            days_remaining = (obj.expected_delivery_date - timezone.now().date()).days
            return {
                'status': 'in_progress',
                'expected_date': obj.expected_delivery_date,
                'days_remaining': days_remaining
            }
        return {'status': 'pending'}


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight order list"""
    
    crop_name = serializers.CharField(source='listing.crop_type.name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'crop_name', 'quantity_ordered',
            'total_amount', 'status', 'is_paid', 'created_at'
        ]