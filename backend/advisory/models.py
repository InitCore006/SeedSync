from django.db import models
from core.models import TimeStampedModel
from users.models import FarmerProfile

class CropType(TimeStampedModel):
    """Master data for oilseed crops"""
    
    name = models.CharField(max_length=100, unique=True)  # Mustard, Soybean, Groundnut, etc.
    scientific_name = models.CharField(max_length=200, blank=True)
    ideal_temperature_min = models.DecimalField(max_digits=5, decimal_places=2)
    ideal_temperature_max = models.DecimalField(max_digits=5, decimal_places=2)
    ideal_rainfall = models.DecimalField(max_digits=6, decimal_places=2, help_text="In mm")
    growing_season = models.CharField(max_length=50)  # Kharif/Rabi/Zaid
    maturity_days = models.IntegerField(help_text="Days to harvest")
    
    class Meta:
        db_table = 'crop_types'
    
    def __str__(self):
        return self.name


class CropCycle(TimeStampedModel):
    """Individual crop cultivation cycle"""
    
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('SOWING', 'Sowing'),
        ('GROWING', 'Growing'),
        ('HARVESTING', 'Harvesting'),
        ('HARVESTED', 'Harvested'),
        ('FAILED', 'Failed'),
    ]
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='crop_cycles')
    crop_type = models.ForeignKey(CropType, on_delete=models.PROTECT)
    
    # Cycle Details
    cycle_id = models.CharField(max_length=50, unique=True)  # For blockchain linking
    area_planted = models.DecimalField(max_digits=10, decimal_places=2, help_text="In hectares")
    sowing_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    actual_harvest_date = models.DateField(null=True, blank=True)
    
    # Predictions (AI-generated)
    predicted_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, help_text="In quintals")
    actual_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, help_text="In quintals")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    
    # AI Confidence
    ai_recommendation_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, help_text="0-100")
    
    class Meta:
        db_table = 'crop_cycles'
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['sowing_date']),
        ]


class WeatherAlert(TimeStampedModel):
    """Weather alerts for farmers"""
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='weather_alerts')
    alert_type = models.CharField(max_length=50)  # Heavy Rain, Heatwave, Frost, etc.
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    message = models.TextField()
    valid_from = models.DateTimeField()
    valid_till = models.DateTimeField()
    is_read = models.BooleanField(default=False)
    
    # Source
    source = models.CharField(max_length=100, default='IMD')  # India Meteorological Department
    
    class Meta:
        db_table = 'weather_alerts'
        indexes = [
            models.Index(fields=['farmer', 'is_read']),
            models.Index(fields=['valid_from']),
        ]


class PestDiseaseDetection(TimeStampedModel):
    """AI-based pest/disease identification"""
    
    crop_cycle = models.ForeignKey(CropCycle, on_delete=models.CASCADE, related_name='pest_detections')
    
    # Detection
    image = models.ImageField(upload_to='pest_images/')
    detected_pest = models.CharField(max_length=200)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="AI confidence 0-100")
    
    # Recommendation
    treatment_recommendation = models.TextField()
    severity_level = models.CharField(max_length=20)  # Low, Medium, High
    
    # Status
    is_treated = models.BooleanField(default=False)
    treatment_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'pest_disease_detections'


class CropAdvisory(TimeStampedModel):
    """AI-generated advisories"""
    
    ADVISORY_TYPE_CHOICES = [
        ('SOWING', 'Sowing Advisory'),
        ('IRRIGATION', 'Irrigation Advisory'),
        ('FERTILIZER', 'Fertilizer Recommendation'),
        ('HARVEST', 'Harvest Timing'),
        ('MARKET', 'Market Advisory'),
    ]
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='advisories')
    crop_cycle = models.ForeignKey(CropCycle, on_delete=models.CASCADE, null=True, blank=True)
    
    advisory_type = models.CharField(max_length=20, choices=ADVISORY_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # AI metadata
    ai_confidence = models.DecimalField(max_digits=5, decimal_places=2)
    data_sources = models.JSONField(default=list)  # ['satellite', 'weather', 'soil']
    
    # Engagement
    is_read = models.BooleanField(default=False)
    farmer_feedback = models.IntegerField(null=True, blank=True, help_text="1-5 rating")
    
    class Meta:
        db_table = 'crop_advisories'
        indexes = [
            models.Index(fields=['farmer', 'is_read']),
        ]