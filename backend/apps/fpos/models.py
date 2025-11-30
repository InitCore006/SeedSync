from django.db import models
import uuid

class FPO(models.Model):
    """Farmer Producer Organization main entity"""
    
    LEGAL_STATUS_CHOICES = [
        ('producer_company', 'Producer Company (Section 581C)'),
        ('cooperative', 'Cooperative Society'),
        ('trust', 'Trust'),
        ('society', 'Society'),
    ]
    
    REGISTRATION_AUTHORITY_CHOICES = [
        ('roc', 'Registrar of Companies (RoC)'),
        ('cooperative_dept', 'Cooperative Department'),
        ('charity_commissioner', 'Charity Commissioner'),
        ('society_registrar', 'Society Registrar'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(max_length=200, unique=True)
    short_name = models.CharField(max_length=50, blank=True)
    fpo_id = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Registration Details
    legal_status = models.CharField(max_length=30, choices=LEGAL_STATUS_CHOICES)
    registration_number = models.CharField(max_length=50, unique=True)
    registration_authority = models.CharField(max_length=30, choices=REGISTRATION_AUTHORITY_CHOICES)
    registration_date = models.DateField()
    incorporation_date = models.DateField()
    
    # Contact Information
    registered_address = models.TextField()
    operational_address = models.TextField(blank=True)
    village = models.CharField(max_length=100)
    block = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    # GIS Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    operational_area = models.JSONField(null=True, blank=True)
    
    # Contact Details
    contact_person_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=10)
    contact_email = models.EmailField()
    website = models.URLField(blank=True)
    
    # Financial Details
    authorized_share_capital = models.DecimalField(max_digits=15, decimal_places=2)
    paid_up_share_capital = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    share_value_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Bank Account
    bank_name = models.CharField(max_length=100)
    branch_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    account_type = models.CharField(
        max_length=20,
        choices=[
            ('current', 'Current Account'),
            ('savings', 'Savings Account'),
        ],
        default='current'
    )
    
    # Compliance
    pan_number = models.CharField(max_length=10, unique=True)
    tan_number = models.CharField(max_length=10, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    fssai_license = models.CharField(max_length=14, blank=True)
    agmark_certification = models.BooleanField(default=False)
    
    # Governance - FIXED: nullable to avoid circular dependency during initial migration
    ceo = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,
        related_name='fpo_as_ceo',
        null=True,
        blank=True
    )
    chairman = models.ForeignKey(
        'users.User',
        on_delete=models.PROTECT,
        related_name='fpo_as_chairman',
        null=True,
        blank=True
    )
    
    # Membership Stats
    total_members = models.IntegerField(default=0)
    male_members = models.IntegerField(default=0)
    female_members = models.IntegerField(default=0)
    sc_st_members = models.IntegerField(default=0)
    
    # Operational Stats
    total_land_area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total member land in acres"
    )
    annual_turnover = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Annual turnover in INR"
    )
    
    # Government Support
    nabard_support = models.BooleanField(default=False)
    nabard_grant_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sfac_support = models.BooleanField(default=False)
    sfac_grant_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    health_score = models.IntegerField(default=0, help_text="FPO health score (0-100)")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpos'
        verbose_name = 'FPO'
        verbose_name_plural = 'FPOs'
        indexes = [
            models.Index(fields=['fpo_id']),
            models.Index(fields=['district', 'state']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.fpo_id})"
    
    def calculate_health_score(self):
        """Calculate FPO health score"""
        score = 0
        
        # Membership strength (30 points)
        if self.total_members > 500:
            score += 30
        elif self.total_members > 250:
            score += 20
        elif self.total_members > 100:
            score += 10
        
        # Financial health (30 points)
        if self.annual_turnover > 10000000:  # 1 Crore
            score += 30
        elif self.annual_turnover > 5000000:
            score += 20
        elif self.annual_turnover > 1000000:
            score += 10
        
        # Compliance (20 points)
        if self.pan_number and self.gst_number:
            score += 10
        if self.agmark_certification:
            score += 10
        
        # Government support (10 points)
        if self.nabard_support or self.sfac_support:
            score += 10
        
        # Active status (10 points)
        if self.is_active and self.is_verified:
            score += 10
        
        self.health_score = min(score, 100)
        self.save()
        return self.health_score


