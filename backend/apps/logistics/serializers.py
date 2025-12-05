"""Logistics Serializers"""
from rest_framework import serializers
from .models import LogisticsPartner, Vehicle, Shipment

class LogisticsPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogisticsPartner
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
