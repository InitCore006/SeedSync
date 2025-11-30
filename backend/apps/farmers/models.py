from django.db import models
import uuid

class Farmer(models.Model):
    """Farmer master profile"""
    
    CATEGORY_CHOICES = [
        ('marginal', 'Marginal (< 1 hectare)'),
        ('small', 'Small (1-2 hectares)'),
        ('semi_medium', 'Semi-Medium (2-4 hectares)'),
        ('medium', 'Medium (4-10 hectares)'),
        ('large', 'Large (> 10 hectares)'),
    ]
    
    CASTE_CATEGORY_CHOICES = [
        ('general', 'General'),
        ('obc', 'OBC'),
        ('sc', 'SC'),
        ('st', 'ST'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='farmer_profile')
    
    # Farmer ID (like Kisan Credit Card)
    farmer_id = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Land Details
    total_land_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total land in acres"
    )
    irrigated_land = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Irrigated land in acres"
    )
    rain_fed_land = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Rain-fed land in acres"
    )
    
    # Categorization
    farmer_category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='marginal'
    )
    caste_category = models.CharField(
        max_length=10,
        choices=CASTE_CATEGORY_CHOICES,
        default='general'
    )
    
    # FPO Membership - FIXED: Use string reference to avoid circular import
    is_fpo_member = models.BooleanField(default=False)
    primary_fpo = models.ForeignKey(
        'fpos.FPO',  # String reference instead of direct import
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_members'
    )
    
    # Government Schemes
    has_kisan_credit_card = models.BooleanField(default=False)
    kcc_number = models.CharField(max_length=20, blank=True)
    has_pmfby_insurance = models.BooleanField(default=False)
    pmfby_policy_number = models.CharField(max_length=30, blank=True)
    has_pm_kisan = models.BooleanField(default=False)
    
    # Performance Metrics (for credit scoring)
    total_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total production in quintals"
    )
    average_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Average yield per acre"
    )
    credit_score = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farmers'
        verbose_name = 'Farmer'
        verbose_name_plural = 'Farmers'
        indexes = [
            models.Index(fields=['farmer_id']),
            models.Index(fields=['is_fpo_member']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} ({self.farmer_id})"
    
    def calculate_credit_score(self):
        """Calculate farmer credit score based on performance"""
        score = 0
        
        # Land ownership (max 30 points)
        if self.total_land_area > 10:
            score += 30
        elif self.total_land_area > 5:
            score += 20
        else:
            score += 10
        
        # FPO membership (10 points)
        if self.is_fpo_member:
            score += 10
        
        # Government schemes (20 points)
        if self.has_kisan_credit_card:
            score += 10
        if self.has_pmfby_insurance:
            score += 10
        
        # Production performance (40 points)
        if self.average_yield > 20:
            score += 40
        elif self.average_yield > 15:
            score += 30
        elif self.average_yield > 10:
            score += 20
        else:
            score += 10
        
        self.credit_score = min(score, 100)
        self.save()
        return self.credit_score


class FarmPlot(models.Model):
    """Individual farm plot/survey number details"""
    
    IRRIGATION_CHOICES = [
        ('canal', 'Canal'),
        ('borewell', 'Borewell'),
        ('drip', 'Drip Irrigation'),
        ('sprinkler', 'Sprinkler'),
        ('rain_fed', 'Rain-fed'),
    ]
    
    SOIL_TYPE_CHOICES = [
        ('alluvial', 'Alluvial'),
        ('black', 'Black (Regur)'),
        ('red', 'Red'),
        ('laterite', 'Laterite'),
        ('sandy', 'Sandy'),
        ('clay', 'Clay'),
        ('loamy', 'Loamy'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='farm_plots')
    
    # Plot Identification
    plot_name = models.CharField(max_length=100)
    survey_number = models.CharField(max_length=50, help_text="Survey/Khasra number")
    sub_division = models.CharField(max_length=50, blank=True)
    
    # Location
    village = models.CharField(max_length=100)
    taluka = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # GIS Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    boundary = models.JSONField(null=True, blank=True)
    
    # Plot Details
    area = models.DecimalField(max_digits=10, decimal_places=2, help_text="Area in acres")
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES)
    irrigation_type = models.CharField(max_length=20, choices=IRRIGATION_CHOICES)
    
    # Soil Health Card
    soil_ph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    organic_carbon = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    nitrogen = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    phosphorus = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    potassium = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    soil_health_card_date = models.DateField(null=True, blank=True)
    
    # Ownership
    ownership_type = models.CharField(
        max_length=20,
        choices=[
            ('owned', 'Owned'),
            ('leased', 'Leased'),
            ('shared', 'Shared'),
        ],
        default='owned'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farm_plots'
        verbose_name = 'Farm Plot'
        verbose_name_plural = 'Farm Plots'
        indexes = [
            models.Index(fields=['survey_number']),
            models.Index(fields=['district', 'state']),
        ]
    
    def __str__(self):
        return f"{self.plot_name} - {self.survey_number}"


class CropPlanning(models.Model):
    """Crop planning and calendar for each season"""
    
    SEASON_CHOICES = [
        ('kharif', 'Kharif (Monsoon)'),
        ('rabi', 'Rabi (Winter)'),
        ('zaid', 'Zaid (Summer)'),
    ]
    
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('sowing', 'Sowing'),
        ('growing', 'Growing'),
        ('harvesting', 'Harvesting'),
        ('harvested', 'Harvested'),
        ('sold', 'Sold'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm_plot = models.ForeignKey(FarmPlot, on_delete=models.CASCADE, related_name='crop_plans')
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.PROTECT)
    variety = models.ForeignKey('crops.CropVariety', on_delete=models.PROTECT, null=True, blank=True)
    
    # Planning
    season = models.CharField(max_length=10, choices=SEASON_CHOICES)
    year = models.IntegerField()
    area_planned = models.DecimalField(max_digits=10, decimal_places=2, help_text="Area in acres")
    
    # Dates
    planned_sowing_date = models.DateField()
    actual_sowing_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField()
    actual_harvest_date = models.DateField(null=True, blank=True)
    
    # Production
    expected_yield = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Expected yield in quintals"
    )
    actual_yield = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual yield in quintals"
    )
    
    # Cost & Revenue
    input_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Total input cost in INR"
    )
    revenue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Total revenue in INR"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    
    # FPO Linkage - FIXED: Use string reference
    committed_to_fpo = models.BooleanField(default=False)
    fpo_commitment = models.ForeignKey(
        'fpos.FPO',  # String reference
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crop_commitments'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crop_planning'
        verbose_name = 'Crop Planning'
        verbose_name_plural = 'Crop Planning'
        indexes = [
            models.Index(fields=['season', 'year']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.season} {self.year}"


class FPOMembership(models.Model):
    """Farmer's membership in FPO"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
    ]
    
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='fpo_memberships')
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='memberships')
    
    # Membership Details
    membership_number = models.CharField(max_length=20, unique=True)
    joining_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Share Capital
    shares_held = models.IntegerField(default=1)
    share_value_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_share_capital = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Voting Rights
    has_voting_rights = models.BooleanField(default=True)
    
    # Performance Tracking
    total_produce_supplied = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total produce supplied in quintals"
    )
    total_earnings = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Total earnings from FPO in INR"
    )
    dividend_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total dividend earned in INR"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_memberships'
        verbose_name = 'FPO Membership'
        verbose_name_plural = 'FPO Memberships'
        unique_together = ['farmer', 'fpo']
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - {self.fpo.name}"