from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    Crop, CropInput, CropObservation, 
    HarvestRecord, CropTransaction, CropPrediction
)
from apps.users.models import User
from apps.fpos.models import FPO


# ==================== CROP SERIALIZERS ====================
class CropCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating crops - used by farmers/FPO admins"""
    
    class Meta:
        model = Crop
        fields = [
            'crop_type', 'variety', 'planted_area', 'planting_date',
            'expected_harvest_date', 'latitude', 'longitude', 
            'location_address', 'district', 'state', 'estimated_yield'
        ]
    
    def validate(self, data):
        # Validate planting date not in future
        if data['planting_date'] > timezone.now().date():
            raise serializers.ValidationError({
                'planting_date': 'Planting date cannot be in the future'
            })
        
        # Validate harvest date is after planting
        if data['expected_harvest_date'] <= data['planting_date']:
            raise serializers.ValidationError({
                'expected_harvest_date': 'Harvest date must be after planting date'
            })
        
        # Validate harvest date is realistic (30-180 days for oilseeds)
        days_diff = (data['expected_harvest_date'] - data['planting_date']).days
        if days_diff < 30 or days_diff > 365:
            raise serializers.ValidationError({
                'expected_harvest_date': 'Harvest period should be between 30-365 days'
            })
        
        # Validate area
        if data['planted_area'] <= 0 or data['planted_area'] > 10000:
            raise serializers.ValidationError({
                'planted_area': 'Area must be between 0.01 and 10000 acres'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        
        # Set farmer based on user role
        if user.role == 'farmer':
            validated_data['farmer'] = user
            # Auto-assign FPO if farmer belongs to one
            if hasattr(user, 'farmer_profile') and user.farmer_profile.fpo:
                validated_data['fpo'] = user.farmer_profile.fpo
        elif user.role == 'fpo_admin':
            # FPO admin must specify which farmer
            farmer_id = self.initial_data.get('farmer_id')
            if not farmer_id:
                raise serializers.ValidationError({'farmer_id': 'Farmer ID is required'})
            try:
                farmer = User.objects.get(id=farmer_id, role='farmer')
                validated_data['farmer'] = farmer
                validated_data['fpo'] = user.fpo_profile.fpo
            except User.DoesNotExist:
                raise serializers.ValidationError({'farmer_id': 'Invalid farmer ID'})
        elif user.role == 'admin':
            # Admin can create for any farmer
            farmer_id = self.initial_data.get('farmer_id')
            if not farmer_id:
                raise serializers.ValidationError({'farmer_id': 'Farmer ID is required'})
            try:
                farmer = User.objects.get(id=farmer_id, role='farmer')
                validated_data['farmer'] = farmer
            except User.DoesNotExist:
                raise serializers.ValidationError({'farmer_id': 'Invalid farmer ID'})
        
        validated_data['added_by'] = user
        validated_data['status'] = 'planted'
        
        return super().create(validated_data)


class CropUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating crop details"""
    
    class Meta:
        model = Crop
        fields = [
            'variety', 'planted_area', 'expected_harvest_date',
            'actual_harvest_date', 'status', 'estimated_yield',
            'actual_yield', 'oil_content_percentage', 'moisture_content',
            'quality_grade', 'location_address'
        ]
        read_only_fields = ['actual_harvest_date', 'actual_yield']
    
    def validate_status(self, value):
        current_status = self.instance.status
        
        # Define allowed transitions
        allowed_transitions = {
            'planted': ['growing', 'harvested'],
            'growing': ['flowering', 'harvested'],
            'flowering': ['matured', 'harvested'],
            'matured': ['harvested'],
            'harvested': ['processed'],
            'processed': ['sold'],
        }
        
        if value not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f'Cannot change status from {current_status} to {value}'
            )
        
        return value


