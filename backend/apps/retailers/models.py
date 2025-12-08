"""
Retailers Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class RetailerProfile(TimeStampedModel):
    """Retailer profile"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='retailer_profile')
    business_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'retailer_profiles'
    
    def __str__(self):
        return self.business_name


class Store(TimeStampedModel):
    """Store/shop details"""
    retailer = models.ForeignKey(RetailerProfile, on_delete=models.CASCADE, related_name='stores')
    store_name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    
    class Meta:
        db_table = 'stores'
    
    def __str__(self):
        return self.store_name


class RetailerOrder(TimeStampedModel):
    """Retailer orders for purchasing processed products from processors"""
    
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    order_number = models.CharField(max_length=50, unique=True)
    retailer = models.ForeignKey(RetailerProfile, on_delete=models.CASCADE, related_name='orders')
    processor = models.ForeignKey('processors.ProcessorProfile', on_delete=models.CASCADE, related_name='retailer_orders')
    
    # Order details
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Financial
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Delivery
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_state = models.CharField(max_length=50, choices=INDIAN_STATES)
    delivery_pincode = models.CharField(max_length=10)
    
    # Additional info
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'retailer_orders'
        ordering = ['-order_date']
    
    def __str__(self):
        return f"{self.order_number} - {self.retailer.business_name}"
    
    def save(self, *args, **kwargs):
        """Generate order number if not set"""
        if not self.order_number:
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_order = RetailerOrder.objects.filter(
                order_number__startswith=f'ORD-{date_str}'
            ).order_by('-order_number').first()
            
            if last_order:
                last_num = int(last_order.order_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.order_number = f'ORD-{date_str}-{new_num:04d}'
        
        super().save(*args, **kwargs)


class OrderItem(TimeStampedModel):
    """Individual items in a retailer order"""
    
    order = models.ForeignKey(RetailerOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('processors.ProcessedProduct', on_delete=models.CASCADE, related_name='order_items')
    
    # Quantity
    quantity_liters = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Product snapshot (in case product details change)
    product_name = models.CharField(max_length=200)
    product_type = models.CharField(max_length=50)
    batch_number = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.product_name} - {self.quantity_liters}L"
    
    def save(self, *args, **kwargs):
        """Calculate subtotal"""
        self.subtotal = self.quantity_liters * self.unit_price
        super().save(*args, **kwargs)


class RetailerInventory(TimeStampedModel):
    """Retailer inventory tracking for processed oil products"""
    
    STOCK_STATUS = [
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('reorder', 'Reorder Required'),
    ]
    
    retailer = models.ForeignKey(RetailerProfile, on_delete=models.CASCADE, related_name='inventory')
    product = models.ForeignKey('processors.ProcessedProduct', on_delete=models.CASCADE, related_name='retailer_stocks')
    
    # Stock levels (in liters)
    current_stock_liters = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    reorder_point = models.DecimalField(max_digits=10, decimal_places=2)
    reorder_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Pricing
    last_purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Tracking
    last_restocked = models.DateField(null=True, blank=True)
    last_sold = models.DateField(null=True, blank=True)
    
    # Product details snapshot
    product_name = models.CharField(max_length=200)
    product_type = models.CharField(max_length=50)
    sku = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'retailer_inventory'
        unique_together = ['retailer', 'product']
    
    def __str__(self):
        return f"{self.retailer.business_name} - {self.product_name}"
    
    @property
    def stock_status(self):
        """Calculate stock status"""
        if self.current_stock_liters == 0:
            return 'out_of_stock'
        elif self.current_stock_liters <= self.reorder_point:
            return 'reorder'
        elif self.current_stock_liters <= self.min_stock_level:
            return 'low_stock'
        else:
            return 'in_stock'
    
    @property
    def stock_percentage(self):
        """Calculate stock as percentage of max level"""
        if self.max_stock_level > 0:
            return (self.current_stock_liters / self.max_stock_level) * 100
        return 0
