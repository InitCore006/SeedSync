from django.db import models
from core.models import TimeStampedModel
from users.models import FarmerProfile, FPOProfile, ProcessorProfile
from advisory.models import CropType

class MarketPrice(TimeStampedModel):
    """Historical and current market prices"""
    
    crop_type = models.ForeignKey(CropType, on_delete=models.CASCADE)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    market_name = models.CharField(max_length=200, blank=True)  # Mandi name
    
    # Price data
    date = models.DateField()
    min_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    max_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    modal_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    
    # Source
    source = models.CharField(max_length=100, default='AGMARKNET')
    
    class Meta:
        db_table = 'market_prices'
        unique_together = ['crop_type', 'state', 'date', 'market_name']
        indexes = [
            models.Index(fields=['crop_type', 'state', 'date']),
        ]


class PriceForecast(TimeStampedModel):
    """AI-generated price predictions"""
    
    crop_type = models.ForeignKey(CropType, on_delete=models.CASCADE)
    state = models.CharField(max_length=100)
    
    # Forecast
    forecast_date = models.DateField()
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    confidence_interval_low = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_interval_high = models.DecimalField(max_digits=10, decimal_places=2)
    
    # AI metadata
    model_version = models.CharField(max_length=50)
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    class Meta:
        db_table = 'price_forecasts'
        indexes = [
            models.Index(fields=['crop_type', 'forecast_date']),
        ]


class MarketListing(TimeStampedModel):
    """Buy/Sell listings on platform"""
    
    LISTING_TYPE_CHOICES = [
        ('SELL', 'Sell Offer'),
        ('BUY', 'Buy Requirement'),
    ]
    
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES)
    crop_type = models.ForeignKey(CropType, on_delete=models.PROTECT)
    
    # Seller (Farmer or FPO)
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, null=True, blank=True, related_name='listings')
    fpo = models.ForeignKey(FPOProfile, on_delete=models.CASCADE, null=True, blank=True, related_name='listings')
    
    # Buyer (Processor or FPO)
    buyer_processor = models.ForeignKey(ProcessorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='buy_listings')
    buyer_fpo = models.ForeignKey(FPOProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='buy_listings')
    
    # Quantity & Quality
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="In quintals")
    quality_grade = models.CharField(max_length=10)  # A, B, C or A+, A, B+, B
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, help_text="Percentage")
    oil_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, help_text="Percentage")
    
    # Pricing
    asking_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    
    # Location
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_fulfilled = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'market_listings'
        indexes = [
            models.Index(fields=['listing_type', 'is_active']),
            models.Index(fields=['crop_type', 'state']),
        ]


class Order(TimeStampedModel):
    """Purchase orders"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Acceptance'),
        ('ACCEPTED', 'Accepted'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    order_id = models.CharField(max_length=50, unique=True)
    listing = models.ForeignKey(MarketListing, on_delete=models.CASCADE, related_name='orders')
    
    # Buyer
    buyer_processor = models.ForeignKey(ProcessorProfile, on_delete=models.CASCADE, null=True, blank=True)
    buyer_fpo = models.ForeignKey(FPOProfile, on_delete=models.CASCADE, null=True, blank=True)
    
    # Order details
    quantity_ordered = models.DecimalField(max_digits=10, decimal_places=2, help_text="In quintals")
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹/quintal")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="₹")
    
    # Delivery
    delivery_address = models.TextField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Payment
    advance_payment = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        indexes = [
            models.Index(fields=['order_id']),
            models.Index(fields=['status']),
        ]