class CropListSerializer(serializers.ModelSerializer):
    """Serializer for listing crops"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    fpo_name = serializers.CharField(source='fpo.name', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_since_planting = serializers.SerializerMethodField()
    days_until_harvest = serializers.SerializerMethodField()
    
    class Meta:
        model = Crop
        fields = [
            'id', 'crop_id', 'crop_type', 'crop_type_display', 'variety',
            'farmer_name', 'fpo_name', 'planted_area', 'planting_date',
            'expected_harvest_date', 'status', 'status_display',
            'estimated_yield', 'actual_yield', 'district', 'state',
            'days_since_planting', 'days_until_harvest', 'created_at'
        ]
    
    def get_days_since_planting(self, obj):
        return (timezone.now().date() - obj.planting_date).days
    
    def get_days_until_harvest(self, obj):
        if obj.actual_harvest_date:
            return 0
        days = (obj.expected_harvest_date - timezone.now().date()).days
        return max(0, days)


class CropDetailSerializer(serializers.ModelSerializer):
    """Detailed crop information"""
    farmer = serializers.SerializerMethodField()
    fpo = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    inputs_count = serializers.IntegerField(source='inputs.count', read_only=True)
    observations_count = serializers.IntegerField(source='observations.count', read_only=True)
    has_harvest_record = serializers.SerializerMethodField()
    
    class Meta:
        model = Crop
        fields = '__all__'
    
    def get_farmer(self, obj):
        return {
            'id': obj.farmer.id,
            'name': obj.farmer.full_name,
            'phone': obj.farmer.phone_number,
        }
    
    def get_fpo(self, obj):
        if obj.fpo:
            return {
                'id': obj.fpo.id,
                'name': obj.fpo.name,
            }
        return None
    
    def get_added_by(self, obj):
        if obj.added_by:
            return {
                'id': obj.added_by.id,
                'name': obj.added_by.full_name,
                'role': obj.added_by.role,
            }
        return None
    
    def get_has_harvest_record(self, obj):
        return hasattr(obj, 'harvest_record')


# ==================== CROP INPUT SERIALIZERS ====================
class CropInputSerializer(serializers.ModelSerializer):
    """Serializer for crop inputs (fertilizers, pesticides, etc.)"""
    added_by_name = serializers.CharField(source='added_by.full_name', read_only=True)
    input_type_display = serializers.CharField(source='get_input_type_display', read_only=True)
    
    class Meta:
        model = CropInput
        fields = [
            'id', 'crop', 'input_type', 'input_type_display', 'input_name',
            'quantity', 'unit', 'application_date', 'cost', 'notes',
            'added_by_name', 'created_at'
        ]
        read_only_fields = ['added_by_name', 'created_at']
    
    def validate(self, data):
        # Validate application date
        if data['application_date'] > timezone.now().date():
            raise serializers.ValidationError({
                'application_date': 'Application date cannot be in the future'
            })
        
        # Validate quantity
        if data['quantity'] <= 0:
            raise serializers.ValidationError({
                'quantity': 'Quantity must be greater than 0'
            })
        
        # Validate cost if provided
        if data.get('cost') and data['cost'] < 0:
            raise serializers.ValidationError({
                'cost': 'Cost cannot be negative'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['added_by'] = request.user
        return super().create(validated_data)


# ==================== CROP OBSERVATION SERIALIZERS ====================
class CropObservationSerializer(serializers.ModelSerializer):
    """Serializer for crop observations"""
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CropObservation
        fields = [
            'id', 'crop', 'observation_date', 'plant_height', 'leaf_color',
            'pest_infestation', 'disease_detected', 'disease_name',
            'soil_moisture', 'temperature', 'rainfall', 'image', 'image_url',
            'ai_analysis_result', 'notes', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['ai_analysis_result', 'recorded_by_name', 'created_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None
    
    def validate(self, data):
        # Validate observation date
        if data['observation_date'] > timezone.now().date():
            raise serializers.ValidationError({
                'observation_date': 'Observation date cannot be in the future'
            })
        
        # Validate plant height
        if data.get('plant_height') and (data['plant_height'] < 0 or data['plant_height'] > 500):
            raise serializers.ValidationError({
                'plant_height': 'Plant height must be between 0 and 500 cm'
            })
        
        # Validate soil moisture
        if data.get('soil_moisture') and (data['soil_moisture'] < 0 or data['soil_moisture'] > 100):
            raise serializers.ValidationError({
                'soil_moisture': 'Soil moisture must be between 0 and 100%'
            })
        
        # Validate temperature
        if data.get('temperature') and (data['temperature'] < -10 or data['temperature'] > 60):
            raise serializers.ValidationError({
                'temperature': 'Temperature must be between -10 and 60°C'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['recorded_by'] = request.user
        return super().create(validated_data)


# ==================== HARVEST RECORD SERIALIZERS ====================
class HarvestRecordSerializer(serializers.ModelSerializer):
    """Serializer for harvest records"""
    harvested_by_name = serializers.CharField(source='harvested_by.full_name', read_only=True)
    crop_details = serializers.SerializerMethodField()
    
    class Meta:
        model = HarvestRecord
        fields = [
            'id', 'crop', 'crop_details', 'harvest_date', 'total_yield',
            'oil_content', 'moisture_level', 'foreign_matter', 'quality_grade',
            'storage_location', 'storage_method', 'organic_certified',
            'certification_number', 'market_price_per_quintal', 'total_revenue',
            'harvested_by_name', 'created_at'
        ]
        read_only_fields = ['harvested_by_name', 'created_at']
    
    def get_crop_details(self, obj):
        return {
            'crop_id': obj.crop.crop_id,
            'crop_type': obj.crop.get_crop_type_display(),
            'variety': obj.crop.variety,
        }
    
    def validate(self, data):
        crop = data.get('crop') or self.instance.crop
        
        # Ensure crop doesn't already have a harvest record
        if not self.instance and hasattr(crop, 'harvest_record'):
            raise serializers.ValidationError({
                'crop': 'This crop already has a harvest record'
            })
        
        # Validate harvest date
        if data['harvest_date'] < crop.planting_date:
            raise serializers.ValidationError({
                'harvest_date': 'Harvest date cannot be before planting date'
            })
        
        if data['harvest_date'] > timezone.now().date():
            raise serializers.ValidationError({
                'harvest_date': 'Harvest date cannot be in the future'
            })
        
        # Validate total yield
        if data['total_yield'] <= 0:
            raise serializers.ValidationError({
                'total_yield': 'Total yield must be greater than 0'
            })
        
        # Validate oil content
        if data['oil_content'] < 0 or data['oil_content'] > 100:
            raise serializers.ValidationError({
                'oil_content': 'Oil content must be between 0 and 100%'
            })
        
        # Validate moisture level
        if data['moisture_level'] < 0 or data['moisture_level'] > 100:
            raise serializers.ValidationError({
                'moisture_level': 'Moisture level must be between 0 and 100%'
            })
        
        # Validate quality grade
        valid_grades = ['A', 'B', 'C', 'D']
        if data['quality_grade'].upper() not in valid_grades:
            raise serializers.ValidationError({
                'quality_grade': f'Quality grade must be one of: {", ".join(valid_grades)}'
            })
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['harvested_by'] = request.user
        
        # Update crop status and actual harvest date
        crop = validated_data['crop']
        crop.status = 'harvested'
        crop.actual_harvest_date = validated_data['harvest_date']
        crop.actual_yield = validated_data['total_yield']
        crop.oil_content_percentage = validated_data['oil_content']
        crop.moisture_content = validated_data['moisture_level']
        crop.quality_grade = validated_data['quality_grade']
        crop.save()
        
        return super().create(validated_data)


# ==================== CROP TRANSACTION SERIALIZERS ====================
class CropTransactionSerializer(serializers.ModelSerializer):
    """Serializer for crop transactions"""
    from_user_details = serializers.SerializerMethodField()
    to_user_details = serializers.SerializerMethodField()
    crop_details = serializers.SerializerMethodField()
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = CropTransaction
        fields = [
            'id', 'transaction_id', 'crop', 'crop_details', 'transaction_type',
            'transaction_type_display', 'from_user', 'from_user_details',
            'to_user', 'to_user_details', 'quantity', 'price_per_unit',
            'total_amount', 'transaction_date', 'blockchain_hash',
            'is_verified', 'payment_status', 'created_at'
        ]
        read_only_fields = [
            'transaction_id', 'blockchain_hash', 'transaction_date', 'created_at'
        ]
    
    def get_from_user_details(self, obj):
        if obj.from_user:
            return {
                'id': obj.from_user.id,
                'name': obj.from_user.full_name,
                'role': obj.from_user.role,
            }
        return None
    
    def get_to_user_details(self, obj):
        if obj.to_user:
            return {
                'id': obj.to_user.id,
                'name': obj.to_user.full_name,
                'role': obj.to_user.role,
            }
        return None
    
    def get_crop_details(self, obj):
        return {
            'crop_id': obj.crop.crop_id,
            'crop_type': obj.crop.get_crop_type_display(),
            'variety': obj.crop.variety,
        }
    
    def validate(self, data):
        # Validate quantity
        if data['quantity'] <= 0:
            raise serializers.ValidationError({
                'quantity': 'Quantity must be greater than 0'
            })
        
        # Validate price
        if data['price_per_unit'] <= 0:
            raise serializers.ValidationError({
                'price_per_unit': 'Price per unit must be greater than 0'
            })
        
        # Validate total amount
        expected_total = data['quantity'] * data['price_per_unit']
        if abs(data['total_amount'] - expected_total) > 0.01:
            raise serializers.ValidationError({
                'total_amount': f'Total amount should be {expected_total}'
            })
        
        # Validate transaction type based on user roles
        transaction_type = data['transaction_type']
        from_user = data['from_user']
        to_user = data['to_user']
        
        role_mapping = {
            'farmer_to_fpo': ('farmer', 'fpo_admin'),
            'fpo_to_processor': ('fpo_admin', 'processor'),
            'fpo_to_retailer': ('fpo_admin', 'retailer'),
            'processor_to_retailer': ('processor', 'retailer'),
        }
        
        expected_roles = role_mapping.get(transaction_type)
        if expected_roles:
            if from_user.role != expected_roles[0] or to_user.role != expected_roles[1]:
                raise serializers.ValidationError({
                    'transaction_type': f'Invalid user roles for {transaction_type}'
                })
        
        return data


# ==================== AI PREDICTION SERIALIZERS ====================
class CropPredictionSerializer(serializers.ModelSerializer):
    """Serializer for AI predictions"""
    crop_details = serializers.SerializerMethodField()
    prediction_type_display = serializers.CharField(source='get_prediction_type_display', read_only=True)
    
    class Meta:
        model = CropPrediction
        fields = [
            'id', 'crop', 'crop_details', 'prediction_type', 'prediction_type_display',
            'prediction_date', 'predicted_value', 'confidence_score',
            'model_version', 'input_features', 'actual_value', 'accuracy',
            'created_at'
        ]
        read_only_fields = ['prediction_date', 'created_at']
    
    def get_crop_details(self, obj):
        return {
            'crop_id': obj.crop.crop_id,
            'crop_type': obj.crop.get_crop_type_display(),
            'variety': obj.crop.variety,
        }
    
    def validate_confidence_score(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Confidence score must be between 0 and 100')
        return value