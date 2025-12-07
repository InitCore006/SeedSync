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
    
    # Dynamic farmer name - shows FPO name for aggregated lots, farmer name otherwise
    farmer_name = serializers.SerializerMethodField()
    fpo_name = serializers.CharField(source='fpo.organization_name', read_only=True, allow_null=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    quality_grade_display = serializers.CharField(source='get_quality_grade_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Warehouse fields
    warehouse_id = serializers.UUIDField(source='warehouse.id', read_only=True, allow_null=True)
    warehouse_name = serializers.CharField(source='warehouse.warehouse_name', read_only=True, allow_null=True)
    warehouse_code = serializers.CharField(source='warehouse.warehouse_code', read_only=True, allow_null=True)
    warehouse_district = serializers.CharField(source='warehouse.district', read_only=True, allow_null=True)
    
    # Source warehouses for aggregated lots
    source_warehouse_ids = serializers.SerializerMethodField()
    source_warehouse_names = serializers.SerializerMethodField()
    
    class Meta:
        model = ProcurementLot
        fields = '__all__'
        read_only_fields = ['id', 'lot_number', 'created_at', 'updated_at', 'blockchain_hash']
    
    def get_farmer_name(self, obj):
        """
        Return FPO name for FPO-aggregated lots (farmer=None), 
        otherwise return farmer's name
        """
        if obj.listing_type == 'fpo_aggregated' and obj.farmer is None:
            return obj.fpo.organization_name if obj.fpo else 'FPO'
        return obj.farmer.user.get_full_name() if obj.farmer else 'Unknown'
    
    def get_source_warehouse_ids(self, obj):
        """Get list of source warehouse IDs for aggregated lots"""
        if obj.listing_type == 'fpo_aggregated':
            return [str(wh.id) for wh in obj.source_warehouses.all()]
        return []
    
    def get_source_warehouse_names(self, obj):
        """Get list of source warehouse names for aggregated lots"""
        if obj.listing_type == 'fpo_aggregated':
            return [wh.warehouse_name for wh in obj.source_warehouses.all()]
        return []


class ProcurementLotCreateSerializer(serializers.ModelSerializer):
    """Procurement lot create serializer"""
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ProcurementLot
        fields = ['farmer', 'crop_type', 'quantity_quintals', 'expected_price_per_quintal',
                  'harvest_date', 'quality_grade', 'moisture_content', 'oil_content',
                  'location_latitude', 'location_longitude', 'description', 'uploaded_images']
        # Removed 'warehouse' - farmers cannot assign warehouse, only FPO can
    
    def create(self, validated_data):
        from django.utils import timezone
        from apps.warehouses.models import Inventory, StockMovement
        
        uploaded_images = validated_data.pop('uploaded_images', [])
        farmer = validated_data['farmer']
        # NO warehouse assignment here - FPO will assign later
        
        # Check if farmer belongs to an FPO
        try:
            from apps.fpos.models import FPOMembership
            membership = FPOMembership.objects.filter(
                farmer=farmer, 
                is_active=True
            ).select_related('fpo').first()
            
            if membership:
                # Farmer is FPO member - auto-manage by FPO
                validated_data['fpo'] = membership.fpo
                validated_data['managed_by_fpo'] = True
                validated_data['listing_type'] = 'fpo_managed'
                validated_data['status'] = 'available'  # Available for FPO to manage
            else:
                # Individual farmer - direct to marketplace
                validated_data['managed_by_fpo'] = False
                validated_data['listing_type'] = 'individual'
                validated_data['status'] = 'available'
        except Exception:
            # Fallback to individual if any error
            validated_data['managed_by_fpo'] = False
            validated_data['listing_type'] = 'individual'
            validated_data['status'] = 'available'
        
        lot = ProcurementLot.objects.create(**validated_data)
        
        # Create lot images
        for image in uploaded_images:
            LotImage.objects.create(lot=lot, image=image)
        
        # NO inventory or stock movement created here
        # FPO will assign warehouse later via assign-warehouse endpoint
        
        return lot
