"""Blockchain Serializers"""
from rest_framework import serializers
from .models import BlockchainTransaction, TraceabilityRecord, QRCode

class BlockchainTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockchainTransaction
        fields = '__all__'
        read_only_fields = ['id', 'transaction_id', 'hash', 'previous_hash', 'created_at']

class TraceabilityRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraceabilityRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = '__all__'
        read_only_fields = ['id', 'qr_code', 'scan_count', 'created_at']
