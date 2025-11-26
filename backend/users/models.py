from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel
from django.utils.translation import gettext_lazy as _


from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from core.models import TimeStampedModel
from django.utils.translation import gettext_lazy as _
import uuid


class User(AbstractUser, TimeStampedModel):
    """
    Extended User Model - Base for all stakeholders
    Contains ONLY common fields used across ALL user types
    """
    
    ROLE_CHOICES = [
        ('FARMER', 'Farmer'),  # Mobile App Only
        ('FPO', 'Farmer Producer Organization'),
        ('PROCESSOR', 'Processor'),
        ('RETAILER', 'Retailer'),
        ('LOGISTICS', 'Logistics Partner'),
        ('WAREHOUSE', 'Warehouse Operator'),
        ('GOVERNMENT', 'Government Official'),
    ]
    
    APPROVAL_STATUS = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+?91?\d{10}$',
        message="Phone number must be valid Indian number: '+919999999999' or '9999999999'"
    )
    
    # ========== CORE AUTHENTICATION FIELDS ==========
    # username, password, first_name, last_name inherited from AbstractUser
    
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES,
        help_text="User role determines access level"
    )
    
    phone_number = models.CharField(
        validators=[phone_regex], 
        max_length=15, 
        unique=True,
        db_index=True,
        help_text="Primary login credential for mobile app"
    )
    
    email = models.EmailField(
        unique=True, 
        null=True,
        blank=True,
        db_index=True,
        help_text="Optional for farmers, required for web users"
    )
    
    # ========== VERIFICATION STATUS ==========
    phone_verified = models.BooleanField(
        default=False,
        help_text="Set to True after OTP verification"
    )
    
    email_verified = models.BooleanField(
        default=False,
        help_text="Set to True after email verification"
    )
    
    # ========== APPROVAL WORKFLOW ==========
    approval_status = models.CharField(
        max_length=20, 
        choices=APPROVAL_STATUS, 
        default='PENDING',
        db_index=True,
        help_text="Government approval required (except for FARMER and GOVERNMENT roles)"
    )
    
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_users',
        limit_choices_to={'role': 'GOVERNMENT'}
    )
    
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # ========== USER PREFERENCES ==========
    preferred_language = models.CharField(
        max_length=10, 
        default='en',
        choices=[
            ('en', 'English'),
            ('hi', 'हिन्दी (Hindi)'),
            ('gu', 'ગુજરાતી (Gujarati)'),
            ('mr', 'मराठी (Marathi)'),
            ('ta', 'தமிழ் (Tamil)'),
            ('te', 'తెలుగు (Telugu)'),
            ('kn', 'ಕನ್ನಡ (Kannada)'),
            ('bn', 'বাংলা (Bengali)'),
            ('pa', 'ਪੰਜਾਬੀ (Punjabi)'),
            ('or', 'ଓଡ଼ିଆ (Odia)'),
            ('ml', 'മലയാളം (Malayalam)'),
            ('as', 'অসমীয়া (Assamese)'),
        ],
        help_text="Default app language"
    )
    
    profile_picture = models.ImageField(
        upload_to='profiles/', 
        null=True, 
        blank=True,
        help_text="Profile photo URL"
    )
    
    # ========== SECURITY & SESSION ==========
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    login_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # ========== METADATA ==========
    # created_at, updated_at inherited from TimeStampedModel
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role', 'approval_status']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['email']),
            models.Index(fields=['approval_status', 'created_at']),
            models.Index(fields=['role', 'is_active']),
        ]
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    @property
    def is_approved(self):
        """Check if user is approved"""
        return self.approval_status == 'APPROVED'
    
    @property
    def can_login(self):
        """
        Login access logic:
        - FARMER: No approval needed (auto-approved after registration)
        - GOVERNMENT: No approval needed (pre-created accounts)
        - Others (FPO/Processor/Retailer/Logistics): Need government approval
        """
        if not self.is_active:
            return False
            
        if self.role in ['FARMER', 'GOVERNMENT']:
            return True
            
        return self.is_approved
    
    @property
    def full_name(self):
        """Get full name or username"""
        return self.get_full_name() or self.username
    
    def save(self, *args, **kwargs):
        # Auto-approve farmers after registration
        if self.role == 'FARMER' and not self.pk:
            self.approval_status = 'APPROVED'
        
        # Auto-approve government users
        if self.role == 'GOVERNMENT' and not self.pk:
            self.approval_status = 'APPROVED'
            
        super().save(*args, **kwargs)


