from django.db import models
import uuid

class Certificate(models.Model):
    """Quality certifications and licenses"""
    
    CERTIFICATE_TYPE_CHOICES = [
        ('fssai', 'FSSAI License'),
        ('agmark', 'Agmark Certification'),
        ('organic', 'Organic Certification'),
        ('fair_trade', 'Fair Trade Certification'),
        ('gmp', 'GMP Certification'),
        ('haccp', 'HACCP Certification'),
        ('iso', 'ISO Certification'),
        ('brc', 'BRC Certification'),
        ('halal', 'Halal Certification'),
        ('kosher', 'Kosher Certification'),
        ('rainforest', 'Rainforest Alliance'),
        ('global_gap', 'GlobalGAP'),
        ('wdra', 'WDRA Registration'),
        ('apeda', 'APEDA Registration'),
        ('spice_board', 'Spice Board Certification'),
        ('tea_board', 'Tea Board Certification'),
    ]
    
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('inspection_scheduled', 'Inspection Scheduled'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('revoked', 'Revoked'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Certificate Details
    certificate_type = models.CharField(max_length=30, choices=CERTIFICATE_TYPE_CHOICES)
    certificate_number = models.CharField(max_length=100, unique=True, db_index=True)
    certificate_name = models.CharField(max_length=200)
    
    # Holder
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='certificates'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='certificates'
    )
    warehouse = models.ForeignKey(
        'warehouses.Warehouse',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='certificates'
    )
    
    # Issuing Authority
    issuing_authority = models.CharField(max_length=200)
    issuing_office = models.CharField(max_length=200, blank=True)
    inspector_name = models.CharField(max_length=200, blank=True)
    
    # Dates
    application_date = models.DateField()
    inspection_date = models.DateField(null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField()
    renewal_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    
    # Documents
    application_form = models.FileField(
        upload_to='certificates/applications/',
        null=True,
        blank=True
    )
    certificate_document = models.FileField(
        upload_to='certificates/documents/',
        null=True,
        blank=True
    )
    inspection_report = models.FileField(
        upload_to='certificates/inspections/',
        null=True,
        blank=True
    )
    
    # Scope
    scope_of_certification = models.TextField(
        help_text="Products/processes covered"
    )
    certified_products = models.JSONField(
        default=list,
        help_text="List of certified products"
    )
    
    # Compliance Requirements
    compliance_requirements = models.JSONField(
        default=list,
        help_text="List of compliance requirements"
    )
    
    # Fees
    application_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    annual_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    inspection_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_fee_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Renewal
    is_renewable = models.BooleanField(default=True)
    renewal_reminder_sent = models.BooleanField(default=False)
    days_before_expiry_to_remind = models.IntegerField(default=60)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_url = models.URLField(
        blank=True,
        help_text="URL to verify certificate online"
    )
    
    # Notes
    notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'certificates'
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['certificate_number']),
            models.Index(fields=['status']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        holder = self.fpo.name if self.fpo else (self.farmer.user.full_name if self.farmer else 'N/A')
        return f"{self.get_certificate_type_display()} - {holder}"


class AuditLog(models.Model):
    """System-wide audit trail"""
    
    ACTION_TYPE_CHOICES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('payment', 'Payment'),
        ('export', 'Export Data'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Action Details
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES)
    action_description = models.TextField()
    
    # User
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    user_role = models.CharField(max_length=50)
    
    # Target Object
    object_type = models.CharField(max_length=100, help_text="Model name")
    object_id = models.CharField(max_length=100)
    object_representation = models.CharField(max_length=500)
    
    # Changes
    old_values = models.JSONField(
        default=dict,
        blank=True,
        help_text="Previous values before change"
    )
    new_values = models.JSONField(
        default=dict,
        blank=True,
        help_text="New values after change"
    )
    
    # Request Details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    request_method = models.CharField(max_length=10)
    request_path = models.CharField(max_length=500)
    
    # Session
    session_key = models.CharField(max_length=100, blank=True)
    
    # Additional Context
    additional_data = models.JSONField(default=dict, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['object_type', 'object_id']),
            models.Index(fields=['action_type']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name if self.user else 'System'} - {self.action_type} - {self.object_type}"


class ComplianceRecord(models.Model):
    """General compliance tracking"""
    
    COMPLIANCE_TYPE_CHOICES = [
        ('legal', 'Legal Compliance'),
        ('tax', 'Tax Compliance'),
        ('labor', 'Labor Law Compliance'),
        ('environmental', 'Environmental Compliance'),
        ('quality', 'Quality Standards'),
        ('food_safety', 'Food Safety'),
        ('data_privacy', 'Data Privacy'),
        ('financial', 'Financial Reporting'),
    ]
    
    STATUS_CHOICES = [
        ('compliant', 'Compliant'),
        ('non_compliant', 'Non-Compliant'),
        ('under_review', 'Under Review'),
        ('action_required', 'Action Required'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Compliance Details
    compliance_type = models.CharField(max_length=30, choices=COMPLIANCE_TYPE_CHOICES)
    compliance_area = models.CharField(max_length=200)
    requirement = models.TextField()
    
    # Applicable To
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='compliance_records'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Assessment
    assessment_date = models.DateField()
    assessed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Findings
    findings = models.TextField()
    gaps_identified = models.JSONField(default=list)
    
    # Action Plan
    corrective_actions = models.TextField(blank=True)
    action_deadline = models.DateField(null=True, blank=True)
    action_completed = models.BooleanField(default=False)
    action_completed_date = models.DateField(null=True, blank=True)
    
    # Documents
    assessment_report = models.FileField(
        upload_to='compliance/assessments/',
        null=True,
        blank=True
    )
    evidence_documents = models.JSONField(
        default=list,
        help_text="List of evidence document URLs"
    )
    
    # Follow-up
    next_review_date = models.DateField()
    review_frequency = models.CharField(
        max_length=20,
        choices=[
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('half_yearly', 'Half-Yearly'),
            ('annual', 'Annual'),
        ]
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'compliance_records'
        verbose_name = 'Compliance Record'
        verbose_name_plural = 'Compliance Records'
        ordering = ['-assessment_date']
    
    def __str__(self):
        return f"{self.get_compliance_type_display()} - {self.status}"


class FPOCompliance(models.Model):
    """FPO-specific compliance dashboard"""
    
    fpo = models.OneToOneField(
        'fpos.FPO',
        on_delete=models.CASCADE,
        related_name='compliance_dashboard'
    )
    
    # Legal Compliance
    moa_filed = models.BooleanField(default=False, verbose_name="MOA Filed")
    aoa_filed = models.BooleanField(default=False, verbose_name="AOA Filed")
    pan_obtained = models.BooleanField(default=False)
    tan_obtained = models.BooleanField(default=False)
    gst_registered = models.BooleanField(default=False)
    
    # Annual Compliance
    last_agm_date = models.DateField(null=True, blank=True)
    next_agm_due_date = models.DateField(null=True, blank=True)
    agm_compliant = models.BooleanField(default=True)
    
    last_audit_date = models.DateField(null=True, blank=True)
    next_audit_due_date = models.DateField(null=True, blank=True)
    audit_compliant = models.BooleanField(default=True)
    auditor_name = models.CharField(max_length=200, blank=True)
    
    annual_return_filed = models.BooleanField(default=False)
    last_annual_return_fy = models.CharField(max_length=10, blank=True)
    
    # Board Meetings
    minimum_board_meetings_per_year = models.IntegerField(default=4)
    board_meetings_held_this_year = models.IntegerField(default=0)
    board_meeting_compliant = models.BooleanField(default=True)
    
    # Financial Compliance
    books_of_accounts_maintained = models.BooleanField(default=True)
    tax_returns_filed = models.BooleanField(default=False)
    gst_returns_filed = models.BooleanField(default=False)
    tds_returns_filed = models.BooleanField(default=False)
    
    # Licenses
    fssai_license_valid = models.BooleanField(default=False)
    fssai_expiry_date = models.DateField(null=True, blank=True)
    
    wdra_registration_valid = models.BooleanField(default=False)
    wdra_expiry_date = models.DateField(null=True, blank=True)
    
    # Labor Compliance
    pf_registration_done = models.BooleanField(default=False)
    esic_registration_done = models.BooleanField(default=False)
    labor_laws_compliant = models.BooleanField(default=True)
    
    # Overall Score
    compliance_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Overall compliance score 0-100"
    )
    compliance_grade = models.CharField(
        max_length=10,
        choices=[
            ('A', 'Excellent (90-100)'),
            ('B', 'Good (75-89)'),
            ('C', 'Average (60-74)'),
            ('D', 'Poor (<60)'),
        ],
        blank=True
    )
    
    # Pending Actions
    pending_compliances = models.JSONField(
        default=list,
        help_text="List of pending compliance items"
    )
    
    # Alerts
    compliance_alerts = models.JSONField(
        default=list,
        help_text="List of upcoming deadlines and alerts"
    )
    
    # Last Assessment
    last_assessment_date = models.DateField(null=True, blank=True)
    last_assessed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_compliance'
        verbose_name = 'FPO Compliance'
        verbose_name_plural = 'FPO Compliance'
    
    def __str__(self):
        return f"{self.fpo.name} - Grade {self.compliance_grade}"


class RegulatoryUpdate(models.Model):
    """Track regulatory changes and updates"""
    
    UPDATE_TYPE_CHOICES = [
        ('law', 'New Law/Act'),
        ('amendment', 'Amendment'),
        ('rule', 'New Rule'),
        ('notification', 'Government Notification'),
        ('circular', 'Circular'),
        ('guideline', 'Guideline'),
    ]
    
    IMPACT_LEVEL_CHOICES = [
        ('high', 'High Impact'),
        ('medium', 'Medium Impact'),
        ('low', 'Low Impact'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Update Details
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    description = models.TextField()
    
    # Issuing Authority
    issuing_authority = models.CharField(max_length=200)
    notification_number = models.CharField(max_length=100, blank=True)
    
    # Dates
    issue_date = models.DateField()
    effective_date = models.DateField()
    compliance_deadline = models.DateField(null=True, blank=True)
    
    # Impact
    impact_level = models.CharField(max_length=20, choices=IMPACT_LEVEL_CHOICES)
    affected_areas = models.JSONField(
        default=list,
        help_text="List of affected compliance areas"
    )
    
    # Action Required
    action_required = models.TextField()
    
    # Documents
    official_document = models.FileField(
        upload_to='regulatory_updates/',
        null=True,
        blank=True
    )
    summary_document = models.FileField(
        upload_to='regulatory_updates/summaries/',
        null=True,
        blank=True
    )
    
    # Notification to FPOs
    notification_sent = models.BooleanField(default=False)
    notification_sent_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'regulatory_updates'
        verbose_name = 'Regulatory Update'
        verbose_name_plural = 'Regulatory Updates'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"{self.title} - {self.issue_date}"