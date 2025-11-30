from django.db import models
import uuid

class LoanScheme(models.Model):
    """Loan schemes available for farmers and FPOs"""
    
    TARGET_CHOICES = [
        ('farmer', 'Individual Farmer'),
        ('fpo', 'FPO'),
        ('both', 'Both'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Scheme Details
    scheme_name = models.CharField(max_length=200)
    scheme_code = models.CharField(max_length=20, unique=True)
    
    # Provider
    provider_name = models.CharField(
        max_length=200,
        help_text="Bank/NBFC/Financial Institution"
    )
    provider_type = models.CharField(
        max_length=20,
        choices=[
            ('bank', 'Commercial Bank'),
            ('rrrb', 'Regional Rural Bank'),
            ('cooperative', 'Cooperative Bank'),
            ('nbfc', 'NBFC'),
            ('nabard', 'NABARD'),
        ]
    )
    
    # Target
    target_beneficiary = models.CharField(max_length=10, choices=TARGET_CHOICES)
    
    # Loan Purpose
    purpose = models.CharField(
        max_length=50,
        choices=[
            ('crop_loan', 'Crop Loan'),
            ('kcc', 'Kisan Credit Card'),
            ('term_loan', 'Term Loan'),
            ('working_capital', 'Working Capital'),
            ('machinery', 'Machinery Purchase'),
            ('warehouse', 'Warehouse Construction'),
            ('processing_unit', 'Processing Unit'),
            ('vehicle', 'Vehicle Purchase'),
            ('general', 'General Purpose'),
        ]
    )
    
    # Loan Amount
    min_loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Interest Rate
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual interest rate %"
    )
    subsidized = models.BooleanField(default=False)
    subsidized_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Tenure
    min_tenure_months = models.IntegerField()
    max_tenure_months = models.IntegerField()
    
    # Eligibility
    eligibility_criteria = models.TextField()
    required_documents = models.JSONField(default=list)
    
    # Security
    collateral_required = models.BooleanField(default=True)
    collateral_details = models.TextField(blank=True)
    
    # Government Support
    government_subsidized = models.BooleanField(default=False)
    subsidy_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Processing
    processing_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    processing_time_days = models.IntegerField(default=15)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loan_schemes'
        verbose_name = 'Loan Scheme'
        verbose_name_plural = 'Loan Schemes'
    
    def __str__(self):
        return f"{self.scheme_name} ({self.provider_name})"


class LoanApplication(models.Model):
    """Loan application tracking"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('documents_pending', 'Documents Pending'),
        ('field_verification', 'Field Verification'),
        ('approved', 'Approved'),
        ('disbursed', 'Disbursed'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Application Details
    application_number = models.CharField(max_length=50, unique=True, db_index=True)
    loan_scheme = models.ForeignKey('LoanScheme', on_delete=models.PROTECT)
    
    # Applicant
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loan_applications'
    )
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loan_applications'
    )
    
    # Loan Details
    loan_amount_requested = models.DecimalField(max_digits=12, decimal_places=2)
    loan_purpose = models.TextField()
    tenure_months = models.IntegerField()
    
    # Repayment
    repayment_mode = models.CharField(
        max_length=20,
        choices=[
            ('emi', 'EMI'),
            ('bullet', 'Bullet Payment'),
            ('seasonal', 'Seasonal'),
        ],
        default='emi'
    )
    
    # Financial Details
    annual_income = models.DecimalField(max_digits=12, decimal_places=2)
    existing_loans = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    monthly_expenses = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Collateral
    collateral_offered = models.TextField(blank=True)
    collateral_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Documents
    documents_uploaded = models.JSONField(
        default=dict,
        help_text="Document name: file URL mapping"
    )
    
    # Application Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    
    # Credit Score
    credit_score = models.IntegerField(null=True, blank=True)
    credit_assessment = models.TextField(blank=True)
    
    # Approval Details
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    approved_tenure = models.IntegerField(null=True, blank=True)
    approved_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    approved_by = models.CharField(max_length=200, blank=True)
    approved_date = models.DateField(null=True, blank=True)
    
    # Rejection
    rejection_reason = models.TextField(blank=True)
    
    # Disbursement
    disbursement_date = models.DateField(null=True, blank=True)
    disbursement_mode = models.CharField(
        max_length=20,
        choices=[
            ('bank_transfer', 'Bank Transfer'),
            ('cheque', 'Cheque'),
        ],
        blank=True
    )
    disbursement_reference = models.CharField(max_length=100, blank=True)
    
    # Linked Loan Account
    loan_account = models.OneToOneField(
        'LoanAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='application'
    )
    
    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loan_applications'
        verbose_name = 'Loan Application'
        verbose_name_plural = 'Loan Applications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.application_number} - {self.status}"


class LoanAccount(models.Model):
    """Active loan account management"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('overdue', 'Overdue'),
        ('npa', 'NPA'),
        ('closed', 'Closed'),
        ('written_off', 'Written Off'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Account Details
    loan_account_number = models.CharField(max_length=50, unique=True, db_index=True)
    loan_scheme = models.ForeignKey('LoanScheme', on_delete=models.PROTECT)
    
    # Borrower
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loan_accounts'
    )
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loan_accounts'
    )
    
    # Loan Terms
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tenure_months = models.IntegerField()
    emi_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Outstanding
    outstanding_principal = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_interest = models.DecimalField(max_digits=12, decimal_places=2)
    total_outstanding = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Payment Details
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_payment_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField()
    
    # Overdue
    overdue_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    days_overdue = models.IntegerField(default=0)
    penalty_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Timeline
    disbursement_date = models.DateField()
    maturity_date = models.DateField()
    actual_closure_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Performance
    total_emis = models.IntegerField()
    emis_paid = models.IntegerField(default=0)
    emis_overdue = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loan_accounts'
        verbose_name = 'Loan Account'
        verbose_name_plural = 'Loan Accounts'
        indexes = [
            models.Index(fields=['loan_account_number']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.loan_account_number} - {self.status}"


class LoanRepayment(models.Model):
    """Loan repayment transactions"""
    
    loan_account = models.ForeignKey(
        'LoanAccount',
        on_delete=models.CASCADE,
        related_name='repayments'
    )
    
    # Payment Details
    payment_date = models.DateField()
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Breakdown
    principal_paid = models.DecimalField(max_digits=12, decimal_places=2)
    interest_paid = models.DecimalField(max_digits=12, decimal_places=2)
    penalty_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Payment Method
    payment_mode = models.CharField(
        max_length=20,
        choices=[
            ('auto_debit', 'Auto Debit'),
            ('online', 'Online Transfer'),
            ('cash', 'Cash'),
            ('cheque', 'Cheque'),
        ]
    )
    transaction_reference = models.CharField(max_length=100)
    
    # EMI Number
    emi_number = models.IntegerField(help_text="EMI number (1, 2, 3...)")
    
    # Status
    is_on_time = models.BooleanField(default=True)
    days_late = models.IntegerField(default=0)
    
    # Receipt
    payment_receipt = models.FileField(upload_to='loan_receipts/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'loan_repayments'
        verbose_name = 'Loan Repayment'
        verbose_name_plural = 'Loan Repayments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"{self.loan_account.loan_account_number} - EMI {self.emi_number}"


class Insurance(models.Model):
    """Insurance policies (PMFBY, etc.)"""
    
    INSURANCE_TYPE_CHOICES = [
        ('pmfby', 'Pradhan Mantri Fasal Bima Yojana'),
        ('crop_insurance', 'Crop Insurance'),
        ('livestock_insurance', 'Livestock Insurance'),
        ('life_insurance', 'Life Insurance'),
        ('health_insurance', 'Health Insurance'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('claimed', 'Claimed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Policy Details
    policy_number = models.CharField(max_length=50, unique=True, db_index=True)
    insurance_type = models.CharField(max_length=30, choices=INSURANCE_TYPE_CHOICES)
    insurance_company = models.CharField(max_length=200)
    
    # Insured
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        related_name='insurance_policies'
    )
    
    # Coverage
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    farm_plot = models.ForeignKey(
        'farmers.FarmPlot',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    season = models.CharField(max_length=10, blank=True)
    year = models.IntegerField()
    
    # Area & Sum Insured
    insured_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Insured area in acres"
    )
    sum_insured = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Sum insured in INR"
    )
    
    # Premium
    total_premium = models.DecimalField(max_digits=10, decimal_places=2)
    farmer_share = models.DecimalField(max_digits=10, decimal_places=2)
    government_subsidy = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Period
    policy_start_date = models.DateField()
    policy_end_date = models.DateField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Claim
    claim_filed = models.BooleanField(default=False)
    claim_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    claim_status = models.CharField(max_length=20, blank=True)
    
    # Documents
    policy_document = models.FileField(upload_to='insurance_policies/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'insurance_policies'
        verbose_name = 'Insurance Policy'
        verbose_name_plural = 'Insurance Policies'
        ordering = ['-policy_start_date']
    
    def __str__(self):
        return f"{self.policy_number} - {self.get_insurance_type_display()}"


class Subsidy(models.Model):
    """Government subsidies and benefits"""
    
    SUBSIDY_TYPE_CHOICES = [
        ('pm_kisan', 'PM-KISAN'),
        ('input_subsidy', 'Input Subsidy (Seeds/Fertilizer)'),
        ('drip_irrigation', 'Drip Irrigation Subsidy'),
        ('sprinkler', 'Sprinkler System Subsidy'),
        ('farm_mechanization', 'Farm Mechanization'),
        ('storage_subsidy', 'Storage Infrastructure'),
        ('processing_unit', 'Processing Unit Setup'),
        ('fpo_support', 'FPO Formation Support'),
        ('pmfby', 'PMFBY Insurance Premium'),
        ('kisan_credit_card', 'Kisan Credit Card Interest Subvention'),
        ('solar_pump', 'Solar Pump Subsidy'),
        ('organic_farming', 'Organic Farming Support'),
        ('msp_bonus', 'MSP Bonus Payment'),
        ('other', 'Other Subsidy'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Application Draft'),
        ('submitted', 'Application Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('disbursed', 'Disbursed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    IMPLEMENTING_AGENCY_CHOICES = [
        ('agriculture_dept', 'State Agriculture Department'),
        ('horticulture_dept', 'Horticulture Department'),
        ('nabard', 'NABARD'),
        ('sfac', 'SFAC'),
        ('ncdex', 'NCDEX e-Markets'),
        ('district_administration', 'District Administration'),
        ('central_govt', 'Central Government'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Application Details
    application_number = models.CharField(max_length=50, unique=True, db_index=True)
    subsidy_type = models.CharField(max_length=30, choices=SUBSIDY_TYPE_CHOICES)
    scheme_name = models.CharField(max_length=200)
    scheme_code = models.CharField(max_length=50, blank=True)
    
    # Implementing Agency
    implementing_agency = models.CharField(max_length=30, choices=IMPLEMENTING_AGENCY_CHOICES)
    nodal_officer_name = models.CharField(max_length=200, blank=True)
    nodal_officer_contact = models.CharField(max_length=10, blank=True)
    
    # Beneficiary (Either Farmer OR FPO)
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subsidies'
    )
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subsidies'
    )
    
    # Financial Details
    total_project_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Total project/investment cost in INR"
    )
    subsidy_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Subsidy percentage as per scheme"
    )
    subsidy_amount_applied = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Subsidy amount applied for"
    )
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Approved subsidy amount"
    )
    disbursed_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Amount actually disbursed"
    )
    beneficiary_contribution = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Beneficiary's own contribution"
    )
    
    # Application Timeline
    application_date = models.DateField()
    submission_date = models.DateField(null=True, blank=True)
    approval_date = models.DateField(null=True, blank=True)
    disbursement_date = models.DateField(null=True, blank=True)
    
    # Financial Year
    financial_year = models.CharField(max_length=10, help_text="e.g., 2023-24")
    
    # Bank Account for Disbursement
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    account_holder_name = models.CharField(max_length=200)
    
    # Documents Required
    application_form = models.FileField(upload_to='subsidies/applications/', null=True, blank=True)
    project_report = models.FileField(upload_to='subsidies/reports/', null=True, blank=True)
    quotations = models.FileField(upload_to='subsidies/quotations/', null=True, blank=True)
    land_documents = models.FileField(upload_to='subsidies/land_docs/', null=True, blank=True)
    caste_certificate = models.FileField(upload_to='subsidies/caste_certs/', null=True, blank=True)
    income_certificate = models.FileField(upload_to='subsidies/income_certs/', null=True, blank=True)
    bank_passbook = models.FileField(upload_to='subsidies/bank_docs/', null=True, blank=True)
    
    # Additional Documents
    other_documents = models.JSONField(
        default=list,
        help_text="List of additional document URLs"
    )
    
    # Status & Approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    approval_remarks = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Verification
    field_verification_done = models.BooleanField(default=False)
    verification_date = models.DateField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_subsidies'
    )
    verification_report = models.FileField(
        upload_to='subsidies/verification_reports/',
        null=True,
        blank=True
    )
    
    # Disbursement Details
    disbursement_mode = models.CharField(
        max_length=20,
        choices=[
            ('dbt', 'Direct Benefit Transfer (DBT)'),
            ('neft', 'NEFT'),
            ('rtgs', 'RTGS'),
            ('cheque', 'Cheque'),
        ],
        blank=True
    )
    transaction_reference = models.CharField(max_length=100, blank=True)
    disbursement_receipt = models.FileField(
        upload_to='subsidies/receipts/',
        null=True,
        blank=True
    )
    
    # Installment Details (for multi-stage subsidies)
    is_installment_based = models.BooleanField(default=False)
    total_installments = models.IntegerField(default=1)
    installments_disbursed = models.IntegerField(default=0)
    
    # Utilization Certificate
    utilization_certificate_required = models.BooleanField(default=True)
    utilization_certificate_submitted = models.BooleanField(default=False)
    utilization_certificate = models.FileField(
        upload_to='subsidies/utilization_certs/',
        null=True,
        blank=True
    )
    
    # Performance Monitoring
    subsidy_utilized = models.BooleanField(default=False)
    utilization_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    impact_assessment_done = models.BooleanField(default=False)
    impact_report = models.TextField(blank=True)
    
    # Geographic Details
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    block = models.CharField(max_length=100, blank=True)
    
    # Notes
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subsidies'
        verbose_name = 'Subsidy'
        verbose_name_plural = 'Subsidies'
        ordering = ['-application_date']
        indexes = [
            models.Index(fields=['application_number']),
            models.Index(fields=['status']),
            models.Index(fields=['subsidy_type']),
            models.Index(fields=['financial_year']),
        ]
    
    def __str__(self):
        beneficiary = self.farmer.user.full_name if self.farmer else self.fpo.name
        return f"{self.application_number} - {beneficiary}"
    
    def calculate_pending_amount(self):
        """Calculate pending subsidy amount"""
        if self.approved_amount:
            return self.approved_amount - self.disbursed_amount
        return 0


