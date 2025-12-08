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


class CropPlan(TimeStampedModel):
    """
    Simplified Crop Plan Model with Financial Data
    Separate from CropPlanning - focused on financial planning and lot conversion
    """
    # Basic Information
    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name='simplified_crop_plans'
    )
    farm_land = models.ForeignKey(
        FarmLand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='simplified_crop_plans',
        help_text="Optional: Link to specific farm land parcel"
    )
    
    # Crop Details
    crop_type = models.CharField(
        max_length=50,
        choices=OILSEED_CHOICES,
        help_text="Type of oilseed crop"
    )
    crop_name = models.CharField(
        max_length=100,
        help_text="Display name of crop (e.g., 'Soybean', 'Groundnut')"
    )
    land_acres = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        help_text="Land allocated in acres"
    )
    
    # Cultivation Timeline
    sowing_date = models.DateField(help_text="Date of sowing/planting")
    maturity_days = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of days to maturity"
    )
    expected_harvest_date = models.DateField(
        help_text="Auto-calculated harvest date"
    )
    season = models.CharField(
        max_length=20,
        choices=SEASON_CHOICES,
        help_text="Cultivation season"
    )
    
    # Financial - MSP & Yield
    msp_price_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="MSP price per quintal in ₹"
    )
    estimated_yield_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total estimated yield in quintals"
    )
    estimated_yield_per_acre = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Estimated yield per acre in quintals"
    )
    gross_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Gross revenue = estimated_yield × MSP"
    )
    
    # Cost Breakdown
    seed_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Cost of seeds in ₹"
    )
    fertilizer_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Cost of fertilizers in ₹"
    )
    pesticide_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Cost of pesticides in ₹"
    )
    labor_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Labor cost in ₹"
    )
    irrigation_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Irrigation cost in ₹"
    )
    total_input_costs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Sum of all input costs"
    )
    
    # Profit Calculations
    net_profit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Net profit = gross_revenue - total_input_costs"
    )
    profit_per_acre = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Net profit per acre"
    )
    roi_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        help_text="ROI = (net_profit / total_input_costs) × 100"
    )
    
    # Status & Tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('planned', 'Planned'),
            ('sowing', 'Sowing'),
            ('growing', 'Growing'),
            ('ready_to_harvest', 'Ready to Harvest'),
            ('harvested', 'Harvested'),
            ('converted_to_lot', 'Converted to Lot'),
        ],
        default='planned',
        help_text="Current status of crop plan"
    )
    actual_yield_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Actual yield after harvest (filled post-harvest)"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes or observations"
    )
    
    # Lot Conversion Tracking
    converted_lot = models.ForeignKey(
        'lots.ProcurementLot',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_crop_plan',
        help_text="Procurement lot created from this plan"
    )
    conversion_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date when plan was converted to lot"
    )
    
    class Meta:
        db_table = 'crop_plans'
        verbose_name = 'Crop Plan'
        verbose_name_plural = 'Crop Plans'
        ordering = ['-created_at', '-sowing_date']
        indexes = [
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['sowing_date']),
            models.Index(fields=['crop_type', 'season']),
        ]
    
    def __str__(self):
        return f"{self.crop_name} - {self.land_acres} acres ({self.farmer.full_name})"
    
    def save(self, *args, **kwargs):
        """Override save to auto-calculate dates and financial metrics"""
        # Calculate expected harvest date
        if self.sowing_date and self.maturity_days:
            from datetime import timedelta
            self.expected_harvest_date = self.sowing_date + timedelta(days=self.maturity_days)
        
        # Calculate financial metrics
        self.calculate_financial_metrics()
        
        super().save(*args, **kwargs)
    
    def calculate_financial_metrics(self):
        """Calculate all financial metrics automatically"""
        # Gross Revenue = Yield × MSP
        self.gross_revenue = self.estimated_yield_quintals * self.msp_price_per_quintal
        
        # Total Input Costs
        self.total_input_costs = (
            self.seed_cost + 
            self.fertilizer_cost + 
            self.pesticide_cost + 
            self.labor_cost + 
            self.irrigation_cost
        )
        
        # Net Profit = Gross Revenue - Total Costs
        self.net_profit = self.gross_revenue - self.total_input_costs
        
        # Profit per Acre
        if self.land_acres > 0:
            self.profit_per_acre = self.net_profit / self.land_acres
        else:
            self.profit_per_acre = 0
        
        # ROI Percentage
        if self.total_input_costs > 0:
            self.roi_percentage = (self.net_profit / self.total_input_costs) * 100
        else:
            self.roi_percentage = 0
    
    def create_lot_from_plan(self):
        """Create a ProcurementLot from this crop plan"""
        from apps.lots.models import ProcurementLot
        from django.utils import timezone
        
        if self.status == 'converted_to_lot':
            raise ValueError("This plan has already been converted to a lot")
        
        if self.status != 'harvested':
            raise ValueError("Only harvested plans can be converted to lots")
        
        if not self.actual_yield_quintals:
            raise ValueError("Actual yield must be recorded before creating a lot")
        
        # Create procurement lot
        lot = ProcurementLot.objects.create(
            farmer=self.farmer,
            fpo=self.farmer.fpo if self.farmer.fpo else None,
            crop_type=self.crop_type,
            harvest_date=self.expected_harvest_date,
            quantity_quintals=self.actual_yield_quintals,
            available_quantity_quintals=self.actual_yield_quintals,
            expected_price_per_quintal=self.msp_price_per_quintal,
            quality_grade='A',
            description=f"Created from crop plan: {self.crop_name} - {self.season}",
            status='available',
            managed_by_fpo=True if self.farmer.fpo else False,
            listing_type='fpo_managed' if self.farmer.fpo else 'individual',
        )
        
        # Update plan status
        self.status = 'converted_to_lot'
        self.converted_lot = lot
        self.conversion_date = timezone.now()
        self.save()
        
        return lot
    
    def get_days_until_harvest(self):
        """Calculate days remaining until harvest"""
        from datetime import date
        if self.expected_harvest_date:
            delta = self.expected_harvest_date - date.today()
            return delta.days
        return None
    
    def get_progress_percentage(self):
        """Calculate cultivation progress percentage"""
        from datetime import date
        if self.sowing_date and self.expected_harvest_date:
            total_days = (self.expected_harvest_date - self.sowing_date).days
            elapsed_days = (date.today() - self.sowing_date).days
            
            if elapsed_days < 0:
                return 0
            elif elapsed_days > total_days:
                return 100
            else:
                return int((elapsed_days / total_days) * 100)
        return 0
