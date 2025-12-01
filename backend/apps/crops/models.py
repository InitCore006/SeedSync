from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.fpos.models import FPO
import uuid

# ==================== OILSEED CROP MODEL ====================
class Crop(models.Model):
    """
    Core crop model - handles oilseed cultivation tracking
    Compatible with blockchain traceability and AI analysis
    """
    OILSEED_TYPES = [
        ('groundnut', 'Groundnut (Peanut)'),
        ('mustard', 'Mustard'),
        ('sunflower', 'Sunflower'),
        ('soybean', 'Soybean'),
        ('sesame', 'Sesame (Til)'),
        ('safflower', 'Safflower'),
        ('castor', 'Castor'),
        ('linseed', 'Linseed (Flaxseed)'),
        ('niger', 'Niger Seed'),
    ]

    CROP_STATUS = [
        ('planted', 'Planted'),
        ('growing', 'Growing'),
        ('flowering', 'Flowering'),
        ('matured', 'Matured'),
        ('harvested', 'Harvested'),
        ('processed', 'Processed'),
        ('sold', 'Sold'),
    ]

    # Unique Identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_id = models.CharField(max_length=50, unique=True, db_index=True)  # For blockchain
    
    # Ownership & Management
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crops', limit_choices_to={'role': 'farmer'})
    fpo = models.ForeignKey(FPO, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_crops')
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='added_crops')
    
    # Crop Details
    crop_type = models.CharField(max_length=20, choices=OILSEED_TYPES)
    variety = models.CharField(max_length=100)  # e.g., "TMV 2", "ICGV 91114"
    planted_area = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])  # in acres
    
    # Cultivation Dates
    planting_date = models.DateField()
    expected_harvest_date = models.DateField()
    actual_harvest_date = models.DateField(null=True, blank=True)
    
    # Location (GPS for AI & traceability)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    location_address = models.CharField(max_length=255, blank=True)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Status & Yield
    status = models.CharField(max_length=20, choices=CROP_STATUS, default='planted')
    estimated_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # in quintals
    actual_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # in quintals
    
    # Quality Metrics (for AI analysis)
    oil_content_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quality_grade = models.CharField(max_length=10, blank=True)  # A, B, C
    
    # Blockchain Hash (for traceability)
    blockchain_hash = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['crop_type', 'state']),
            models.Index(fields=['planting_date']),
        ]
    
    def __str__(self):
        return f"{self.crop_id} - {self.get_crop_type_display()} by {self.farmer.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.crop_id:
            # Generate unique crop ID: CROP-<YEAR>-<OILSEED>-<RANDOM>
            import random
            from datetime import datetime
            year = datetime.now().year
            crop_short = self.crop_type[:3].upper()
            random_id = random.randint(10000, 99999)
            self.crop_id = f"CROP-{year}-{crop_short}-{random_id}"
        super().save(*args, **kwargs)


# ==================== CROP INPUTS (FERTILIZERS, PESTICIDES) ====================
class CropInput(models.Model):
    """Track inputs used - crucial for quality & traceability"""
    INPUT_TYPES = [
        ('fertilizer', 'Fertilizer'),
        ('pesticide', 'Pesticide'),
        ('herbicide', 'Herbicide'),
        ('seed', 'Seed'),
        ('irrigation', 'Irrigation'),
    ]
    
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='inputs')
    input_type = models.CharField(max_length=20, choices=INPUT_TYPES)
    input_name = models.CharField(max_length=150)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)  # kg, liters, bags
    application_date = models.DateField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-application_date']
    
    def __str__(self):
        return f"{self.input_name} on {self.crop.crop_id}"


