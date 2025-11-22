from django.db import models
from core.models import TimeStampedModel
from users.models import FarmerProfile

class AgriStackSync(TimeStampedModel):
    """Agri-Stack synchronization logs"""
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='agristack_syncs')
    
    # Sync metadata
    sync_type = models.CharField(max_length=50)  # 'farmer_registry', 'land_records', etc.
    last_sync_at = models.DateTimeField(auto_now=True)
    is_successful = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    # Data snapshot
    synced_data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'agristack_syncs'


class LandRecord(TimeStampedModel):
    """Land ownership records from Agri-Stack"""
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='land_records')
    
    # Land details
    survey_number = models.CharField(max_length=100)
    khasra_number = models.CharField(max_length=100, blank=True)
    land_area = models.DecimalField(max_digits=10, decimal_places=2, help_text="In hectares")
    
    # Location
    village = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # ULPIN (Unique Land Parcel Identification Number)
    ulpin = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # Ownership
    ownership_type = models.CharField(max_length=50)  # Owned, Leased, Share-cropped
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verified_source = models.CharField(max_length=100, blank=True)  # State Land Records Dept
    
    class Meta:
        db_table = 'land_records'


class SoilHealthData(TimeStampedModel):
    """Soil health card data"""
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='soil_data')
    land_record = models.ForeignKey(LandRecord, on_delete=models.CASCADE, null=True, blank=True)
    
    # Test details
    test_date = models.DateField()
    testing_lab = models.CharField(max_length=200, blank=True)
    
    # Soil parameters
    ph_level = models.DecimalField(max_digits=4, decimal_places=2)
    organic_carbon = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage")
    nitrogen = models.CharField(max_length=20)  # Low, Medium, High
    phosphorus = models.CharField(max_length=20)
    potassium = models.CharField(max_length=20)
    
    # Micronutrients
    sulphur = models.CharField(max_length=20, blank=True)
    zinc = models.CharField(max_length=20, blank=True)
    iron = models.CharField(max_length=20, blank=True)
    
    # Recommendations
    fertilizer_recommendations = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'soil_health_data'


class ExternalAPILog(TimeStampedModel):
    """Log all external API calls"""
    
    API_CHOICES = [
        ('IMD', 'India Meteorological Department'),
        ('AGMARKNET', 'Agricultural Marketing Information'),
        ('ISRO', 'Satellite Imagery'),
        ('AGRISTACK', 'Agri-Stack Portal'),
        ('PMFBY', 'Crop Insurance'),
        ('OTHERS', 'Others'),
    ]
    
    api_name = models.CharField(max_length=50, choices=API_CHOICES)
    endpoint = models.URLField()
    request_payload = models.JSONField(null=True, blank=True)
    response_data = models.JSONField(null=True, blank=True)
    
    # Status
    http_status = models.IntegerField()
    is_successful = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    # Performance
    response_time = models.IntegerField(help_text="In milliseconds")
    
    class Meta:
        db_table = 'external_api_logs'
        indexes = [
            models.Index(fields=['api_name', 'created_at']),
        ]


class SatelliteImagery(TimeStampedModel):
    """Satellite data for yield prediction"""
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='satellite_images')
    land_record = models.ForeignKey(LandRecord, on_delete=models.CASCADE, null=True)
    
    # Image details
    capture_date = models.DateField()
    satellite_source = models.CharField(max_length=100)  # Sentinel, ISRO, etc.
    image_url = models.URLField(blank=True)
    
    # Indices (calculated)
    ndvi_value = models.DecimalField(max_digits=5, decimal_places=4, null=True, help_text="Normalized Difference Vegetation Index")
    ndwi_value = models.DecimalField(max_digits=5, decimal_places=4, null=True, help_text="Water stress")
    
    # Analysis
    crop_health_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, help_text="AI-calculated 0-100")
    anomaly_detected = models.BooleanField(default=False)
    anomaly_type = models.CharField(max_length=100, blank=True)  # Drought, Waterlogging, etc.
    
    class Meta:
        db_table = 'satellite_imagery'