class FPOLoan(models.Model):
    """Loans taken by FPO for working capital and infrastructure"""
    
    LOAN_TYPE_CHOICES = [
        ('working_capital', 'Working Capital Loan'),
        ('term_loan', 'Term Loan'),
        ('crop_loan', 'Crop Loan'),
        ('machinery_loan', 'Machinery Purchase Loan'),
        ('infrastructure_loan', 'Infrastructure Development'),
        ('warehouse_loan', 'Warehouse Construction'),
        ('vehicle_loan', 'Vehicle Purchase'),
        ('processing_unit_loan', 'Processing Unit Setup'),
        ('bridge_loan', 'Bridge Loan'),
        ('overdraft', 'Cash Credit/Overdraft'),
    ]
    
    STATUS_CHOICES = [
        ('applied', 'Application Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('sanctioned', 'Sanctioned'),
        ('disbursed', 'Disbursed'),
        ('active', 'Active/Ongoing'),
        ('closed', 'Closed/Repaid'),
        ('overdue', 'Overdue'),
        ('npa', 'Non-Performing Asset'),
        ('rejected', 'Rejected'),
    ]
    
    LENDING_INSTITUTION_CHOICES = [
        ('nationalized_bank', 'Nationalized Bank'),
        ('cooperative_bank', 'Cooperative Bank'),
        ('regional_rural_bank', 'Regional Rural Bank (RRB)'),
        ('nabard', 'NABARD'),
        ('sfac', 'SFAC'),
        ('private_bank', 'Private Bank'),
        ('nbfc', 'NBFC'),
        ('microfinance', 'Microfinance Institution'),
    ]
    
    COLLATERAL_TYPE_CHOICES = [
        ('land', 'Land Mortgage'),
        ('warehouse_receipt', 'Warehouse Receipt'),
        ('crop_hypothecation', 'Crop Hypothecation'),
        ('machinery', 'Machinery Hypothecation'),
        ('guarantee', 'Personal Guarantee'),
        ('cgtmse', 'CGTMSE Guarantee'),
        ('no_collateral', 'No Collateral'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Loan Identification
    loan_account_number = models.CharField(max_length=50, unique=True, db_index=True)
    loan_application_number = models.CharField(max_length=50, unique=True)
    
    # Borrower
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='loans')
    
    # Loan Details
    loan_type = models.CharField(max_length=30, choices=LOAN_TYPE_CHOICES)
    loan_purpose = models.TextField(help_text="Detailed purpose of loan")
    
    # Financial Institution
    lending_institution = models.CharField(max_length=30, choices=LENDING_INSTITUTION_CHOICES)
    bank_name = models.CharField(max_length=200)
    branch_name = models.CharField(max_length=200)
    branch_ifsc = models.CharField(max_length=11)
    loan_officer_name = models.CharField(max_length=200)
    loan_officer_contact = models.CharField(max_length=10)
    
    # Loan Amount
    loan_amount_applied = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Loan amount applied for in INR"
    )
    loan_amount_sanctioned = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Sanctioned loan amount"
    )
    loan_amount_disbursed = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Amount actually disbursed"
    )
    
    # Interest Rate
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual interest rate %"
    )
    interest_type = models.CharField(
        max_length=20,
        choices=[
            ('fixed', 'Fixed Rate'),
            ('floating', 'Floating Rate'),
            ('subsidized', 'Subsidized Rate'),
        ],
        default='floating'
    )
    interest_subsidy_applicable = models.BooleanField(default=False)
    subsidized_interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Effective interest rate after subsidy"
    )
    
    # Repayment Terms
    tenure_months = models.IntegerField(help_text="Loan tenure in months")
    moratorium_period_months = models.IntegerField(
        default=0,
        help_text="Moratorium period before repayment starts"
    )
    repayment_frequency = models.CharField(
        max_length=20,
        choices=[
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('half_yearly', 'Half-Yearly'),
            ('yearly', 'Yearly'),
            ('bullet', 'Bullet Payment'),
        ],
        default='monthly'
    )
    emi_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="EMI amount if applicable"
    )
    
    # Important Dates
    application_date = models.DateField()
    sanction_date = models.DateField(null=True, blank=True)
    disbursement_date = models.DateField(null=True, blank=True)
    first_repayment_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    
    # Collateral & Security
    collateral_type = models.CharField(max_length=30, choices=COLLATERAL_TYPE_CHOICES)
    collateral_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    collateral_details = models.TextField(blank=True)
    guarantee_details = models.TextField(blank=True)
    
    # Insurance
    loan_insurance_applicable = models.BooleanField(default=False)
    insurance_policy_number = models.CharField(max_length=50, blank=True)
    insurance_premium = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Disbursement Details
    disbursement_mode = models.CharField(
        max_length=20,
        choices=[
            ('lump_sum', 'Lump Sum'),
            ('installments', 'Installments'),
        ],
        default='lump_sum'
    )
    number_of_disbursements = models.IntegerField(default=1)
    disbursements_completed = models.IntegerField(default=0)
    
    # Repayment Tracking
    total_amount_repaid = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    principal_repaid = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    interest_repaid = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    outstanding_principal = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    outstanding_interest = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Overdue Details
    overdue_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    days_past_due = models.IntegerField(default=0)
    penalty_charges = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    rejection_reason = models.TextField(blank=True)
    
    # Credit Score Impact
    credit_score_at_application = models.IntegerField(null=True, blank=True)
    current_credit_score = models.IntegerField(null=True, blank=True)
    
    # Documents
    loan_application_form = models.FileField(
        upload_to='loans/applications/',
        null=True,
        blank=True
    )
    project_report = models.FileField(upload_to='loans/reports/', null=True, blank=True)
    financial_statements = models.FileField(
        upload_to='loans/financials/',
        null=True,
        blank=True
    )
    sanction_letter = models.FileField(
        upload_to='loans/sanction_letters/',
        null=True,
        blank=True
    )
    loan_agreement = models.FileField(
        upload_to='loans/agreements/',
        null=True,
        blank=True
    )
    
    # Utilization
    utilization_certificate_submitted = models.BooleanField(default=False)
    utilization_certificate = models.FileField(
        upload_to='loans/utilization_certs/',
        null=True,
        blank=True
    )
    
    # Performance
    repayment_performance_score = models.IntegerField(
        default=100,
        help_text="Performance score 0-100"
    )
    
    # Remarks
    bank_remarks = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_loans'
        verbose_name = 'FPO Loan'
        verbose_name_plural = 'FPO Loans'
        ordering = ['-application_date']
        indexes = [
            models.Index(fields=['loan_account_number']),
            models.Index(fields=['status']),
            models.Index(fields=['maturity_date']),
        ]
    
    def __str__(self):
        return f"{self.loan_account_number} - {self.fpo.name}"
    
    def calculate_outstanding_balance(self):
        """Calculate total outstanding balance"""
        return self.outstanding_principal + self.outstanding_interest + self.penalty_charges
    
    def is_overdue(self):
        """Check if loan has overdue payments"""
        return self.days_past_due > 0 or self.overdue_amount > 0