class FarmerProfile(TimeStampedModel):
    """
    Farmer-specific profile - MOBILE APP ONLY
    All farmer-related fields stored here (not in User model)
    """
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='farmer_profile',
        limit_choices_to={'role': 'FARMER'}
    )
    
    # Auto-generated unique farmer ID
    farmer_id = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        editable=False,
        help_text="Format: FRM{YEAR}{SEQUENCE} e.g., FRM2025001247"
    )
    
    # ========== STEP 1: PERSONAL DETAILS (REGISTRATION) ==========
    
    # Full name stored in User model (first_name + last_name)
    
    father_husband_name = models.CharField(
        max_length=200,
        help_text="As per Aadhaar Card"
    )
    
    date_of_birth = models.DateField(
        null=True, 
        blank=True,
        help_text="Optional, for age verification"
    )
    
    gender = models.CharField(
        max_length=10,
        choices=[
            ('M', 'Male'),
            ('F', 'Female'),
            ('O', 'Other')
        ],
        help_text="As per Aadhaar"
    )
    
    # Email stored in User model (optional for farmers)
    
    # ========== STEP 2: LOCATION DETAILS ==========
    
    village = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Village/Town name"
    )
    
    district = models.CharField(
        max_length=100,
        db_index=True
    )
    
    state = models.CharField(
        max_length=100,
        db_index=True,
        choices=[
            ('Andhra Pradesh', 'Andhra Pradesh'),
            ('Arunachal Pradesh', 'Arunachal Pradesh'),
            ('Assam', 'Assam'),
            ('Bihar', 'Bihar'),
            ('Chhattisgarh', 'Chhattisgarh'),
            ('Goa', 'Goa'),
            ('Gujarat', 'Gujarat'),
            ('Haryana', 'Haryana'),
            ('Himachal Pradesh', 'Himachal Pradesh'),
            ('Jharkhand', 'Jharkhand'),
            ('Karnataka', 'Karnataka'),
            ('Kerala', 'Kerala'),
            ('Madhya Pradesh', 'Madhya Pradesh'),
            ('Maharashtra', 'Maharashtra'),
            ('Manipur', 'Manipur'),
            ('Meghalaya', 'Meghalaya'),
            ('Mizoram', 'Mizoram'),
            ('Nagaland', 'Nagaland'),
            ('Odisha', 'Odisha'),
            ('Punjab', 'Punjab'),
            ('Rajasthan', 'Rajasthan'),
            ('Sikkim', 'Sikkim'),
            ('Tamil Nadu', 'Tamil Nadu'),
            ('Telangana', 'Telangana'),
            ('Tripura', 'Tripura'),
            ('Uttar Pradesh', 'Uttar Pradesh'),
            ('Uttarakhand', 'Uttarakhand'),
            ('West Bengal', 'West Bengal'),
        ]
    )
    
    pincode = models.CharField(
        max_length=6,
        validators=[
            RegexValidator(
                regex=r'^\d{6}$',
                message="PIN Code must be exactly 6 digits"
            )
        ]
    )
    
    # GPS Location (Auto-captured from mobile app)
    latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text="Auto-captured from phone GPS"
    )
    
    longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True,
        help_text="Auto-captured from phone GPS"
    )
    
    # ========== STEP 3: FARM DETAILS ==========
    
    total_land_area = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.1)],
        help_text="Total cultivable land in acres"
    )
    
    primary_crops = models.JSONField(
        default=list,
        help_text="List of oilseeds grown: ['Groundnut', 'Mustard', 'Sesame', etc.]"
    )
    
    expected_annual_production = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Expected yearly production in quintals"
    )
    
    # ========== STEP 4: BANK DETAILS (OPTIONAL BUT RECOMMENDED) ==========
    
    bank_account_number = models.CharField(
        max_length=20, 
        blank=True,
        help_text="For receiving payments"
    )
    
    ifsc_code = models.CharField(
        max_length=11, 
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z]{4}0[A-Z0-9]{6}$',
                message="Invalid IFSC Code format"
            )
        ]
    )
    
    bank_name = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Auto-filled from IFSC"
    )
    
    branch_name = models.CharField(
        max_length=100, 
        blank=True
    )
    
    account_holder_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Should match farmer's name"
    )
    
    # UPI (Alternative payment method)
    upi_id = models.CharField(
        max_length=100, 
        blank=True,
        help_text="farmer@bank or 9999999999@upi"
    )
    
    # ========== VERIFICATION & DOCUMENTS ==========
    
    aadhaar_verified = models.BooleanField(
        default=False,
        help_text="DigiLocker eKYC verification status"
    )
    
    land_records_uploaded = models.BooleanField(
        default=False,
        help_text="Land ownership documents verified"
    )
    
    # ========== PERFORMANCE METRICS (Auto-updated) ==========
    
    total_transactions = models.IntegerField(
        default=0,
        editable=False,
        help_text="Number of completed sales"
    )
    
    total_revenue = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        editable=False,
        help_text="Lifetime earnings in ₹"
    )
    
    performance_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        editable=False,
        help_text="Average rating from buyers (0-5)"
    )
    
    total_ratings = models.IntegerField(
        default=0,
        editable=False,
        help_text="Number of ratings received"
    )
    
    # Credit Score (Future: For loan eligibility)
    credit_score = models.IntegerField(
        default=500,
        validators=[MinValueValidator(300), MaxValueValidator(900)],
        editable=False,
        help_text="Farmer credit score (300-900)"
    )
    
    # ========== PROFILE COMPLETION STATUS ==========
    
    profile_completed = models.BooleanField(
        default=False,
        editable=False,
        help_text="True when all mandatory fields are filled"
    )
    
    profile_completion_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        editable=False,
        help_text="Profile completion status (0-100%)"
    )
    
    # ========== ACTIVITY TRACKING ==========
    
    last_lot_created_at = models.DateTimeField(null=True, blank=True, editable=False)
    last_transaction_at = models.DateTimeField(null=True, blank=True, editable=False)
    is_active_seller = models.BooleanField(
        default=True,
        help_text="False if inactive for 6+ months"
    )
    
    class Meta:
        db_table = 'farmer_profiles'
        indexes = [
            models.Index(fields=['state', 'district']),
            models.Index(fields=['farmer_id']),
            models.Index(fields=['village']),
            models.Index(fields=['is_active_seller']),
        ]
        verbose_name = 'Farmer Profile'
        verbose_name_plural = 'Farmer Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.farmer_id} ({self.village}, {self.state})"
    
    def save(self, *args, **kwargs):
        # Generate farmer_id if new record
        if not self.farmer_id:
            from datetime import datetime
            year = datetime.now().year
            # Get last farmer ID for the year
            last_farmer = FarmerProfile.objects.filter(
                farmer_id__startswith=f'FRM{year}'
            ).order_by('-farmer_id').first()
            
            if last_farmer:
                last_sequence = int(last_farmer.farmer_id[-6:])
                new_sequence = last_sequence + 1
            else:
                new_sequence = 1
            
            self.farmer_id = f'FRM{year}{new_sequence:06d}'
        
        # Calculate profile completion
        self._calculate_profile_completion()
        
        super().save(*args, **kwargs)
    
    def _calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        total_fields = 15  # Total important fields
        completed_fields = 0
        
        # Check mandatory fields
        if self.father_husband_name:
            completed_fields += 1
        if self.gender:
            completed_fields += 1
        if self.village:
            completed_fields += 1
        if self.district:
            completed_fields += 1
        if self.state:
            completed_fields += 1
        if self.pincode:
            completed_fields += 1
        if self.total_land_area:
            completed_fields += 1
        if self.primary_crops:
            completed_fields += 1
        if self.expected_annual_production:
            completed_fields += 1
        
        # Optional but important
        if self.date_of_birth:
            completed_fields += 1
        if self.latitude and self.longitude:
            completed_fields += 1
        if self.bank_account_number and self.ifsc_code:
            completed_fields += 2
        if self.aadhaar_verified:
            completed_fields += 1
        if self.user.email:
            completed_fields += 1
        
        self.profile_completion_percentage = int((completed_fields / total_fields) * 100)
        self.profile_completed = self.profile_completion_percentage >= 80
    
    @property
    def location_display(self):
        """Human-readable location"""
        return f"{self.village}, {self.district}, {self.state}"
    
    @property
    def bank_details_added(self):
        """Check if bank details are complete"""
        return bool(self.bank_account_number and self.ifsc_code)
    
    @property
    def can_create_lot(self):
        """Check if farmer can create lots"""
        return self.profile_completed and self.user.phone_verified
    
    @property
    def can_receive_payment(self):
        """Check if farmer can receive payments"""
        return self.bank_details_added or bool(self.upi_id)


