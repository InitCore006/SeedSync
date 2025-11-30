from django.db import models
import uuid

class Marketplace(models.Model):
    """Digital marketplace platform"""
    
    MARKETPLACE_TYPE_CHOICES = [
        ('fpo_platform', 'FPO Platform'),
        ('b2b', 'B2B Platform'),
        ('b2c', 'B2C Platform'),
        ('government', 'Government Procurement'),
        ('export', 'Export Market'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    marketplace_name = models.CharField(max_length=200)
    marketplace_type = models.CharField(max_length=20, choices=MARKETPLACE_TYPE_CHOICES)
    
    # Platform Details
    platform_url = models.URLField(blank=True)
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Statistics
    total_listings = models.IntegerField(default=0)
    total_transactions = models.IntegerField(default=0)
    total_gmv = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0,
        help_text="Gross Merchandise Value in INR"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplaces'
        verbose_name = 'Marketplace'
        verbose_name_plural = 'Marketplaces'
    
    def __str__(self):
        return self.marketplace_name


class Listing(models.Model):
    """Product listings on marketplace"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('out_of_stock', 'Out of Stock'),
        ('suspended', 'Suspended'),
        ('closed', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Listing Details
    listing_number = models.CharField(max_length=50, unique=True, db_index=True)
    marketplace = models.ForeignKey(Marketplace, on_delete=models.CASCADE, related_name='listings')
    
    # Seller
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='marketplace_listings'
    )
    processing_unit = models.ForeignKey(
        'processing.ProcessingUnit',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='marketplace_listings'
    )
    
    # Product
    product = models.ForeignKey('processing.Product', on_delete=models.CASCADE, null=True, blank=True)
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, null=True, blank=True)
    
    # Listing Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Quantity & Pricing
    available_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Available quantity"
    )
    unit_of_measurement = models.CharField(
        max_length=20,
        choices=[
            ('quintal', 'Quintal'),
            ('kg', 'Kilogram'),
            ('liter', 'Liter'),
            ('tonne', 'Tonne'),
        ]
    )
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    
    # Quality
    quality_grade = models.CharField(max_length=10, blank=True)
    quality_certificate = models.FileField(
        upload_to='listings/certificates/',
        null=True,
        blank=True
    )
    
    # Location
    pickup_location = models.CharField(max_length=200)
    delivery_available = models.BooleanField(default=True)
    delivery_radius_km = models.IntegerField(default=0)
    
    # Validity
    listing_start_date = models.DateField()
    listing_end_date = models.DateField()
    
    # Media
    images = models.JSONField(default=list, help_text="List of image URLs")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Performance
    view_count = models.IntegerField(default=0)
    inquiry_count = models.IntegerField(default=0)
    order_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplace_listings'
        verbose_name = 'Marketplace Listing'
        verbose_name_plural = 'Marketplace Listings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['listing_number']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.listing_number}"


class Order(models.Model):
    """Marketplace orders"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('payment_pending', 'Payment Pending'),
        ('payment_completed', 'Payment Completed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Order Details
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    marketplace = models.ForeignKey('Marketplace', on_delete=models.CASCADE, related_name='orders')
    listing = models.ForeignKey('Listing', on_delete=models.CASCADE, related_name='orders')
    
    # Buyer
    buyer_name = models.CharField(max_length=200)
    buyer_contact = models.CharField(max_length=10)
    buyer_email = models.EmailField()
    buyer_organization = models.CharField(max_length=200, blank=True)
    
    # Order Items
    quantity_ordered = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Pricing
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    delivery_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    taxes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Delivery Details
    delivery_address = models.TextField()
    delivery_pincode = models.CharField(max_length=6)
    delivery_city = models.CharField(max_length=100)
    delivery_state = models.CharField(max_length=100)
    
    # Timeline
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Payment
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('cod', 'Cash on Delivery'),
            ('online', 'Online Payment'),
            ('bank_transfer', 'Bank Transfer'),
            ('credit_terms', 'Credit Terms'),
        ]
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )
    payment_reference = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    

    
    # Cancellation
    cancelled_by = models.CharField(
        max_length=20,
        choices=[
            ('buyer', 'Buyer'),
            ('seller', 'Seller'),
            ('platform', 'Platform'),
        ],
        blank=True
    )
    cancellation_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'marketplace_orders'
        verbose_name = 'Marketplace Order'
        verbose_name_plural = 'Marketplace Orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_number} - ₹{self.total_amount}"


class Review(models.Model):
    """Product/seller reviews and ratings"""
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reviews')
    
    # Ratings (1-5)
    product_quality_rating = models.IntegerField()
    delivery_rating = models.IntegerField()
    packaging_rating = models.IntegerField()
    overall_rating = models.IntegerField()
    
    # Review
    review_title = models.CharField(max_length=200)
    review_text = models.TextField()
    
    # Reviewer
    reviewer_name = models.CharField(max_length=200)
    is_verified_buyer = models.BooleanField(default=True)
    
    # Photos
    review_photos = models.JSONField(default=list)
    
    # Helpful Count
    helpful_count = models.IntegerField(default=0)
    
    # Status
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'marketplace_reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.reviewer_name} - {self.overall_rating}★"


class BuyerInquiry(models.Model):
    """Buyer inquiries for listings"""
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('responded', 'Responded'),
        ('converted', 'Converted to Order'),
        ('closed', 'Closed'),
    ]
    
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='inquiries')
    
    # Buyer Details
    buyer_name = models.CharField(max_length=200)
    buyer_contact = models.CharField(max_length=10)
    buyer_email = models.EmailField()
    buyer_organization = models.CharField(max_length=200, blank=True)
    
    # Inquiry
    inquiry_text = models.TextField()
    quantity_required = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    target_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Response
    response_text = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Conversion
    converted_order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_inquiry'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'buyer_inquiries'
        verbose_name = 'Buyer Inquiry'
        verbose_name_plural = 'Buyer Inquiries'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Inquiry by {self.buyer_name} - {self.status}"


class FPOMarketplace(models.Model):
    """FPO marketplace performance tracking"""
    
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='marketplace_performance')
    marketplace = models.ForeignKey(Marketplace, on_delete=models.CASCADE)
    
    # Period
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Listings
    active_listings = models.IntegerField(default=0)
    
    # Orders
    total_orders = models.IntegerField(default=0)
    successful_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    
    # Revenue
    gross_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    platform_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Performance Metrics
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    on_time_delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    customer_satisfaction_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_marketplace_performance'
        verbose_name = 'FPO Marketplace Performance'
        verbose_name_plural = 'FPO Marketplace Performance'
        unique_together = ['fpo', 'marketplace', 'month', 'year']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.marketplace.marketplace_name} - {self.month}/{self.year}"