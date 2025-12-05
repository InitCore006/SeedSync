"""
Farmer Models for SeedSync Platform
Farmer profiles, farm land details, and crop planning
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import (
    OILSEED_CHOICES, SOIL_TYPE_CHOICES, SEASON_CHOICES,
    KYC_STATUS_CHOICES, INDIAN_STATES
)
from apps.core.validators import (
    validate_positive, validate_aadhaar, 
    validate_pan, validate_ifsc, validate_pincode
)


class FarmerProfile(TimeStampedModel):
    """
    Farmer profile with KYC and bank details
    Linked to User model with role='farmer'
    """
    user = models.OneToOneField(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='farmer_profile'
    )
    fpo = models.ForeignKey(
        'fpos.FPOProfile', 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='farmer_members'
    )
    
    # Personal Details
    full_name = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')],
        blank=True
    )
    profile_photo = models.ImageField(upload_to='farmers/profiles/', blank=True, null=True)
    
    # Farm Details
    total_land_acres = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[validate_positive],
        help_text="Total farmland in acres"
    )
    farming_experience_years = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(80)]
    )
    primary_crops = models.JSONField(
        default=list,
        help_text="List of primary crops grown. e.g., ['soybean', 'mustard']"
    )
    
    # KYC Details
    aadhaar_number = models.CharField(
        max_length=12, 
        blank=True,
        validators=[validate_aadhaar],
        unique=True,
        null=True
    )
    pan_number = models.CharField(
        max_length=10,
        blank=True,
        validators=[validate_pan],
        unique=True,
        null=True
    )
    kyc_status = models.CharField(
        max_length=20,
        choices=KYC_STATUS_CHOICES,
        default='pending'
    )
    kyc_documents = models.JSONField(
        default=dict,
        help_text="URLs to uploaded KYC documents"
    )
    
    # Bank Details
    bank_account_number = models.CharField(max_length=20, blank=True)
    bank_account_holder_name = models.CharField(max_length=200, blank=True)
    ifsc_code = models.CharField(
        max_length=11,
        blank=True,
        validators=[validate_ifsc]
    )
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    
    # Address
    village = models.CharField(max_length=100, blank=True)
    post_office = models.CharField(max_length=100, blank=True)
    tehsil = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    pincode = models.CharField(
        max_length=6,
        validators=[validate_pincode]
    )
    
    # Location
    latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Stats
    total_lots_created = models.IntegerField(default=0)
    total_quantity_sold_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    total_earnings = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Preferences
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('hi', 'Hindi')],
        default='hi'
    )
    
    class Meta:
        db_table = 'farmer_profiles'
        verbose_name = 'Farmer Profile'
        verbose_name_plural = 'Farmer Profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.district}, {self.state}"
    
    def get_fpo_name(self):
        return self.fpo.organization_name if self.fpo else 'Independent'


class FarmLand(TimeStampedModel):
    """
    Individual farm land parcels owned by farmer
    A farmer can have multiple land parcels
    """
    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name='farm_lands'
    )
    
    # Land Details
    land_name = models.CharField(
        max_length=100,
        help_text="Name or identifier for this land parcel"
    )
    land_area_acres = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[validate_positive]
    )
    survey_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="Government survey/khasra number"
    )
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    village = models.CharField(max_length=100, blank=True)
    
    # Soil & Infrastructure
    soil_type = models.CharField(
        max_length=20,
        choices=SOIL_TYPE_CHOICES
    )
    soil_ph = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(14)]
    )
    irrigation_available = models.BooleanField(default=False)
    irrigation_type = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('drip', 'Drip Irrigation'),
            ('sprinkler', 'Sprinkler'),
            ('canal', 'Canal'),
            ('well', 'Well/Tubewell'),
            ('rainfed', 'Rainfed')
        ]
    )
    water_source = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('groundwater', 'Groundwater'),
            ('surface_water', 'Surface Water'),
            ('rainwater', 'Rainwater'),
            ('mixed', 'Mixed')
        ]
    )
    
    # Ownership
    ownership_type = models.CharField(
        max_length=20,
        choices=[
            ('owned', 'Owned'),
            ('leased', 'Leased'),
            ('shared', 'Shared Cropping')
        ],
        default='owned'
    )
    ownership_document = models.FileField(
        upload_to='farmers/land_documents/',
        blank=True,
        null=True
    )
    
    # Additional
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'farm_lands'
        verbose_name = 'Farm Land'
        verbose_name_plural = 'Farm Lands'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.land_name} - {self.land_area_acres} acres ({self.farmer.full_name})"


class CropPlanning(TimeStampedModel):
    """
    Crop planning and cultivation records
    Tracks what crops are planted on which land
    """
    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name='crop_plans'
    )
    farm_land = models.ForeignKey(
        FarmLand,
        on_delete=models.CASCADE,
        related_name='crop_plans'
    )
    
    # Crop Details
    crop_type = models.CharField(
        max_length=50,
        choices=OILSEED_CHOICES
    )
    crop_variety = models.CharField(max_length=100, blank=True)
    season = models.CharField(
        max_length=20,
        choices=SEASON_CHOICES
    )
    
    # Cultivation Details
    sowing_date = models.DateField()
    expected_harvest_date = models.DateField()
    actual_harvest_date = models.DateField(null=True, blank=True)
    
    # Area & Yield
    cultivation_area_acres = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[validate_positive]
    )
    expected_yield_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    actual_yield_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Cultivation Practices
    seed_variety = models.CharField(max_length=100, blank=True)
    seed_quantity_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    fertilizer_used = models.JSONField(
        default=list,
        help_text="List of fertilizers used"
    )
    pesticide_used = models.JSONField(
        default=list,
        help_text="List of pesticides used"
    )
    organic_farming = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('planned', 'Planned'),
            ('sowed', 'Sowed'),
            ('growing', 'Growing'),
            ('harvested', 'Harvested'),
            ('sold', 'Sold')
        ],
        default='planned'
    )
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'crop_planning'
        verbose_name = 'Crop Planning'
        verbose_name_plural = 'Crop Planning'
        ordering = ['-sowing_date']
    
    def __str__(self):
        return f"{self.get_crop_type_display()} - {self.season} ({self.farmer.full_name})"
    
    def get_yield_per_acre(self):
        """Calculate yield per acre"""
        if self.actual_yield_quintals and self.cultivation_area_acres:
            return round(self.actual_yield_quintals / self.cultivation_area_acres, 2)
        return 0