class FPOProfile(TimeStampedModel):
    """FPO/Cooperative Profile - WEB REGISTRATION"""
    
    REGISTRATION_TYPE = [
        ('FPO', 'Farmer Producer Organization'),
        ('COOPERATIVE', 'Cooperative Society'),
        ('SHG', 'Self Help Group'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='fpo_profile')
    
    # Step 1: Organization Details
    organization_name = models.CharField(max_length=200)
    registration_type = models.CharField(max_length=20, choices=REGISTRATION_TYPE)
    registration_number = models.CharField(max_length=50, unique=True, db_index=True)
    year_of_registration = models.IntegerField()
    total_members = models.IntegerField(default=0)
    
    # Contact Person
    contact_person_name = models.CharField(max_length=200)
    contact_person_designation = models.CharField(max_length=100, blank=True)
    
    # Step 2: Location & Coverage
    office_address = models.TextField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    block = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=6)
    
    # Geo-location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Operational Area
    operational_villages = models.JSONField(
        default=list,
        help_text="List of villages covered"
    )
    total_land_coverage = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Total land area in acres"
    )
    primary_oilseeds = models.JSONField(
        default=list,
        help_text="['Soybean', 'Mustard', 'Sunflower', etc.]"
    )
    
    # Step 3: Infrastructure
    has_storage = models.BooleanField(default=False)
    has_transport = models.BooleanField(default=False)
    uses_logistics_partners = models.BooleanField(default=False)
    
    average_annual_procurement = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="In metric tonnes"
    )
    
    # Step 4: Verification & Banking
    registration_certificate = models.FileField(
        upload_to='fpo/certificates/', 
        null=True, 
        blank=True
    )
    gstin = models.CharField(max_length=15, blank=True)
    
    # Bank Details
    bank_account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100, blank=True)
    branch_name = models.CharField(max_length=100, blank=True)
    cancelled_cheque = models.FileField(upload_to='fpo/bank/', null=True, blank=True)
    
    # Performance Metrics
    total_lots_created = models.IntegerField(default=0)
    total_sales_volume = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'fpo_profiles'
        indexes = [
            models.Index(fields=['state', 'district']),
            models.Index(fields=['registration_number']),
        ]
        verbose_name = 'FPO Profile'
        verbose_name_plural = 'FPO Profiles'
    
    def __str__(self):
        return f"{self.organization_name} ({self.registration_number})"


