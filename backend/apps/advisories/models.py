from django.db import models
import uuid

class Advisory(models.Model):
    """General crop advisories"""
    
    ADVISORY_TYPE_CHOICES = [
        ('weather', 'Weather Advisory'),
        ('pest', 'Pest Management'),
        ('disease', 'Disease Management'),
        ('irrigation', 'Irrigation Advisory'),
        ('fertilizer', 'Fertilizer Advisory'),
        ('harvest', 'Harvest Advisory'),
        ('market', 'Market Advisory'),
        ('general', 'General Advisory'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Advisory Details
    title = models.CharField(max_length=200)
    advisory_type = models.CharField(max_length=20, choices=ADVISORY_TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Content
    content = models.TextField()
    content_hindi = models.TextField(blank=True)
    content_regional = models.JSONField(
        default=dict,
        help_text="Regional language translations"
    )
    
    # Targeting
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE,
        related_name='advisories',
        null=True,
        blank=True
    )
    target_states = models.JSONField(default=list, blank=True)
    target_districts = models.JSONField(default=list, blank=True)
    
    # Timing
    valid_from = models.DateTimeField()
    valid_till = models.DateTimeField()
    
    # AI Generated
    is_ai_generated = models.BooleanField(default=False)
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="AI model confidence (0-100)"
    )
    
    # Media
    image = models.ImageField(upload_to='advisories/', null=True, blank=True)
    video_url = models.URLField(blank=True)
    audio_file = models.FileField(upload_to='advisories/audio/', null=True, blank=True)
    
    # Statistics
    view_count = models.IntegerField(default=0)
    share_count = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)
    
    # Creator
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_advisories'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'advisories'
        verbose_name = 'Advisory'
        verbose_name_plural = 'Advisories'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['advisory_type']),
            models.Index(fields=['valid_from', 'valid_till']),
            models.Index(fields=['is_published', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_advisory_type_display()})"


class WeatherAlert(models.Model):
    """Weather-based alerts"""
    
    ALERT_TYPE_CHOICES = [
        ('rainfall', 'Heavy Rainfall'),
        ('drought', 'Drought Warning'),
        ('heatwave', 'Heat Wave'),
        ('frost', 'Frost Warning'),
        ('cyclone', 'Cyclone Alert'),
        ('hailstorm', 'Hailstorm Warning'),
    ]
    
    SEVERITY_CHOICES = [
        ('yellow', 'Yellow (Be Aware)'),
        ('orange', 'Orange (Be Prepared)'),
        ('red', 'Red (Take Action)'),
    ]
    
    # Location
    state = models.CharField(max_length=100)
    districts = models.JSONField(default=list, help_text="Affected districts")
    blocks = models.JSONField(default=list, blank=True)
    
    # GIS
    affected_area = models.JSONField(null=True, blank=True)
    
    # Alert Details
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    
    # Description
    title = models.CharField(max_length=200)
    description = models.TextField()
    action_required = models.TextField(help_text="Recommended actions for farmers")
    
    # Weather Data
    expected_rainfall = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Expected rainfall in mm"
    )
    wind_speed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Wind speed in km/h"
    )
    temperature_max = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    temperature_min = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timing
    alert_start = models.DateTimeField()
    alert_end = models.DateTimeField()
    
    # Source
    data_source = models.CharField(
        max_length=50,
        choices=[
            ('imd', 'IMD (India Meteorological Department)'),
            ('skymet', 'Skymet'),
            ('openweather', 'OpenWeatherMap'),
        ],
        default='imd'
    )
    
    # Notification Status
    notification_sent = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    farmers_notified = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'weather_alerts'
        verbose_name = 'Weather Alert'
        verbose_name_plural = 'Weather Alerts'
        ordering = ['-alert_start']
        indexes = [
            models.Index(fields=['state']),
            models.Index(fields=['alert_start', 'alert_end']),
            models.Index(fields=['severity']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.state}"


class PestDetection(models.Model):
    """Pest and disease detection records"""
    
    DETECTION_STATUS_CHOICES = [
        ('pending', 'Pending Analysis'),
        ('detected', 'Pest/Disease Detected'),
        ('not_detected', 'No Pest/Disease'),
        ('uncertain', 'Uncertain'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Farmer Details
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        related_name='pest_detections'
    )
    farm_plot = models.ForeignKey(
        'farmers.FarmPlot',
        on_delete=models.CASCADE,
        related_name='pest_detections'
    )
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE
    )
    
    # Image Upload
    image = models.ImageField(upload_to='pest_detection/')
    
    # AI Detection Results
    detection_status = models.CharField(
        max_length=20,
        choices=DETECTION_STATUS_CHOICES,
        default='pending'
    )
    detected_pest_disease = models.CharField(max_length=200, blank=True)
    scientific_name = models.CharField(max_length=200, blank=True)
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="AI confidence (0-100)"
    )
    
    # Severity
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
        null=True,
        blank=True
    )
    
    # Treatment Recommendation
    treatment_recommended = models.TextField(blank=True)
    pesticide_recommended = models.JSONField(
        default=list,
        help_text="List of recommended pesticides"
    )
    organic_treatment = models.TextField(blank=True)
    
    # Expert Validation
    expert_validated = models.BooleanField(default=False)
    validated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_detections'
    )
    expert_comments = models.TextField(blank=True)
    
    # Follow-up
    treatment_applied = models.BooleanField(default=False)
    treatment_effective = models.BooleanField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pest_detections'
        verbose_name = 'Pest Detection'
        verbose_name_plural = 'Pest Detections'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - {self.crop.name}"


