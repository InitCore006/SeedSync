"""
FPO (Farmer Producer Organization) Models
FPO profiles, memberships, and warehouse management
"""
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import (
    OILSEED_CHOICES, KYC_STATUS_CHOICES, INDIAN_STATES
)
from apps.core.validators import (
    validate_positive, validate_gstin, 
    validate_pan, validate_ifsc, validate_pincode
)


class FPOProfile(TimeStampedModel):
    """
    Farmer Producer Organization profile
    Central hub for farmer aggregation and collective marketing
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='fpo_profile'
    )
    
    # Organization Details
    organization_name = models.CharField(max_length=200)
    registration_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Government registration number"
    )
    registration_type = models.CharField(
        max_length=20,
        choices=[
            ('fpo', 'Farmer Producer Organization'),
            ('cooperative', 'Cooperative Society'),
            ('shg', 'Self Help Group'),
            ('company', 'Producer Company')
        ]
    )
    year_of_registration = models.IntegerField(
        validators=[MinValueValidator(1950)]
    )
    registration_date = models.DateField(null=True, blank=True)
    
    # Leadership
    chairman_name = models.CharField(max_length=200, blank=True)
    ceo_name = models.CharField(max_length=200, blank=True)
    contact_person_name = models.CharField(max_length=200)
    contact_person_designation = models.CharField(max_length=100, blank=True)
    
    # Membership
    total_members = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    active_members = models.IntegerField(default=0)
    women_members = models.IntegerField(default=0)
    
    # Operational Details
    primary_crops = models.JSONField(
        default=list,
        help_text="List of oilseed crops the FPO deals with"
    )
    services_offered = models.JSONField(
        default=list,
        help_text="Services like input supply, procurement, processing, etc."
    )
    
    # Address
    office_address = models.TextField()
    village = models.CharField(max_length=100, blank=True)
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
    
    # Financial Details
    authorized_share_capital = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    paid_up_share_capital = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    annual_turnover = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Bank Details
    bank_account_number = models.CharField(max_length=20, blank=True)
    bank_account_name = models.CharField(max_length=200, blank=True)
    ifsc_code = models.CharField(
        max_length=11,
        blank=True,
        validators=[validate_ifsc]
    )
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    
    # Tax Details
    gstin = models.CharField(
        max_length=15,
        blank=True,
        validators=[validate_gstin],
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
    
    # Verification & Status
    kyc_status = models.CharField(
        max_length=20,
        choices=KYC_STATUS_CHOICES,
        default='pending'
    )
    is_verified = models.BooleanField(default=False)
    verified_by_government = models.BooleanField(default=False)
    verification_documents = models.JSONField(
        default=dict,
        help_text="URLs to uploaded verification documents"
    )
    
    # Logo & Media
    logo = models.ImageField(upload_to='fpos/logos/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='fpos/covers/', blank=True, null=True)
    
    # Statistics
    total_procurement_quintals = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    total_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Additional Info
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'fpo_profiles'
        verbose_name = 'FPO Profile'
        verbose_name_plural = 'FPO Profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.organization_name} - {self.district}, {self.state}"


class FPOMembership(TimeStampedModel):
    """
    Membership relationship between farmers and FPOs
    Tracks farmer's association with FPO
    """
    farmer = models.ForeignKey(
        'farmers.FarmerProfile',
        on_delete=models.CASCADE,
        related_name='fpo_memberships'
    )
    fpo = models.ForeignKey(
        FPOProfile,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    
    # Membership Details
    membership_number = models.CharField(max_length=50)
    joined_date = models.DateField()
    share_capital = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Farmer's share capital contribution"
    )
    share_count = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_founding_member = models.BooleanField(default=False)
    is_board_member = models.BooleanField(default=False)
    board_position = models.CharField(max_length=100, blank=True)
    
    # Transaction Summary
    total_quantity_sold_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    total_value_transacted = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Additional
    exit_date = models.DateField(null=True, blank=True)
    exit_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'fpo_memberships'
        verbose_name = 'FPO Membership'
        verbose_name_plural = 'FPO Memberships'
        unique_together = [['farmer', 'fpo']]
        ordering = ['-joined_date']
    
    def __str__(self):
        return f"{self.farmer.full_name} ← {self.fpo.organization_name}"


class FPOJoinRequest(TimeStampedModel):
    """
    Join request from farmers to FPOs
    Tracks pending requests for FPO membership
    """
    farmer = models.ForeignKey(
        'farmers.FarmerProfile',
        on_delete=models.CASCADE,
        related_name='fpo_join_requests'
    )
    fpo = models.ForeignKey(
        FPOProfile,
        on_delete=models.CASCADE,
        related_name='join_requests'
    )
    
    # Request Details
    message = models.TextField(
        blank=True,
        help_text="Message from farmer to FPO"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    
    # Response
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_join_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    response_message = models.TextField(blank=True)
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_join_requests'
        verbose_name = 'FPO Join Request'
        verbose_name_plural = 'FPO Join Requests'
        unique_together = [['farmer', 'fpo', 'status']]  # One pending request per farmer-fpo pair
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.farmer.full_name} → {self.fpo.organization_name} ({self.status})"


class FPOWarehouse(TimeStampedModel):
    """
    Warehouse facilities owned/operated by FPO
    Storage infrastructure for procured produce
    """
    fpo = models.ForeignKey(
        FPOProfile,
        on_delete=models.CASCADE,
        related_name='warehouses'
    )
    
    # Warehouse Details
    warehouse_name = models.CharField(max_length=200)
    warehouse_code = models.CharField(max_length=50, unique=True)
    warehouse_type = models.CharField(
        max_length=50,
        choices=[
            ('godown', 'Godown'),
            ('cold_storage', 'Cold Storage'),
            ('warehouse', 'Warehouse'),
            ('shed', 'Open Shed')
        ]
    )
    
    # Location
    address = models.TextField()
    village = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    pincode = models.CharField(
        max_length=6,
        validators=[validate_pincode]
    )
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
    
    # Capacity
    capacity_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Total storage capacity"
    )
    current_stock_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Current stock level"
    )
    
    # Infrastructure
    has_scientific_storage = models.BooleanField(
        default=False,
        help_text="Scientific storage with temperature/humidity control"
    )
    has_pest_control = models.BooleanField(default=False)
    has_fire_safety = models.BooleanField(default=False)
    has_security = models.BooleanField(default=False)
    
    # Facilities
    weighing_capacity_quintals = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    has_loading_unloading_facility = models.BooleanField(default=False)
    has_quality_testing_lab = models.BooleanField(default=False)
    
    # Management
    incharge_name = models.CharField(max_length=200, blank=True)
    incharge_phone = models.CharField(max_length=15, blank=True)
    
    # Status
    is_operational = models.BooleanField(default=True)
    operational_since = models.DateField(null=True, blank=True)
    
    # Additional
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'fpo_warehouses'
        verbose_name = 'FPO Warehouse'
        verbose_name_plural = 'FPO Warehouses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.warehouse_name} - {self.fpo.organization_name}"
    
    def get_available_capacity(self):
        """Calculate available storage capacity"""
        return self.capacity_quintals - self.current_stock_quintals
    
    def get_capacity_utilization_percentage(self):
        """Calculate capacity utilization"""
        if self.capacity_quintals > 0:
            return round((self.current_stock_quintals / self.capacity_quintals) * 100, 2)
        return 0