class ProcessorProfile(TimeStampedModel):
    """Processor/Mill Profile - WEB REGISTRATION"""
    
    PROCESSOR_TYPE = [
        ('MILL', 'Oil Mill (Ghani/Expeller)'),
        ('SOLVENT', 'Solvent Extraction Plant'),
        ('REFINERY', 'Refinery'),
        ('INTEGRATED', 'Integrated (Mill + Refinery)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='processor_profile')
    
    # Step 1: Company Details
    company_name = models.CharField(max_length=200)
    processor_type = models.CharField(max_length=20, choices=PROCESSOR_TYPE)
    gstin = models.CharField(max_length=15, unique=True, db_index=True)
    cin_number = models.CharField(max_length=21, blank=True, help_text="Company Identification Number")
    year_of_establishment = models.IntegerField()
    
    # Contact Person (Authorized Signatory)
    contact_person_name = models.CharField(max_length=200)
    contact_person_designation = models.CharField(max_length=100)
    
    # Step 2: Plant Location & Capacity
    plant_address = models.TextField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    # GPS Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Processing Capacity
    daily_crushing_capacity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Tonnes per day"
    )
    annual_capacity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Auto-calculated in tonnes/year",
        editable=False
    )
    seeds_processed = models.JSONField(
        default=list,
        help_text="['Soybean', 'Mustard', 'Sunflower', etc.]"
    )
    operational_status = models.CharField(
        max_length=20,
        choices=[
            ('FULL', 'Fully Operational'),
            ('PARTIAL', 'Partially Operational'),
            ('EXPANSION', 'Under Expansion'),
        ],
        default='FULL'
    )
    
    # Step 3: Storage & Logistics
    raw_material_storage = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="In metric tonnes"
    )
    finished_oil_storage = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="In metric tonnes"
    )
    
    has_own_warehouse = models.BooleanField(default=False)
    has_own_fleet = models.BooleanField(default=False)
    uses_third_party_logistics = models.BooleanField(default=False)
    
    fleet_size = models.IntegerField(default=0, help_text="Number of owned vehicles")
    preferred_sourcing_radius = models.IntegerField(
        default=100,
        help_text="In kilometers"
    )
    
    # Step 4: Licenses & Compliance
    fssai_license = models.CharField(max_length=14, blank=True)
    fssai_expiry = models.DateField(null=True, blank=True)
    fssai_certificate = models.FileField(upload_to='processor/fssai/', null=True, blank=True)
    
    factory_registration = models.CharField(max_length=50, blank=True)
    factory_certificate = models.FileField(upload_to='processor/factory/', null=True, blank=True)
    
    pcb_clearance = models.CharField(max_length=50, blank=True)
    pcb_certificate = models.FileField(upload_to='processor/pcb/', null=True, blank=True)
    
    # Quality Certifications
    has_iso_9001 = models.BooleanField(default=False)
    has_haccp = models.BooleanField(default=False)
    has_bis = models.BooleanField(default=False)
    quality_certificates = models.FileField(upload_to='processor/quality/', null=True, blank=True)
    
    # Banking
    bank_account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100, blank=True)
    branch_name = models.CharField(max_length=100, blank=True)
    cancelled_cheque = models.FileField(upload_to='processor/bank/', null=True, blank=True)
    
    # Step 5: Market Preferences
    procurement_methods = models.JSONField(
        default=list,
        help_text="['FPO_DIRECT', 'AGGREGATOR', 'ENAM']"
    )
    expected_monthly_procurement = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="In metric tonnes"
    )
    interested_in_contract_farming = models.BooleanField(default=False)
    
    # Performance Metrics
    current_utilization = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage"
    )
    total_procurement_volume = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_production_volume = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    
    class Meta:
        db_table = 'processor_profiles'
        indexes = [
            models.Index(fields=['state', 'district']),
            models.Index(fields=['gstin']),
            models.Index(fields=['processor_type']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-calculate annual capacity
        if self.daily_crushing_capacity:
            self.annual_capacity = self.daily_crushing_capacity * 300  # Assuming 300 working days
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.company_name} ({self.get_processor_type_display()})"


class RetailerProfile(TimeStampedModel):
    """Retailer/Buyer Profile - WEB REGISTRATION"""
    
    BUSINESS_TYPE = [
        ('RETAIL_CHAIN', 'Retail Chain / Supermarket'),
        ('KIRANA', 'Kirana / Small Retailer'),
        ('BRAND', 'Food Brand / Manufacturer'),
        ('EXPORTER', 'Exporter'),
        ('INSTITUTIONAL', 'Institutional Buyer (Hotels/Canteen)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='retailer_profile')
    
    # Step 1: Business Details
    business_name = models.CharField(max_length=200)
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPE)
    gstin = models.CharField(max_length=15, db_index=True)
    trade_license = models.CharField(max_length=50, blank=True)
    
    # Contact Person
    contact_person_name = models.CharField(max_length=200)
    contact_person_designation = models.CharField(max_length=100)
    
    # Step 2: Operational Details
    number_of_outlets = models.IntegerField(default=1)
    main_office_address = models.TextField()
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    monthly_oil_sales_volume = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="In litres"
    )
    oil_types_sold = models.JSONField(
        default=list,
        help_text="['Soybean', 'Mustard', 'Sunflower', 'Blended', 'Palm']"
    )
    
    # Storage
    has_warehouse = models.BooleanField(default=False)
    storage_capacity = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="In metric tonnes"
    )
    warehouse_location = models.CharField(max_length=200, blank=True)
    
    # Procurement Frequency
    procurement_frequency = models.CharField(
        max_length=20,
        choices=[
            ('WEEKLY', 'Weekly'),
            ('FORTNIGHTLY', 'Fortnightly'),
            ('MONTHLY', 'Monthly'),
        ],
        default='MONTHLY'
    )
    
    # Step 3: Preferences & Banking
    sourcing_preferences = models.JSONField(
        default=list,
        help_text="['PROCESSOR_DIRECT', 'DISTRIBUTOR', 'WHOLESALE']"
    )
    packaging_preference = models.JSONField(
        default=list,
        help_text="['BULK', 'RETAIL_BRANDED']"
    )
    
    # FSSAI (if applicable)
    fssai_license = models.CharField(max_length=14, blank=True)
    fssai_certificate = models.FileField(upload_to='retailer/fssai/', null=True, blank=True)
    
    # Banking
    bank_account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100, blank=True)
    branch_name = models.CharField(max_length=100, blank=True)
    cancelled_cheque = models.FileField(upload_to='retailer/bank/', null=True, blank=True)
    
    # Performance Metrics
    total_purchase_volume = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'retailer_profiles'
        indexes = [
            models.Index(fields=['state', 'city']),
            models.Index(fields=['business_type']),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.get_business_type_display()})"