class SoilAnalysis(models.Model):
    """Soil health analysis and recommendations"""
    
    farm_plot = models.ForeignKey(
        'farmers.FarmPlot',
        on_delete=models.CASCADE,
        related_name='soil_analyses'
    )
    
    # Sample Details
    sample_date = models.DateField()
    lab_name = models.CharField(max_length=200)
    lab_reference_number = models.CharField(max_length=50, unique=True)
    
    # Soil Parameters
    ph_value = models.DecimalField(max_digits=4, decimal_places=2)
    electrical_conductivity = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="EC in dS/m"
    )
    organic_carbon = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Organic carbon %"
    )
    
    # Macronutrients
    nitrogen = models.DecimalField(max_digits=6, decimal_places=2, help_text="N in kg/ha")
    phosphorus = models.DecimalField(max_digits=6, decimal_places=2, help_text="P in kg/ha")
    potassium = models.DecimalField(max_digits=6, decimal_places=2, help_text="K in kg/ha")
    sulphur = models.DecimalField(max_digits=6, decimal_places=2, help_text="S in ppm")
    
    # Micronutrients
    zinc = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Zn in ppm")
    iron = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Fe in ppm")
    manganese = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Mn in ppm")
    copper = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Cu in ppm")
    boron = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="B in ppm")
    
    # Recommendations
    fertilizer_recommendation = models.TextField()
    lime_gypsum_recommendation = models.TextField(blank=True)
    organic_manure_recommendation = models.TextField()
    
    # AI Analysis
    ai_recommendation = models.TextField(blank=True)
    soil_health_score = models.IntegerField(
        default=0,
        help_text="Overall soil health score (0-100)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'soil_analyses'
        verbose_name = 'Soil Analysis'
        verbose_name_plural = 'Soil Analyses'
        ordering = ['-sample_date']
    
    def __str__(self):
        return f"{self.farm_plot.plot_name} - {self.sample_date}"


class AIModel(models.Model):
    """AI/ML model metadata and versioning"""
    
    MODEL_TYPE_CHOICES = [
        ('price_forecast', 'Price Forecasting'),
        ('yield_prediction', 'Yield Prediction'),
        ('pest_detection', 'Pest Detection'),
        ('disease_detection', 'Disease Detection'),
        ('soil_analysis', 'Soil Health Analysis'),
        ('weather_prediction', 'Weather Prediction'),
        ('credit_scoring', 'Credit Scoring'),
    ]
    
    model_type = models.CharField(max_length=30, choices=MODEL_TYPE_CHOICES, unique=True)
    model_name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    
    # Model Details
    algorithm = models.CharField(max_length=100, help_text="e.g., Random Forest, LSTM, CNN")
    framework = models.CharField(max_length=50, help_text="e.g., TensorFlow, PyTorch, scikit-learn")
    
    # Performance Metrics
    accuracy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    precision = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    recall = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    f1_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Training Details
    training_data_size = models.IntegerField(help_text="Number of training samples")
    training_date = models.DateField()
    last_retrained = models.DateField(null=True, blank=True)
    
    # Model File
    model_file_path = models.CharField(max_length=500)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_production = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_models'
        verbose_name = 'AI Model'
        verbose_name_plural = 'AI Models'
    
    def __str__(self):
        return f"{self.get_model_type_display()} v{self.version}"


class FPOAdvisory(models.Model):
    """FPO-level collective advisories"""
    
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='advisories')
    advisory = models.ForeignKey(Advisory, on_delete=models.CASCADE, related_name='fpo_advisories')
    
    # Customization for FPO
    custom_message = models.TextField(blank=True)
    priority_override = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('urgent', 'Urgent'),
        ],
        blank=True
    )
    
    # Targeting
    target_member_count = models.IntegerField(default=0)
    notified_member_count = models.IntegerField(default=0)
    
    # Acknowledgment
    members_acknowledged = models.IntegerField(default=0)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_advisories'
        verbose_name = 'FPO Advisory'
        verbose_name_plural = 'FPO Advisories'
    
    def __str__(self):
        return f"{self.fpo.name} - {self.advisory.title}"