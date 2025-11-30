from django.db import models
import uuid

class ProcurementOrder(models.Model):
    """Purchase orders from FPOs to farmers"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('bidding', 'Bidding Open'),
        ('awarded', 'Awarded'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Order Details
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='procurement_orders')
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    
    # Quantity Required
    quantity_required = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Required quantity in quintals"
    )
    quantity_fulfilled = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Fulfilled quantity"
    )
    
    # Quality Requirements
    quality_grade_required = models.CharField(
        max_length=10,
        choices=[
            ('A', 'Grade A'),
            ('B', 'Grade B'),
            ('C', 'Grade C'),
            ('any', 'Any Grade'),
        ]
    )
    quality_specifications = models.JSONField(
        default=dict,
        help_text="Detailed quality specs: moisture %, oil content, etc."
    )
    
    # Pricing
    base_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    msp_applicable = models.BooleanField(default=True)
    minimum_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="MSP or minimum acceptable price"
    )
    maximum_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timeline
    order_date = models.DateField(auto_now_add=True)
    bidding_start_date = models.DateField()
    bidding_end_date = models.DateField()
    delivery_start_date = models.DateField()
    delivery_end_date = models.DateField()
    
    # Collection Centers
    collection_centers = models.JSONField(
        default=list,
        help_text="List of collection center locations"
    )
    
    # Terms & Conditions
    payment_terms = models.TextField()
    delivery_terms = models.TextField()
    penalty_clause = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Approval
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_procurements'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'procurement_orders'
        verbose_name = 'Procurement Order'
        verbose_name_plural = 'Procurement Orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_number} - {self.fpo.name}"


class Bid(models.Model):
    """Bids from farmers/processors on procurement orders"""
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    procurement_order = models.ForeignKey(
        ProcurementOrder,
        on_delete=models.CASCADE,
        related_name='bids'
    )
    
    # Bidder
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='bids'
    )
    processor = models.ForeignKey(
        'processing.ProcessingUnit',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='bids'
    )
    
    # Bid Details
    quantity_offered = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Offered quantity in quintals"
    )
    price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    total_bid_value = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Quality Offered
    quality_grade_offered = models.CharField(max_length=10)
    quality_certificate_url = models.FileField(
        upload_to='bids/quality_certificates/',
        null=True,
        blank=True
    )
    
    # Delivery Details
    proposed_delivery_date = models.DateField()
    delivery_location = models.CharField(max_length=200)
    
    # Terms
    payment_terms_acceptance = models.BooleanField(default=True)
    special_terms = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    rejection_reason = models.TextField(blank=True)
    
    # Evaluation Score
    evaluation_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Score out of 100"
    )
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bids'
        verbose_name = 'Bid'
        verbose_name_plural = 'Bids'
        ordering = ['-submitted_at']
    
    def __str__(self):
        bidder = self.farmer.user.full_name if self.farmer else self.processor.name
        return f"Bid by {bidder} - {self.procurement_order.order_number}"


class QualityGrade(models.Model):
    """Quality grading at collection centers"""
    
    GRADE_CHOICES = [
        ('A', 'Grade A (Premium)'),
        ('B', 'Grade B (Standard)'),
        ('C', 'Grade C (Below Standard)'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Source
    procurement_order = models.ForeignKey(
        ProcurementOrder,
        on_delete=models.CASCADE,
        related_name='quality_grades'
    )
    farmer = models.ForeignKey('farmers.Farmer', on_delete=models.CASCADE)
    
    # Delivery Details
    delivery_date = models.DateField()
    collection_center = models.CharField(max_length=200)
    batch_number = models.CharField(max_length=50)
    
    # Quantity
    quantity_delivered = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Delivered quantity in quintals"
    )
    
    # Quality Parameters
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, help_text="Moisture %")
    oil_content = models.DecimalField(max_digits=5, decimal_places=2, help_text="Oil %")
    foreign_matter = models.DecimalField(max_digits=5, decimal_places=2, help_text="Foreign matter %")
    damaged_seeds = models.DecimalField(max_digits=5, decimal_places=2, help_text="Damaged seeds %")
    
    # Grading Result
    final_grade = models.CharField(max_length=10, choices=GRADE_CHOICES)
    grade_justification = models.TextField()
    
    # Quantity Accepted
    quantity_accepted = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Accepted quantity after grading"
    )
    quantity_rejected = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    rejection_reason = models.TextField(blank=True)
    
    # Grader Details
    graded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='quality_gradings'
    )
    grading_certificate = models.FileField(
        upload_to='quality_certificates/',
        null=True,
        blank=True
    )
    
    # Farmer Acknowledgment
    farmer_acknowledged = models.BooleanField(default=False)
    farmer_signature = models.ImageField(
        upload_to='signatures/',
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'quality_grades'
        verbose_name = 'Quality Grade'
        verbose_name_plural = 'Quality Grades'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.batch_number} - Grade {self.final_grade}"


class Payment(models.Model):
    """Payment tracking for procurement"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer (NEFT/RTGS)'),
        ('upi', 'UPI'),
        ('cheque', 'Cheque'),
        ('cash', 'Cash'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Payment Reference
    payment_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Related Records
    procurement_order = models.ForeignKey(
        ProcurementOrder,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    quality_grade = models.ForeignKey(
        QualityGrade,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    farmer = models.ForeignKey('farmers.Farmer', on_delete=models.CASCADE)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE)
    
    # Amount Calculation
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    gross_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Deductions
    fpo_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="FPO commission amount"
    )
    transport_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deduction_details = models.JSONField(default=dict)
    
    # Net Payment
    net_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Payment Details
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateField()
    
    # Bank Details
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    transaction_reference = models.CharField(max_length=100)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    failure_reason = models.TextField(blank=True)
    
    # Processing
    processed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_payments'
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Receipt
    payment_receipt = models.FileField(upload_to='payment_receipts/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment_number} - ₹{self.net_amount}"


class Contract(models.Model):
    """Contract farming agreements"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
        ('breached', 'Breached'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Contract Details
    contract_number = models.CharField(max_length=50, unique=True)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='contracts')
    farmer = models.ForeignKey('farmers.Farmer', on_delete=models.CASCADE, related_name='contracts')
    
    # Crop Details
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    season = models.CharField(max_length=10)
    year = models.IntegerField()
    
    # Area & Production
    contracted_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Contracted area in acres"
    )
    expected_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Expected production in quintals"
    )
    
    # Pricing
    agreed_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    price_adjustment_clause = models.TextField()
    
    # Quality
    quality_specifications = models.JSONField(default=dict)
    
    # Duration
    contract_start_date = models.DateField()
    contract_end_date = models.DateField()
    
    # Terms & Conditions
    terms_and_conditions = models.TextField()
    fpo_obligations = models.TextField(help_text="What FPO will provide")
    farmer_obligations = models.TextField(help_text="What farmer must do")
    
    # Input Support
    seed_support_provided = models.BooleanField(default=False)
    fertilizer_support_provided = models.BooleanField(default=False)
    technical_support_provided = models.BooleanField(default=True)
    credit_support_provided = models.BooleanField(default=False)
    
    # Signatures
    farmer_signed = models.BooleanField(default=False)
    farmer_signature_date = models.DateField(null=True, blank=True)
    fpo_signed = models.BooleanField(default=False)
    fpo_signature_date = models.DateField(null=True, blank=True)
    
    # Contract Document
    contract_document = models.FileField(upload_to='contracts/')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Performance
    actual_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    contract_fulfillment_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contracts'
        verbose_name = 'Contract'
        verbose_name_plural = 'Contracts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.contract_number} - {self.farmer.user.full_name}"


class FPOCommission(models.Model):
    """FPO commission/margin tracking"""
    
    procurement_order = models.ForeignKey(
        ProcurementOrder,
        on_delete=models.CASCADE,
        related_name='commissions'
    )
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='commission_records')
    
    # Transaction Period
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Volume
    total_quantity_procured = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Pricing
    average_procurement_price = models.DecimalField(max_digits=10, decimal_places=2)
    average_selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Commission Calculation
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    gross_commission = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Deductions
    operational_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Net Commission
    net_commission = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Allocation
    allocated_to_reserve = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allocated_to_operations = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allocated_to_dividend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_commissions'
        verbose_name = 'FPO Commission'
        verbose_name_plural = 'FPO Commissions'
    
    def __str__(self):
        return f"{self.fpo.name} - {self.month}/{self.year}"


class MemberPayment(models.Model):
    """Individual member payment distribution"""
    
    fpo_commission = models.ForeignKey(
        FPOCommission,
        on_delete=models.CASCADE,
        related_name='member_payments'
    )
    farmer = models.ForeignKey('farmers.Farmer', on_delete=models.CASCADE)
    
    # Contribution
    quantity_supplied = models.DecimalField(max_digits=12, decimal_places=2)
    base_payment = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Bonuses
    quality_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    loyalty_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    performance_bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Total
    total_payment = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Payment Status
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processed', 'Processed'),
            ('completed', 'Completed'),
        ],
        default='pending'
    )
    payment_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'member_payments'
        verbose_name = 'Member Payment'
        verbose_name_plural = 'Member Payments'
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - ₹{self.total_payment}"