class LogisticsProfile(TimeStampedModel):
    """Logistics Partner Profile - WEB REGISTRATION"""
    
    SERVICE_TYPE = [
        ('TRANSPORT', 'Transportation Only'),
        ('WAREHOUSE', 'Warehousing Only'),
        ('3PL', 'Both (3PL Provider)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='logistics_profile')
    
    # Step 1: Company Details
    company_name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE)
    gstin = models.CharField(max_length=15, db_index=True)
    
    # Contact Person
    contact_person_name = models.CharField(max_length=200)
    
    # Step 2: Fleet & Infrastructure
    # Fleet (if Transportation)
    fleet_small_trucks = models.IntegerField(default=0, help_text="Trucks < 5 MT")
    fleet_medium_trucks = models.IntegerField(default=0, help_text="Trucks 5-10 MT")
    fleet_large_trucks = models.IntegerField(default=0, help_text="Trucks > 10 MT")
    fleet_tankers = models.IntegerField(default=0)
    fleet_refrigerated = models.IntegerField(default=0)
    has_gps_tracking = models.BooleanField(default=False)
    
    # Service Coverage
    coverage_states = models.JSONField(
        default=list,
        help_text="List of states where service is available"
    )
    
    # Step 3: Compliance & Banking
    transport_license = models.CharField(max_length=50, blank=True)
    transport_certificate = models.FileField(upload_to='logistics/licenses/', null=True, blank=True)
    
    warehouse_license = models.CharField(max_length=50, blank=True)
    warehouse_certificate = models.FileField(upload_to='logistics/licenses/', null=True, blank=True)
    
    insurance_certificate = models.FileField(upload_to='logistics/insurance/', null=True, blank=True)
    
    # Banking
    bank_account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100, blank=True)
    branch_name = models.CharField(max_length=100, blank=True)
    cancelled_cheque = models.FileField(upload_to='logistics/bank/', null=True, blank=True)
    
    # Performance Metrics
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    completed_deliveries = models.IntegerField(default=0)
    total_distance_covered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    on_time_delivery_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    @property
    def total_fleet_size(self):
        return (
            self.fleet_small_trucks +
            self.fleet_medium_trucks +
            self.fleet_large_trucks +
            self.fleet_tankers +
            self.fleet_refrigerated
        )
    
    class Meta:
        db_table = 'logistics_profiles'
        indexes = [
            models.Index(fields=['service_type']),
        ]
    
    def __str__(self):
        return f"{self.company_name} ({self.get_service_type_display()})"


