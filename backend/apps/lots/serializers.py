"""
Lots Serializers for SeedSync Platform
"""
from rest_framework import serializers
from .models import ProcurementLot, LotImage, LotStatusHistory


class LotImageSerializer(serializers.ModelSerializer):
    """Lot image serializer"""
    
    class Meta:
        model = LotImage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LotStatusHistorySerializer(serializers.ModelSerializer):
    """Lot status history serializer"""
    
    class Meta:
        model = LotStatusHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProcurementLotSerializer(serializers.ModelSerializer):
    """Procurement lot serializer"""
    images = LotImageSerializer(many=True, read_only=True)
    status_history = LotStatusHistorySerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    fpo_name = serializers.CharField(source='fpo.fpo_name', read_only=True, allow_null=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    quality_grade_display = serializers.CharField(source='get_quality_grade_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProcurementLot
        fields = '__all__'
        read_only_fields = ['id', 'lot_number', 'created_at', 'updated_at', 'blockchain_hash']


class ProcurementLotCreateSerializer(serializers.ModelSerializer):
    """Procurement lot create serializer"""
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ProcurementLot
        fields = ['farmer', 'fpo', 'crop_type', 'quantity_quintals', 'expected_price_per_quintal',
                  'harvest_date', 'quality_grade', 'moisture_content', 'oil_content',
                  'location_latitude', 'location_longitude', 'description', 'uploaded_images']
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        lot = ProcurementLot.objects.create(**validated_data)
        
        # Create lot images
        for image in uploaded_images:
            LotImage.objects.create(lot=lot, image=image)
        
        return lot
