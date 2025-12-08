"""
Serializers for Farmers App
"""
from rest_framework import serializers
from .models import FarmerProfile, FarmLand, CropPlanning, CropPlan
from apps.users.serializers import UserSerializer


class FarmerProfileSerializer(serializers.ModelSerializer):
    """Serializer for farmer profile"""
    user = UserSerializer(read_only=True)
    fpo_name = serializers.CharField(source='get_fpo_name', read_only=True)
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    fpo_membership = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'total_lots_created', 'total_quantity_sold_quintals',
            'total_earnings', 'kyc_status', 'created_at', 'updated_at'
        ]
    
    def get_fpo_membership(self, obj):
        """Get FPO membership details if farmer is a member"""
        try:
            from apps.fpos.models import FPOMembership
            membership = FPOMembership.objects.filter(
                farmer=obj, 
                status='active'
            ).select_related('fpo').first()
            
            if membership:
                return {
                    'fpo_id': str(membership.fpo.id),
                    'fpo_name': membership.fpo.fpo_name,
                    'joined_date': membership.created_at.isoformat(),
                    'status': membership.status,
                    'warehouse_name': membership.fpo.warehouses.first().warehouse_name if membership.fpo.warehouses.exists() else None
                }
            return None
        except Exception:
            return None


class FarmerProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating farmer profile - Single step registration"""
    
    class Meta:
        model = FarmerProfile
        fields = [
            'full_name', 'father_name', 'total_land_acres', 'district', 'state', 'pincode',
            'date_of_birth', 'gender', 'farming_experience_years', 'primary_crops',
            'village', 'post_office', 'tehsil', 'latitude', 'longitude',
            'aadhaar_number', 'pan_number', 'bank_account_number', 
            'bank_account_holder_name', 'ifsc_code', 'bank_name', 'bank_branch',
            'preferred_language', 'profile_photo'
        ]
    
    def validate(self, attrs):
        # Ensure required fields for initial registration
        required_fields = ['full_name', 'total_land_acres', 'district', 'state', 'pincode']
        for field in required_fields:
            if field not in attrs or not attrs[field]:
                raise serializers.ValidationError({field: f"{field.replace('_', ' ').title()} is required"})
        return attrs


class FarmerProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating farmer profile"""
    
    class Meta:
        model = FarmerProfile
        fields = [
            'full_name', 'father_name', 'date_of_birth', 'gender', 'profile_photo',
            'total_land_acres', 'farming_experience_years', 'primary_crops',
            'bank_account_number', 'bank_account_holder_name', 'ifsc_code',
            'bank_name', 'bank_branch', 'village', 'post_office', 'tehsil',
            'district', 'state', 'pincode', 'latitude', 'longitude',
            'preferred_language'
        ]


class FarmLandSerializer(serializers.ModelSerializer):
    """Serializer for farm land"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    soil_type_display = serializers.CharField(source='get_soil_type_display', read_only=True)
    
    class Meta:
        model = FarmLand
        fields = '__all__'
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']


class FarmLandCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating farm land"""
    
    class Meta:
        model = FarmLand
        exclude = ['farmer']


class CropPlanningSerializer(serializers.ModelSerializer):
    """Serializer for crop planning"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farm_land_name = serializers.CharField(source='farm_land.land_name', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    yield_per_acre = serializers.SerializerMethodField()
    
    class Meta:
        model = CropPlanning
        fields = '__all__'
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']
    
    def get_yield_per_acre(self, obj):
        return obj.get_yield_per_acre()


class CropPlanningCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating crop planning"""
    
    class Meta:
        model = CropPlanning
        exclude = ['farmer']


class CropPlanSerializer(serializers.ModelSerializer):
    """Serializer for simplified Crop Plan"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farm_land_name = serializers.CharField(source='farm_land.land_name', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_until_harvest = serializers.IntegerField(source='get_days_until_harvest', read_only=True)
    progress_percentage = serializers.IntegerField(source='get_progress_percentage', read_only=True)
    
    class Meta:
        model = CropPlan
        fields = [
            'id', 'farmer', 'farmer_name', 'farm_land', 'farm_land_name',
            'crop_type', 'crop_type_display', 'crop_name', 'land_acres',
            'sowing_date', 'maturity_days', 'expected_harvest_date',
            'season', 'season_display',
            'msp_price_per_quintal', 'estimated_yield_quintals', 
            'estimated_yield_per_acre', 'gross_revenue',
            'seed_cost', 'fertilizer_cost', 'pesticide_cost', 
            'labor_cost', 'irrigation_cost', 'total_input_costs',
            'net_profit', 'profit_per_acre', 'roi_percentage',
            'status', 'status_display', 'actual_yield_quintals', 'notes',
            'converted_lot', 'conversion_date',
            'days_until_harvest', 'progress_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'farmer', 'expected_harvest_date', 'gross_revenue',
            'total_input_costs', 'net_profit', 'profit_per_acre', 'roi_percentage',
            'converted_lot', 'conversion_date', 'created_at', 'updated_at'
        ]


class CropPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new Crop Plan"""
    
    farm_land = serializers.PrimaryKeyRelatedField(
        queryset=FarmLand.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = CropPlan
        fields = [
            'farm_land', 'crop_type', 'crop_name', 'land_acres',
            'sowing_date', 'maturity_days', 'season',
            'msp_price_per_quintal', 'estimated_yield_quintals', 
            'estimated_yield_per_acre',
            'seed_cost', 'fertilizer_cost', 'pesticide_cost',
            'labor_cost', 'irrigation_cost', 'notes'
        ]
    
    def validate(self, attrs):
        """Validate crop plan data"""
        # Validate land acres doesn't exceed farm land area if farm_land is specified
        if attrs.get('farm_land') and attrs.get('land_acres'):
            if attrs['land_acres'] > attrs['farm_land'].land_area_acres:
                raise serializers.ValidationError({
                    'land_acres': 'Land allocated cannot exceed farm land area'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create crop plan with auto-calculated fields"""
        return CropPlan.objects.create(**validated_data)


class CropPlanUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Crop Plan"""
    
    class Meta:
        model = CropPlan
        fields = [
            'land_acres', 'sowing_date', 'maturity_days',
            'msp_price_per_quintal', 'estimated_yield_quintals', 
            'estimated_yield_per_acre',
            'seed_cost', 'fertilizer_cost', 'pesticide_cost',
            'labor_cost', 'irrigation_cost',
            'status', 'actual_yield_quintals', 'notes'
        ]
    
    def validate_status(self, value):
        """Validate status transitions"""
        instance = self.instance
        if instance and instance.status == 'converted_to_lot':
            raise serializers.ValidationError(
                "Cannot modify a plan that has been converted to a lot"
            )
        return value
