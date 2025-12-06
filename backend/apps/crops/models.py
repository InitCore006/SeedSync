"""
Crops Models for SeedSync Platform
Master data for crops, varieties, prices, and MSP
"""
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import OILSEED_CHOICES, SEASON_CHOICES, INDIAN_STATES


class CropMaster(TimeStampedModel):
    """
    Master data for oilseed crops
    """
    crop_code = models.CharField(max_length=20, unique=True)
    crop_name = models.CharField(max_length=50, choices=OILSEED_CHOICES)
    hindi_name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=200, blank=True)
    
    # Characteristics
    oil_content_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Average oil content %"
    )
    growing_season = models.JSONField(
        default=list,
        help_text="Suitable seasons for cultivation"
    )
    maturity_days = models.IntegerField(
        help_text="Days to maturity",
        validators=[MinValueValidator(1)]
    )
    
    # Cultivation Requirements
    water_requirement = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    )
    suitable_soil_types = models.JSONField(
        default=list,
        help_text="List of suitable soil types"
    )
    suitable_states = models.JSONField(
        default=list,
        help_text="Major producing states"
    )
    
    # Additional Info
    description = models.TextField(blank=True)
    cultivation_tips = models.TextField(blank=True)
    image = models.ImageField(upload_to='crops/master/', blank=True, null=True)
    
    class Meta:
        db_table = 'crop_master'
        verbose_name = 'Crop Master'
        verbose_name_plural = 'Crop Master Data'
    
    def __str__(self):
        return f"{self.get_crop_name_display()} ({self.hindi_name})"


class CropVariety(TimeStampedModel):
    """
    Different varieties of each crop
    """
    crop = models.ForeignKey(
        CropMaster,
        on_delete=models.CASCADE,
        related_name='varieties'
    )
    variety_name = models.CharField(max_length=100)
    variety_code = models.CharField(max_length=50, unique=True)
    
    # Characteristics
    maturity_days = models.IntegerField(validators=[MinValueValidator(1)])
    yield_potential_quintals_per_acre = models.DecimalField(
        max_digits=6,
        decimal_places=2
    )
    oil_content_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
    
    # Suitability
    season = models.CharField(max_length=20, choices=SEASON_CHOICES)
    suitable_regions = models.JSONField(default=list)
    disease_resistance = models.JSONField(default=list)
    
    # Additional
    description = models.TextField(blank=True)
    seed_rate_kg_per_acre = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'crop_varieties'
        verbose_name = 'Crop Variety'
        verbose_name_plural = 'Crop Varieties'
    
    def __str__(self):
        return f"{self.variety_name} ({self.crop.get_crop_name_display()})"


class MandiPrice(TimeStampedModel):
    """
    Daily mandi prices for oilseeds
    Integrated with eNAM API
    """
    crop_type = models.CharField(max_length=50, choices=OILSEED_CHOICES)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    district = models.CharField(max_length=100)
    market_name = models.CharField(max_length=200)
    
    # Price Details
    date = models.DateField()
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    modal_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Most common selling price"
    )
    
    # Volume
    arrival_quantity_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Source
    source = models.CharField(
        max_length=50,
        default='eNAM',
        choices=[
            ('enam', 'eNAM'),
            ('agmarknet', 'AgMarkNet'),
            ('manual', 'Manual Entry')
        ]
    )
    source_reference = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'mandi_prices'
        verbose_name = 'Mandi Price'
        verbose_name_plural = 'Mandi Prices'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['crop_type', 'state', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.get_crop_type_display()} - {self.market_name} - {self.date}"


class MSPRecord(TimeStampedModel):
    """
    Minimum Support Price records
    Government-announced MSP for different crops and years
    """
    crop_type = models.CharField(max_length=50, choices=OILSEED_CHOICES)
    year = models.IntegerField(help_text="Marketing year (e.g., 2024 for 2024-25)")
    season = models.CharField(max_length=20, choices=SEASON_CHOICES)
    
    # MSP Details
    msp_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="MSP in ₹ per quintal"
    )
    bonus_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Additional bonus if any"
    )
    
    # Reference
    notification_number = models.CharField(max_length=100, blank=True)
    notification_date = models.DateField(null=True, blank=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    
    # Additional Info
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'msp_records'
        verbose_name = 'MSP Record'
        verbose_name_plural = 'MSP Records'
        ordering = ['-year', '-effective_from']
        unique_together = [['crop_type', 'year', 'season']]
    
    def __str__(self):
        return f"{self.get_crop_type_display()} - MSP {self.year} - ₹{self.msp_per_quintal}/quintal"
    
    def get_total_msp(self):
        """Get total MSP including bonus"""
        return self.msp_per_quintal + self.bonus_per_quintal


class CropVarietyRequest(TimeStampedModel):
    """
    Farmer/FPO requests for new crop varieties
    Approval workflow before adding to CropVariety master
    """
    # Requester Info
    farmer = models.ForeignKey(
        'farmers.FarmerProfile',
        on_delete=models.CASCADE,
        related_name='variety_requests',
        null=True,
        blank=True
    )
    fpo = models.ForeignKey(
        'fpos.FPOProfile',
        on_delete=models.CASCADE,
        related_name='variety_requests',
        null=True,
        blank=True
    )
    
    # Variety Details
    crop_type = models.CharField(
        max_length=50,
        choices=OILSEED_CHOICES,
        help_text="Existing crop type"
    )
    variety_name = models.CharField(
        max_length=100,
        help_text="Name of new variety to add"
    )
    variety_code = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional: Official variety code if known"
    )
    
    # Supporting Information
    source = models.CharField(
        max_length=200,
        blank=True,
        help_text="Where is this variety from? (e.g., State Agriculture Dept, ICAR)"
    )
    reason = models.TextField(
        help_text="Why do you need this variety?"
    )
    characteristics = models.TextField(
        blank=True,
        help_text="Any known characteristics (maturity days, yield, etc.)"
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        help_text="Suitable region/district"
    )
    
    # Approval Workflow
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('duplicate', 'Already Exists')
        ],
        default='pending'
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Admin comments/feedback"
    )
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_variety_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Link to created variety (if approved)
    created_variety = models.ForeignKey(
        CropVariety,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_request'
    )
    
    class Meta:
        db_table = 'crop_variety_requests'
        verbose_name = 'Crop Variety Request'
        verbose_name_plural = 'Crop Variety Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['crop_type', 'status']),
        ]
    
    def __str__(self):
        requester = self.farmer.full_name if self.farmer else self.fpo.organization_name
        return f"{self.variety_name} ({self.get_crop_type_display()}) - {requester}"

