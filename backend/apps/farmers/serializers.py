from rest_framework import serializers
from django.db.models import Sum, Avg
from .models import Farmer, FarmPlot, CropPlanning, FPOMembership
from apps.users.serializers import UserListSerializer


class FarmPlotSerializer(serializers.ModelSerializer):
    """Farm Plot Serializer for mobile app"""
    
    class Meta:
        model = FarmPlot
        fields = [
            'id', 'farmer', 'plot_name', 'survey_number', 'sub_division',
            'village', 'taluka', 'district', 'state',
            'latitude', 'longitude', 'boundary',
            'area', 'soil_type', 'irrigation_type',
            'soil_ph', 'organic_carbon', 'nitrogen', 'phosphorus', 'potassium',
            'soil_health_card_date', 'ownership_type', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']
    
    def validate_area(self, value):
        """Ensure area is positive"""
        if value <= 0:
            raise serializers.ValidationError("Area must be greater than 0")
        return value


class FarmPlotListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing plots"""
    
    class Meta:
        model = FarmPlot
        fields = [
            'id', 'plot_name', 'survey_number', 'area', 
            'soil_type', 'irrigation_type', 'village', 'district'
        ]


class CropPlanningSerializer(serializers.ModelSerializer):
    """Crop Planning Serializer"""
    
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    crop_image = serializers.CharField(source='crop.image', read_only=True)
    variety_name = serializers.CharField(source='variety.name', read_only=True)
    plot_name = serializers.CharField(source='farm_plot.plot_name', read_only=True)
    fpo_name = serializers.CharField(source='fpo_commitment.name', read_only=True)
    profit = serializers.SerializerMethodField()
    
    class Meta:
        model = CropPlanning
        fields = [
            'id', 'farm_plot', 'plot_name', 'crop', 'crop_name', 'crop_image',
            'variety', 'variety_name', 'season', 'year', 'area_planned',
            'planned_sowing_date', 'actual_sowing_date',
            'expected_harvest_date', 'actual_harvest_date',
            'expected_yield', 'actual_yield',
            'input_cost', 'revenue', 'profit',
            'status', 'committed_to_fpo', 'fpo_commitment', 'fpo_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_profit(self, obj):
        """Calculate profit"""
        return float(obj.revenue - obj.input_cost)
    
    def validate(self, attrs):
        """Validate dates"""
        planned_sowing = attrs.get('planned_sowing_date')
        expected_harvest = attrs.get('expected_harvest_date')
        
        if planned_sowing and expected_harvest:
            if expected_harvest <= planned_sowing:
                raise serializers.ValidationError({
                    "expected_harvest_date": "Harvest date must be after sowing date"
                })
        
        return attrs


class CropPlanningListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for crop planning list"""
    
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    plot_name = serializers.CharField(source='farm_plot.plot_name', read_only=True)
    
    class Meta:
        model = CropPlanning
        fields = [
            'id', 'crop_name', 'plot_name', 'season', 'year',
            'status', 'area_planned', 'expected_yield', 'actual_yield'
        ]


class FPOMembershipSerializer(serializers.ModelSerializer):
    """FPO Membership Serializer"""
    
    farmer_name = serializers.CharField(source='farmer.user.full_name', read_only=True)
    fpo_name = serializers.CharField(source='fpo.name', read_only=True)
    fpo_logo = serializers.CharField(source='fpo.logo', read_only=True)
    
    class Meta:
        model = FPOMembership
        fields = [
            'id', 'farmer', 'farmer_name', 'fpo', 'fpo_name', 'fpo_logo',
            'membership_number', 'joining_date', 'status',
            'shares_held', 'share_value_per_unit', 'total_share_capital',
            'has_voting_rights',
            'total_produce_supplied', 'total_earnings', 'dividend_earned',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']


class FarmerSerializer(serializers.ModelSerializer):
    """Complete Farmer Profile Serializer"""
    
    user = UserListSerializer(read_only=True)
    primary_fpo_name = serializers.CharField(source='primary_fpo.name', read_only=True)
    farm_plots = FarmPlotListSerializer(many=True, read_only=True)
    active_crops = serializers.SerializerMethodField()
    total_plots = serializers.SerializerMethodField()
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'user', 'farmer_id',
            'total_land_area', 'irrigated_land', 'rain_fed_land',
            'farmer_category', 'caste_category',
            'is_fpo_member', 'primary_fpo', 'primary_fpo_name',
            'has_kisan_credit_card', 'kcc_number',
            'has_pmfby_insurance', 'pmfby_policy_number',
            'has_pm_kisan',
            'total_production', 'average_yield', 'credit_score',
            'is_active', 'is_verified',
            'farm_plots', 'total_plots', 'active_crops',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'farmer_id', 'total_production', 
            'average_yield', 'credit_score', 'created_at', 'updated_at'
        ]
    
    def get_total_plots(self, obj):
        """Get total number of plots"""
        return obj.farm_plots.count()
    
    def get_active_crops(self, obj):
        """Get active crop plantings"""
        return CropPlanning.objects.filter(
            farm_plot__farmer=obj,
            status__in=['sowing', 'growing', 'harvesting']
        ).count()


class FarmerListSerializer(serializers.ModelSerializer):
    """Lightweight farmer list for admin dashboard"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone_number', read_only=True)
    district = serializers.CharField(source='user.profile.district', read_only=True)
    state = serializers.CharField(source='user.profile.state', read_only=True)
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'farmer_id', 'user_name', 'phone',
            'total_land_area', 'farmer_category',
            'is_fpo_member', 'district', 'state',
            'credit_score', 'is_verified'
        ]


class FarmerRegistrationSerializer(serializers.Serializer):
    """Complete Farmer Registration - combines User + Profile + Farmer"""
    
    # User fields
    phone_number = serializers.CharField(max_length=10)
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField(required=False, allow_blank=True)
    preferred_language = serializers.CharField(default='en')
    
    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['M', 'F', 'O'], required=False)
    address_line1 = serializers.CharField(required=False, allow_blank=True)
    address_line2 = serializers.CharField(required=False, allow_blank=True)
    village = serializers.CharField(required=False, allow_blank=True)
    block = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField()
    state = serializers.CharField()
    pincode = serializers.CharField(max_length=6)
    
    # Bank details (optional)
    bank_name = serializers.CharField(required=False, allow_blank=True)
    account_number = serializers.CharField(required=False, allow_blank=True)
    ifsc_code = serializers.CharField(required=False, allow_blank=True)
    account_holder_name = serializers.CharField(required=False, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    
    # Farmer fields
    total_land_area = serializers.DecimalField(max_digits=10, decimal_places=2)
    irrigated_land = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    rain_fed_land = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    farmer_category = serializers.ChoiceField(
        choices=['marginal', 'small', 'semi_medium', 'medium', 'large'],
        default='marginal'
    )
    caste_category = serializers.ChoiceField(
        choices=['general', 'obc', 'sc', 'st'],
        default='general'
    )
    
    # Government schemes (optional)
    has_kisan_credit_card = serializers.BooleanField(default=False)
    kcc_number = serializers.CharField(required=False, allow_blank=True)
    has_pmfby_insurance = serializers.BooleanField(default=False)
    pmfby_policy_number = serializers.CharField(required=False, allow_blank=True)
    has_pm_kisan = serializers.BooleanField(default=False)
    
    def validate_phone_number(self, value):
        """Validate phone number format and uniqueness"""
        import re
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be 10 digits starting with 6-9"
            )
        
        from apps.users.models import User
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return value
    
    def validate_pincode(self, value):
        """Validate pincode"""
        import re
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Pincode must be 6 digits")
        return value
    
    def validate(self, attrs):
        """Validate password match and land areas"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })
        
        # Validate land areas
        total = attrs['total_land_area']
        irrigated = attrs.get('irrigated_land', 0)
        rain_fed = attrs.get('rain_fed_land', 0)
        
        if (irrigated + rain_fed) > total:
            raise serializers.ValidationError({
                "total_land_area": "Irrigated + Rain-fed land cannot exceed total land"
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create User + Profile + Farmer in transaction"""
        from apps.users.models import User, UserProfile
        from django.db import transaction
        import random
        
        # Remove password_confirm
        validated_data.pop('password_confirm')
        
        # Extract user data
        user_data = {
            'phone_number': validated_data.pop('phone_number'),
            'full_name': validated_data.pop('full_name'),
            'email': validated_data.pop('email', None),
            'preferred_language': validated_data.pop('preferred_language', 'en'),
            'role': 'farmer',
            'is_phone_verified': True  # Assuming OTP verified before this
        }
        password = validated_data.pop('password')
        
        # Extract profile data
        profile_data = {
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'gender': validated_data.pop('gender', None),
            'address_line1': validated_data.pop('address_line1', ''),
            'address_line2': validated_data.pop('address_line2', ''),
            'village': validated_data.pop('village', ''),
            'block': validated_data.pop('block', ''),
            'district': validated_data.pop('district'),
            'state': validated_data.pop('state'),
            'pincode': validated_data.pop('pincode'),
            'bank_name': validated_data.pop('bank_name', ''),
            'account_number': validated_data.pop('account_number', ''),
            'ifsc_code': validated_data.pop('ifsc_code', ''),
            'account_holder_name': validated_data.pop('account_holder_name', ''),
            'education_level': validated_data.pop('education_level', ''),
        }
        
        # Remaining data is farmer data
        farmer_data = validated_data
        
        with transaction.atomic():
            # 1. Create User
            user = User.objects.create(**user_data)
            user.set_password(password)
            user.save()
            
            # 2. Create Profile
            UserProfile.objects.create(user=user, **profile_data)
            
            # 3. Generate Farmer ID
            farmer_id = f"FRM{str(user.id).replace('-', '')[:8].upper()}{random.randint(100, 999)}"
            
            # 4. Create Farmer
            farmer = Farmer.objects.create(
                user=user,
                farmer_id=farmer_id,
                **farmer_data
            )
            
            return farmer

class FarmerDashboardSerializer(serializers.Serializer):
    """Farmer dashboard statistics for mobile app"""
    
    total_land = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_plots = serializers.IntegerField()
    active_crops = serializers.IntegerField()
    total_production = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_score = serializers.IntegerField()
    fpo_membership_status = serializers.BooleanField()
    recent_harvests = CropPlanningListSerializer(many=True)
    upcoming_sowings = CropPlanningListSerializer(many=True)


class FarmerLocationSerializer(serializers.Serializer):
    """Farmer location data for mapping"""
    
    farmer_id = serializers.CharField()
    farmer_name = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    total_land = serializers.DecimalField(max_digits=10, decimal_places=2)
    district = serializers.CharField()
    state = serializers.CharField()