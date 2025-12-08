"""
Payments Models for SeedSync Platform
Payment tracking and transaction management
"""
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import PAYMENT_STATUS_CHOICES
from apps.core.validators import validate_positive


class Payment(TimeStampedModel):
    """
    Payment transaction record
    Tracks payments from buyers to farmers
    """
    # Transaction Identification
    payment_id = models.CharField(
        max_length=100,
        unique=True,
        editable=False
    )
    
    # Related Entities
    lot = models.ForeignKey(
        'lots.ProcurementLot',
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )
    bid = models.ForeignKey(
        'bids.Bid',
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )
    
    # Payer & Payee
    payer_id = models.UUIDField(help_text="UUID of payer")
    payer_name = models.CharField(max_length=200)
    payer_type = models.CharField(max_length=20)  # fpo/processor/retailer
    
    payee_id = models.UUIDField(help_text="UUID of farmer")
    payee_name = models.CharField(max_length=200)
    payee_account_number = models.CharField(max_length=20, blank=True)
    payee_ifsc_code = models.CharField(max_length=11, blank=True)
    
    # Amount Details
    gross_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[validate_positive]
    )
    commission_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Platform/FPO commission"
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=2.5
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    net_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        editable=False,
        help_text="Amount payable to farmer"
    )
    
    # Payment Method
    payment_method = models.CharField(
        max_length=50,
        choices=[
            ('bank_transfer', 'Bank Transfer'),
            ('upi', 'UPI'),
            ('razorpay', 'Razorpay'),
            ('cash', 'Cash'),
            ('cheque', 'Cheque')
        ]
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    
    # Payment Gateway Details
    gateway_transaction_id = models.CharField(max_length=200, blank=True)
    gateway_response = models.JSONField(default=dict)
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expected_date = models.DateField(null=True, blank=True)
    
    # Additional
    notes = models.TextField(blank=True)
    receipt_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['status', 'initiated_at']),
            models.Index(fields=['payer_id']),
            models.Index(fields=['payee_id']),
        ]
    
    def __str__(self):
        return f"{self.payment_id} - ₹{self.net_amount}"
    
    def save(self, *args, **kwargs):
        # Generate payment ID
        if not self.payment_id:
            from apps.core.utils import generate_unique_code
            self.payment_id = generate_unique_code('PAY', 12)
        
        # Calculate net amount
        self.net_amount = self.gross_amount - self.commission_amount - self.tax_amount
        
        super().save(*args, **kwargs)


class Transaction(TimeStampedModel):
    """
    Detailed transaction log
    Audit trail for all financial transactions
    """
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    
    # Transaction Details
    transaction_type = models.CharField(
        max_length=50,
        choices=[
            ('payment_initiated', 'Payment Initiated'),
            ('payment_processing', 'Payment Processing'),
            ('payment_completed', 'Payment Completed'),
            ('payment_failed', 'Payment Failed'),
            ('refund_initiated', 'Refund Initiated'),
            ('refund_completed', 'Refund Completed')
        ]
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=50)
    status_message = models.TextField(blank=True)
    
    # Reference
    reference_id = models.CharField(max_length=200, blank=True)
    external_transaction_id = models.CharField(max_length=200, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_type} - ₹{self.amount}"


class Wallet(TimeStampedModel):
    """
    Wallet for users (simulation for hackathon)
    Mock wallet system for demo purposes
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    
    # Balance
    balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    locked_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Amount locked in pending transactions"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'wallets'
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'
    
    def __str__(self):
        return f"Wallet of {self.user.phone_number} - ₹{self.balance}"
    
    def get_available_balance(self):
        """Get available balance"""
        return self.balance - self.locked_amount
    
    def has_sufficient_balance(self, amount):
        """Check if wallet has sufficient balance"""
        from decimal import Decimal
        return self.get_available_balance() >= Decimal(str(amount))
    
    def deduct_balance(self, amount, reason=""):
        """Deduct amount from wallet balance"""
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        if not self.has_sufficient_balance(amount):
            raise ValueError(f"Insufficient balance. Available: ₹{self.get_available_balance()}, Required: ₹{amount}")
        
        self.balance -= amount
        self.save(update_fields=['balance', 'updated_at'])
        
        return self.balance
    
    def add_balance(self, amount, reason=""):
        """Add amount to wallet balance"""
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        self.balance += amount
        self.save(update_fields=['balance', 'updated_at'])
        
        return self.balance
    
    def lock_amount(self, amount):
        """Lock amount for pending transaction"""
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        if not self.has_sufficient_balance(amount):
            raise ValueError(f"Insufficient balance to lock. Available: ₹{self.get_available_balance()}, Required: ₹{amount}")
        
        self.locked_amount += amount
        self.save(update_fields=['locked_amount', 'updated_at'])
        
        return self.locked_amount
    
    def unlock_amount(self, amount):
        """Unlock amount after transaction completion"""
        from decimal import Decimal
        amount = Decimal(str(amount))
        
        self.locked_amount = max(0, self.locked_amount - amount)
        self.save(update_fields=['locked_amount', 'updated_at'])
        
        return self.locked_amount