class GovernmentProfile(TimeStampedModel):
    """Government Official Profile - Direct Login (No Registration Flow)"""
    
    DESIGNATION_CHOICES = [
        ('NATIONAL', 'National Level (MoA&FW)'),
        ('STATE', 'State Level Officer'),
        ('DISTRICT', 'District Level Officer'),
        ('BLOCK', 'Block Level Officer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='government_profile')
    
    employee_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=20, choices=DESIGNATION_CHOICES)
    department = models.CharField(max_length=200, default="Department of Agriculture & Farmers Welfare")
    
    # Jurisdiction
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    block = models.CharField(max_length=100, blank=True)
    
    # Permissions
    can_approve_fpo = models.BooleanField(default=True)
    can_approve_processor = models.BooleanField(default=True)
    can_approve_retailer = models.BooleanField(default=True)
    can_approve_logistics = models.BooleanField(default=True)
    can_view_analytics = models.BooleanField(default=True)
    can_export_reports = models.BooleanField(default=True)
    
    # Activity Tracking
    total_approvals = models.IntegerField(default=0)
    total_rejections = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'government_profiles'
        indexes = [
            models.Index(fields=['designation']),
            models.Index(fields=['state', 'district']),
        ]
    
    def __str__(self):
        location = self.state or "National"
        return f"{self.user.get_full_name()} - {self.get_designation_display()} ({location})"


    