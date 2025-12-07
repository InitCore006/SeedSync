"""Bids Serializers"""
from rest_framework import serializers
from .models import Bid, BidAcceptance

class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder_user.get_full_name', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    lot_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_lot_details(self, obj):
        """Return detailed lot information"""
        if obj.lot:
            return {
                'crop_type': obj.lot.crop_type,
                'crop_type_display': obj.lot.get_crop_type_display(),
                'quantity_quintals': str(obj.lot.quantity_quintals),
                'quality_grade': obj.lot.quality_grade,
                'quality_grade_display': obj.lot.get_quality_grade_display(),
            }
        return None

class BidAcceptanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidAcceptance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
