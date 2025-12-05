"""Processors Serializers"""
from rest_framework import serializers
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch

class ProcessorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessorProfile
        fields = '__all__'

class ProcessingPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingPlant
        fields = '__all__'

class ProcessingBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingBatch
        fields = '__all__'