class FPOGovernance(models.Model):
    """Board members and governance structure"""
    
    POSITION_CHOICES = [
        ('chairman', 'Chairman'),
        ('vice_chairman', 'Vice Chairman'),
        ('director', 'Board Director'),
        ('ceo', 'Chief Executive Officer'),
        ('secretary', 'Secretary'),
        ('treasurer', 'Treasurer'),
    ]
    
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='board_members')
    member = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='board_positions')
    
    position = models.CharField(max_length=20, choices=POSITION_CHOICES)
    appointment_date = models.DateField()
    term_end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Remuneration
    monthly_remuneration = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Monthly remuneration in INR"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_governance'
        verbose_name = 'FPO Governance'
        verbose_name_plural = 'FPO Governance'
        unique_together = ['fpo', 'member', 'position']
    
    def __str__(self):
        return f"{self.member.full_name} - {self.get_position_display()} at {self.fpo.name}"


class FPOShare(models.Model):
    """Share capital and equity management"""
    
    TRANSACTION_TYPE_CHOICES = [
        ('issue', 'Share Issued'),
        ('transfer', 'Share Transferred'),
        ('buyback', 'Share Buyback'),
        ('forfeiture', 'Share Forfeiture'),
    ]
    
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='share_transactions')
    member = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='fpo_shares')
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_date = models.DateField()
    
    shares_count = models.IntegerField()
    share_value_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Payment Details
    payment_mode = models.CharField(
        max_length=20,
        choices=[
            ('cash', 'Cash'),
            ('cheque', 'Cheque'),
            ('online', 'Online Transfer'),
            ('upi', 'UPI'),
        ],
        default='online'
    )
    payment_reference = models.CharField(max_length=100, blank=True)
    
    # Transfer Details (if applicable)
    transferred_from = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='share_transfers_from'
    )
    
    # Certificate
    certificate_number = models.CharField(max_length=50, unique=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_shares'
        verbose_name = 'FPO Share'
        verbose_name_plural = 'FPO Shares'
    
    def __str__(self):
        return f"{self.member.full_name} - {self.shares_count} shares in {self.fpo.name}"


class FPOMeeting(models.Model):
    """AGM and Board meetings"""
    
    MEETING_TYPE_CHOICES = [
        ('agm', 'Annual General Meeting'),
        ('egm', 'Extraordinary General Meeting'),
        ('board', 'Board Meeting'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='meetings')
    
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPE_CHOICES)
    meeting_date = models.DateField()
    meeting_time = models.TimeField()
    venue = models.TextField()
    
    # Agenda
    agenda = models.TextField()
    minutes = models.TextField(blank=True)
    
    # Attendance
    total_attendees = models.IntegerField(default=0)
    quorum_met = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_meetings'
        verbose_name = 'FPO Meeting'
        verbose_name_plural = 'FPO Meetings'
    
    def __str__(self):
        return f"{self.fpo.name} - {self.get_meeting_type_display()} on {self.meeting_date}"


class FPOPerformance(models.Model):
    """FPO performance metrics and KPIs"""
    
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='performance_records')
    
    # Period
    financial_year = models.CharField(max_length=10, help_text="e.g., 2023-24")
    quarter = models.IntegerField(
        choices=[
            (1, 'Q1 (Apr-Jun)'),
            (2, 'Q2 (Jul-Sep)'),
            (3, 'Q3 (Oct-Dec)'),
            (4, 'Q4 (Jan-Mar)'),
        ],
        null=True,
        blank=True
    )
    
    # Financial Metrics
    revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    dividend_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Operational Metrics
    total_procurement = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total procurement in quintals"
    )
    total_sales = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total sales in quintals"
    )
    average_price_realization = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Average price per quintal"
    )
    
    # Member Benefit
    members_benefited = models.IntegerField(default=0)
    average_member_earning = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    price_premium_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Premium over market price (%)"
    )
    
    # Value Addition
    processing_done = models.BooleanField(default=False)
    value_added_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_performance'
        verbose_name = 'FPO Performance'
        verbose_name_plural = 'FPO Performance'
        unique_together = ['fpo', 'financial_year', 'quarter']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.financial_year}"


class FPOProduction(models.Model):
    """FPO-level aggregated production data"""
    
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='production_records')
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    
    # Season & Year
    season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
        ]
    )
    year = models.IntegerField()
    
    # Production Data
    total_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total area under cultivation in acres"
    )
    total_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total production in quintals"
    )
    average_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Average yield per acre"
    )
    
    # Member Participation
    participating_members = models.IntegerField()
    
    # Quality
    average_quality_grade = models.CharField(
        max_length=10,
        choices=[
            ('A', 'Grade A'),
            ('B', 'Grade B'),
            ('C', 'Grade C'),
        ],
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_production'
        verbose_name = 'FPO Production'
        verbose_name_plural = 'FPO Production'
        unique_together = ['fpo', 'crop', 'season', 'year']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.crop.name} - {self.season} {self.year}"