class DividendDistribution(models.Model):
    """Dividend distribution to FPO members"""
    
    DISTRIBUTION_TYPE_CHOICES = [
        ('annual', 'Annual Dividend'),
        ('interim', 'Interim Dividend'),
        ('bonus', 'Bonus Share'),
        ('patronage', 'Patronage Refund'),
    ]
    
    STATUS_CHOICES = [
        ('declared', 'Declared'),
        ('approved', 'Approved by Board'),
        ('processing', 'Processing'),
        ('disbursed', 'Disbursed'),
        ('partially_disbursed', 'Partially Disbursed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_MODE_CHOICES = [
        ('bank_transfer', 'Bank Transfer (NEFT/RTGS)'),
        ('upi', 'UPI'),
        ('cheque', 'Cheque'),
        ('cash', 'Cash'),
        ('reinvestment', 'Reinvested in Shares'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Distribution Details
    distribution_number = models.CharField(max_length=50, unique=True, db_index=True)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='dividend_distributions')
    
    # Type & Period
    distribution_type = models.CharField(max_length=20, choices=DISTRIBUTION_TYPE_CHOICES)
    financial_year = models.CharField(max_length=10, help_text="e.g., 2023-24")
    
    # Financial Details
    net_profit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Net profit for the period in INR"
    )
    distributable_profit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Profit available for distribution after reserves"
    )
    
    # Allocation
    allocated_to_reserve = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Amount allocated to reserves as per rules"
    )
    allocated_to_operations = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Amount retained for operations"
    )
    allocated_to_dividend = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total amount for dividend distribution"
    )
    
    # Dividend Rate
    dividend_rate_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Dividend rate as % of share capital"
    )
    dividend_per_share = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Dividend amount per share in INR"
    )
    
    # Patronage Basis (for patronage refund)
    patronage_basis = models.CharField(
        max_length=30,
        choices=[
            ('share_capital', 'Based on Share Capital'),
            ('transaction_volume', 'Based on Transaction Volume'),
            ('production_supplied', 'Based on Production Supplied'),
            ('combined', 'Combined Method'),
        ],
        default='share_capital'
    )
    
    # Eligibility Criteria
    minimum_shareholding_required = models.IntegerField(
        default=1,
        help_text="Minimum shares to be eligible"
    )
    minimum_membership_months = models.IntegerField(
        default=6,
        help_text="Minimum membership duration in months"
    )
    
    # Member Count
    total_eligible_members = models.IntegerField()
    members_paid = models.IntegerField(default=0)
    members_pending = models.IntegerField(default=0)
    
    # Tax Deductions
    tds_applicable = models.BooleanField(default=True)
    tds_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    total_tds_deducted = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    # Important Dates
    declaration_date = models.DateField(help_text="Date when dividend was declared")
    board_approval_date = models.DateField(null=True, blank=True)
    record_date = models.DateField(help_text="Date to determine eligible shareholders")
    payment_start_date = models.DateField(help_text="Date when payment starts")
    payment_end_date = models.DateField(help_text="Target date to complete all payments")
    
    # AGM Details
    agm_date = models.DateField(null=True, blank=True)
    agm_resolution_number = models.CharField(max_length=50, blank=True)
    
    # Payment Details
    total_amount_disbursed = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    pending_disbursement = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='declared')
    
    # Bank Account (for payment processing)
    payment_from_account = models.CharField(max_length=20)
    payment_from_bank = models.CharField(max_length=100)
    payment_from_ifsc = models.CharField(max_length=11)
    
    # Documents
    board_resolution = models.FileField(
        upload_to='dividends/resolutions/',
        null=True,
        blank=True
    )
    distribution_statement = models.FileField(
        upload_to='dividends/statements/',
        null=True,
        blank=True
    )
    tds_certificate_batch = models.FileField(
        upload_to='dividends/tds_certs/',
        null=True,
        blank=True,
        help_text="Batch file of Form 16A"
    )
    
    # Approval Chain
    prepared_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='prepared_dividends'
    )
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_dividends'
    )
    
    # Remarks
    declaration_remarks = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dividend_distributions'
        verbose_name = 'Dividend Distribution'
        verbose_name_plural = 'Dividend Distributions'
        ordering = ['-declaration_date']
        indexes = [
            models.Index(fields=['distribution_number']),
            models.Index(fields=['financial_year']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.distribution_number} - {self.fpo.name} - FY{self.financial_year}"
    
    def calculate_member_dividend(self, shares_held):
        """Calculate dividend for a member based on shares held"""
        gross_dividend = shares_held * self.dividend_per_share
        
        if self.tds_applicable and gross_dividend > 5000:  # TDS threshold
            tds_amount = gross_dividend * (self.tds_percentage / 100)
            net_dividend = gross_dividend - tds_amount
        else:
            tds_amount = 0
            net_dividend = gross_dividend
        
        return {
            'gross_dividend': gross_dividend,
            'tds_deducted': tds_amount,
            'net_dividend': net_dividend
        }


class MemberDividendPayment(models.Model):
    """Individual member dividend payment records"""
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('on_hold', 'On Hold'),
        ('reinvested', 'Reinvested'),
    ]
    
    dividend_distribution = models.ForeignKey(
        DividendDistribution,
        on_delete=models.CASCADE,
        related_name='member_payments'
    )
    
    # Member Details
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        related_name='dividend_payments'
    )
    membership_number = models.CharField(max_length=20)
    
    # Shareholding
    shares_held = models.IntegerField()
    share_value_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_share_value = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Dividend Calculation
    gross_dividend = models.DecimalField(max_digits=10, decimal_places=2)
    tds_deducted = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_dividend = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment Details
    payment_mode = models.CharField(
        max_length=20,
        choices=DividendDistribution.PAYMENT_MODE_CHOICES
    )
    payment_date = models.DateField(null=True, blank=True)
    transaction_reference = models.CharField(max_length=100, blank=True)
    
    # Bank Details
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    
    # Status
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    failure_reason = models.TextField(blank=True)
    
    # TDS Certificate
    tds_certificate = models.FileField(
        upload_to='dividends/member_tds/',
        null=True,
        blank=True,
        help_text="Form 16A for this member"
    )
    
    # Payment Receipt
    payment_receipt = models.FileField(
        upload_to='dividends/receipts/',
        null=True,
        blank=True
    )
    
    # Member Acknowledgment
    acknowledged = models.BooleanField(default=False)
    acknowledgment_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'member_dividend_payments'
        verbose_name = 'Member Dividend Payment'
        verbose_name_plural = 'Member Dividend Payments'
        unique_together = ['dividend_distribution', 'farmer']
        indexes = [
            models.Index(fields=['payment_status']),
            models.Index(fields=['payment_date']),
        ]
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - ₹{self.net_dividend}" 