# ==================== CROP OBSERVATIONS (AI DATA COLLECTION) ====================
class CropObservation(models.Model):
    """
    Field observations & AI-ready data collection
    For disease detection, growth monitoring, yield prediction
    """
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='observations')
    observation_date = models.DateField()
    
    # Plant Health
    plant_height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # in cm
    leaf_color = models.CharField(max_length=50, blank=True)
    pest_infestation = models.BooleanField(default=False)
    disease_detected = models.BooleanField(default=False)
    disease_name = models.CharField(max_length=150, blank=True)
    
    # Environmental Data (for AI models)
    soil_moisture = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    rainfall = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # in mm
    
    # Image for AI analysis
    image = models.ImageField(upload_to='crop_observations/', null=True, blank=True)
    ai_analysis_result = models.JSONField(null=True, blank=True)  # Store AI predictions
    
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-observation_date']
    
    def __str__(self):
        return f"Observation for {self.crop.crop_id} on {self.observation_date}"


# ==================== HARVEST RECORDS ====================
class HarvestRecord(models.Model):
    """Post-harvest tracking for blockchain & supply chain"""
    crop = models.OneToOneField(Crop, on_delete=models.CASCADE, related_name='harvest_record')
    harvest_date = models.DateField()
    total_yield = models.DecimalField(max_digits=10, decimal_places=2)  # in quintals
    
    # Quality Parameters
    oil_content = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    moisture_level = models.DecimalField(max_digits=5, decimal_places=2)
    foreign_matter = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quality_grade = models.CharField(max_length=10)  # A, B, C, D
    
    # Storage
    storage_location = models.CharField(max_length=255, blank=True)
    storage_method = models.CharField(max_length=100, blank=True)  # warehouse, farm, cold storage
    
    # Certification
    organic_certified = models.BooleanField(default=False)
    certification_number = models.CharField(max_length=100, blank=True)
    
    # Market Info
    market_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    harvested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Harvest: {self.crop.crop_id} - {self.total_yield} quintals"


# ==================== CROP TRANSACTIONS (BLOCKCHAIN READY) ====================
class CropTransaction(models.Model):
    """
    Track crop movement in supply chain
    Blockchain-ready transaction model
    """
    TRANSACTION_TYPES = [
        ('farmer_to_fpo', 'Farmer to FPO'),
        ('fpo_to_processor', 'FPO to Processor'),
        ('fpo_to_retailer', 'FPO to Retailer'),
        ('processor_to_retailer', 'Processor to Retailer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=30, choices=TRANSACTION_TYPES)
    
    # Parties
    from_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='outgoing_transactions')
    to_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='incoming_transactions')
    
    # Transaction Details
    quantity = models.DecimalField(max_digits=10, decimal_places=2)  # in quintals
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    
    # Blockchain
    blockchain_hash = models.CharField(max_length=255, blank=True, db_index=True)
    previous_hash = models.CharField(max_length=255, blank=True)  # Link to previous transaction
    
    # Status
    is_verified = models.BooleanField(default=False)
    payment_status = models.CharField(max_length=20, default='pending')  # pending, completed, failed
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-transaction_date']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.get_transaction_type_display()}"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import random
            from datetime import datetime
            year = datetime.now().year
            random_id = random.randint(100000, 999999)
            self.transaction_id = f"TXN-{year}-{random_id}"
        super().save(*args, **kwargs)


# ==================== AI PREDICTIONS ====================
class CropPrediction(models.Model):
    """Store AI model predictions for yield, disease, quality"""
    PREDICTION_TYPES = [
        ('yield', 'Yield Prediction'),
        ('disease', 'Disease Detection'),
        ('quality', 'Quality Assessment'),
        ('market_price', 'Market Price Forecast'),
    ]
    
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='predictions')
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    prediction_date = models.DateTimeField(auto_now_add=True)
    
    # Prediction Results
    predicted_value = models.JSONField()  # Flexible structure for different predictions
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Model Info
    model_version = models.CharField(max_length=50)
    input_features = models.JSONField()  # Store what data was used
    
    # Actual vs Predicted (for model improvement)
    actual_value = models.JSONField(null=True, blank=True)
    accuracy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-prediction_date']
    
    def __str__(self):
        return f"{self.get_prediction_type_display()} for {self.crop.crop_id}"