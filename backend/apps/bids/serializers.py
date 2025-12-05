"""Bids Serializers"""
from rest_framework import serializers
from .models import Bid, BidAcceptance

class BidSerializer(serializers.ModelSerializer):
    bidder_name = serializers.CharField(source='bidder_user.get_full_name', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class BidAcceptanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidAcceptance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
