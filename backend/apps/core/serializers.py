"""
Base Serializers for SeedSync Platform
"""
from rest_framework import serializers
from datetime import datetime


class BaseSerializer(serializers.ModelSerializer):
    """Base serializer with common fields"""
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class ResponseSerializer(serializers.Serializer):
    """Standard response format serializer"""
    status = serializers.CharField()
    message = serializers.CharField()
    data = serializers.DictField()
    meta = serializers.DictField()
