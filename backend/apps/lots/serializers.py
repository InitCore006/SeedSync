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
    
    # Warehouse fields
    warehouse_id = serializers.UUIDField(source='warehouse.id', read_only=True, allow_null=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, allow_null=True)
    warehouse_code = serializers.CharField(source='warehouse.warehouse_code', read_only=True, allow_null=True)
    warehouse_district = serializers.CharField(source='warehouse.district', read_only=True, allow_null=True)
    
    # Source warehouses for aggregated lots
    source_warehouse_ids = serializers.SerializerMethodField()
    source_warehouse_names = serializers.SerializerMethodField()
    
    class Meta:
        model = ProcurementLot
        fields = '__all__'
        read_only_fields = ['id', 'lot_number', 'created_at', 'updated_at', 'blockchain_hash']
    
    def get_source_warehouse_ids(self, obj):
        """Get list of source warehouse IDs for aggregated lots"""
        if obj.listing_type == 'fpo_aggregated':
            return [str(wh.id) for wh in obj.source_warehouses.all()]
        return []
    
    def get_source_warehouse_names(self, obj):
        """Get list of source warehouse names for aggregated lots"""
        if obj.listing_type == 'fpo_aggregated':
            return [wh.name for wh in obj.source_warehouses.all()]
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
                  'location_latitude', 'location_longitude', 'description', 'uploaded_images',
                  'warehouse']
    
    def validate(self, attrs):
        """Validate warehouse capacity before creating lot"""
        warehouse = attrs.get('warehouse')
        quantity_quintals = attrs.get('quantity_quintals')
        
        if warehouse and quantity_quintals:
            available_capacity = warehouse.get_available_capacity()
            
            if quantity_quintals > available_capacity:
                raise serializers.ValidationError({
                    'warehouse': f'Insufficient warehouse capacity. Available: {available_capacity} quintals, Required: {quantity_quintals} quintals'
                })
        
        return attrs
    
    def create(self, validated_data):
        from django.utils import timezone
        from apps.warehouses.models import Inventory, StockMovement
        
        uploaded_images = validated_data.pop('uploaded_images', [])
        farmer = validated_data['farmer']
        warehouse = validated_data.get('warehouse')
        
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
                validated_data['status'] = 'available'  # FPO can see it immediately
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
        
        # Auto-create inventory and stock movement if warehouse assigned
        if warehouse:
            # Create inventory record
            inventory = Inventory.objects.create(
                warehouse=warehouse,
                lot=lot,
                quantity=lot.quantity_quintals,
                entry_date=timezone.now().date()
            )
            
            # Create stock movement record
            StockMovement.objects.create(
                warehouse=warehouse,
                lot=lot,
                movement_type='in',
                quantity=lot.quantity_quintals,
                movement_date=timezone.now().date(),
                remarks=f'Initial stock from farmer {farmer.user.get_full_name()}'
            )
            
            # Update warehouse current stock
            warehouse.current_stock_quintals += lot.quantity_quintals
            warehouse.save(update_fields=['current_stock_quintals'])
        
        return lot
