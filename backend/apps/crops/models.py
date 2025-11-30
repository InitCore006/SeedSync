from django.db import models
import uuid

class CropMaster(models.Model):
    """Master database for oilseed crops"""
    
    CROP_TYPE_CHOICES = [
        ('oilseed', 'Oilseed'),
        ('cereal', 'Cereal'),
        ('pulse', 'Pulse'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=100, unique=True)
    scientific_name = models.CharField(max_length=150)
    crop_type = models.CharField(max_length=20, choices=CROP_TYPE_CHOICES, default='oilseed')
    
    # Hindi and Regional Names
    hindi_name = models.CharField(max_length=100)
    regional_names = models.JSONField(
        default=dict,
        help_text="{'te': 'Telugu name', 'mr': 'Marathi name', ...}"
    )
    
    # Cultivation Details
    suitable_seasons = models.JSONField(
        default=list,
        help_text="['kharif', 'rabi', 'zaid']"
    )
    suitable_soil_types = models.JSONField(default=list)
    water_requirement = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ]
    )
    
    # Duration
    min_duration_days = models.IntegerField(help_text="Minimum crop duration in days")
    max_duration_days = models.IntegerField(help_text="Maximum crop duration in days")
    
    # Yield
    average_yield_per_acre = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Average yield in quintals per acre"
    )
    
    # Oil Content
    oil_content_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Oil content percentage"
    )
    
    # MSP (Minimum Support Price)
    current_msp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Current MSP per quintal in INR"
    )
    
    # Images
    crop_image = models.ImageField(upload_to='crops/', null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crop_master'
        verbose_name = 'Crop Master'
        verbose_name_plural = 'Crop Master'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.hindi_name})"


class CropVariety(models.Model):
    """Crop varieties for each crop"""
    
    crop = models.ForeignKey(CropMaster, on_delete=models.CASCADE, related_name='varieties')
    
    # Basic Information
    variety_name = models.CharField(max_length=100)
    variety_code = models.CharField(max_length=50, unique=True)
    
    # Development
    developed_by = models.CharField(max_length=200, help_text="e.g., ICAR, State Agricultural University")
    release_year = models.IntegerField()
    
    # Characteristics
    duration_days = models.IntegerField()
    yield_potential = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Yield potential in quintals per acre"
    )
    oil_content = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Resistance
    disease_resistance = models.JSONField(default=list, help_text="List of diseases resistant to")
    pest_resistance = models.JSONField(default=list, help_text="List of pests resistant to")
    
    # Suitability
    suitable_states = models.JSONField(default=list)
    suitable_agro_zones = models.JSONField(default=list)
    
    # Seed Rate
    seed_rate_per_acre = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Seed rate in kg per acre"
    )
    
    # Special Features
    special_features = models.TextField(blank=True)
    
    # Status
    is_recommended = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crop_varieties'
        verbose_name = 'Crop Variety'
        verbose_name_plural = 'Crop Varieties'
        unique_together = ['crop', 'variety_name']
    
    def __str__(self):
        return f"{self.crop.name} - {self.variety_name}"


class MandiPrice(models.Model):
    """Daily mandi/market prices"""
    
    crop = models.ForeignKey(CropMaster, on_delete=models.CASCADE, related_name='mandi_prices')
    
    # Location
    mandi_name = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Date
    price_date = models.DateField(db_index=True)
    
    # Prices (per quintal in INR)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    modal_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Volume
    arrivals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Arrivals in quintals"
    )
    
    # Source
    data_source = models.CharField(
        max_length=50,
        choices=[
            ('agmarknet', 'Agmarknet'),
            ('enam', 'e-NAM'),
            ('manual', 'Manual Entry'),
        ],
        default='agmarknet'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mandi_prices'
        verbose_name = 'Mandi Price'
        verbose_name_plural = 'Mandi Prices'
        unique_together = ['crop', 'mandi_name', 'price_date']
        indexes = [
            models.Index(fields=['price_date']),
            models.Index(fields=['district', 'state']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.mandi_name} - {self.price_date}"


class MSPRecord(models.Model):
    """Minimum Support Price records"""
    
    crop = models.ForeignKey(CropMaster, on_delete=models.CASCADE, related_name='msp_records')
    
    # Marketing Season
    marketing_season = models.CharField(
        max_length=10,
        help_text="e.g., 2023-24"
    )
    season_type = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
        ]
    )
    
    # MSP
    msp_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="MSP in INR per quintal"
    )
    
    # Increase from previous year
    increase_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    increase_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Effective dates
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    
    # Government Order
    notification_number = models.CharField(max_length=100, blank=True)
    notification_date = models.DateField(null=True, blank=True)
    
    # Status
    is_current = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'msp_records'
        verbose_name = 'MSP Record'
        verbose_name_plural = 'MSP Records'
        unique_together = ['crop', 'marketing_season', 'season_type']
        ordering = ['-marketing_season']
    
    def __str__(self):
        return f"{self.crop.name} - MSP {self.marketing_season}"


class YieldBenchmark(models.Model):
    """Yield benchmarks by region"""
    
    crop = models.ForeignKey(CropMaster, on_delete=models.CASCADE, related_name='yield_benchmarks')
    
    # Location
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    agro_climatic_zone = models.CharField(max_length=100, blank=True)
    
    # Season
    season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
            ('annual', 'Annual'),
        ]
    )
    
    # Yield Data
    average_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Average yield in quintals per acre"
    )
    high_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="High yield benchmark"
    )
    low_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Low yield benchmark"
    )
    
    # Year
    year = models.IntegerField()
    
    # Data Source
    source = models.CharField(max_length=200, help_text="Data source: DES, State Agri Dept, etc.")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'yield_benchmarks'
        verbose_name = 'Yield Benchmark'
        verbose_name_plural = 'Yield Benchmarks'
        unique_together = ['crop', 'state', 'district', 'season', 'year']
    
    def __str__(self):
        return f"{self.crop.name} - {self.state} - {self.season} {self.year}"
