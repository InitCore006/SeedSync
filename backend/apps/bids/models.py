"""
Bids Models for SeedSync Platform
Bidding system for procurement lots
"""
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import BID_STATUS_CHOICES, PAYMENT_TERMS_CHOICES
from apps.core.validators import validate_positive


class Bid(TimeStampedModel):
    """
    Bid placed by FPO or Processor on a procurement lot
    """
    lot = models.ForeignKey(
        'lots.ProcurementLot',
        on_delete=models.CASCADE,
        related_name='bids'
    )
    
    # Bidder Details
    bidder_type = models.CharField(
        max_length=20,
        choices=[
            ('fpo', 'FPO'),
            ('processor', 'Processor'),
            ('retailer', 'Retailer')
        ]
    )
    bidder_id = models.UUIDField(help_text="UUID of FPO/Processor profile")
    bidder_name = models.CharField(max_length=200)
    bidder_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='bids_placed'
    )
    
    # Bid Details
    offered_price_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Offered price in ₹ per quintal"
    )
    quantity_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Quantity willing to procure (can be partial)"
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        editable=False,
        help_text="Total bid amount"
    )
    
    # Logistics & Payment
    pickup_location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Where the bidder will collect from"
    )
    expected_pickup_date = models.DateField()
    payment_terms = models.CharField(
        max_length=20,
        choices=PAYMENT_TERMS_CHOICES,
        default='7_days'
    )
    advance_payment_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Percentage of advance payment offered"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=BID_STATUS_CHOICES,
        default='pending'
    )
    
    # Communication
    message = models.TextField(
        blank=True,
        help_text="Message to the farmer"
    )
    farmer_response = models.TextField(blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'bids'
        verbose_name = 'Bid'
        verbose_name_plural = 'Bids'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['lot', 'status']),
            models.Index(fields=['bidder_user', 'status']),
        ]
    
    def __str__(self):
        return f"Bid on {self.lot.lot_number} - ₹{self.offered_price_per_quintal}/Q"
    
    def save(self, *args, **kwargs):
        # Calculate total amount
        self.total_amount = self.offered_price_per_quintal * self.quantity_quintals
        super().save(*args, **kwargs)
    
    def accept(self, farmer_response=""):
        """Accept the bid"""
        from django.utils import timezone
        
        self.status = 'accepted'
        self.farmer_response = farmer_response
        self.responded_at = timezone.now()
        self.save()
        
        # Update lot status
        self.lot.status = 'sold'
        self.lot.final_price_per_quintal = self.offered_price_per_quintal
        self.lot.sold_date = timezone.now()
        self.lot.save()
        
        # Reject other pending bids
        self.lot.bids.filter(status='pending').exclude(id=self.id).update(
            status='rejected',
            farmer_response="Another bid was accepted"
        )
        
        # Create bid acceptance record
        BidAcceptance.objects.create(
            bid=self,
            pickup_scheduled_date=self.expected_pickup_date
        )
    
    def reject(self, farmer_response=""):
        """Reject the bid"""
        from django.utils import timezone
        
        self.status = 'rejected'
        self.farmer_response = farmer_response
        self.responded_at = timezone.now()
        self.save()
    
    def withdraw(self):
        """Withdraw the bid"""
        if self.status == 'pending':
            self.status = 'withdrawn'
            self.save()


class BidAcceptance(TimeStampedModel):
    """
    Record of accepted bid
    Tracks fulfillment of accepted bids
    """
    bid = models.OneToOneField(
        Bid,
        on_delete=models.CASCADE,
        related_name='acceptance'
    )
    
    # Acceptance Details
    accepted_at = models.DateTimeField(auto_now_add=True)
    pickup_scheduled_date = models.DateField()
    actual_pickup_date = models.DateField(null=True, blank=True)
    
    # Logistics
    logistics_partner = models.ForeignKey(
        'logistics.LogisticsPartner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bid_deliveries'
    )
    vehicle_number = models.CharField(max_length=20, blank=True)
    driver_name = models.CharField(max_length=200, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    
    # Delivery Status
    pickup_completed = models.BooleanField(default=False)
    delivery_completed = models.BooleanField(default=False)
    delivery_date = models.DateField(null=True, blank=True)
    
    # Quality Check at Pickup
    actual_quantity_received_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual quantity received at pickup"
    )
    quality_grade_verified = models.CharField(max_length=3, blank=True)
    quality_check_notes = models.TextField(blank=True)
    
    # Payment Link
    payment = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bid_acceptance'
    )
    
    # Additional
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'bid_acceptances'
        verbose_name = 'Bid Acceptance'
        verbose_name_plural = 'Bid Acceptances'
        ordering = ['-accepted_at']
    
    def __str__(self):
        return f"Acceptance of {self.bid}"
