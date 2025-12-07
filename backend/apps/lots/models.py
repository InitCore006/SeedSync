"""
Lots/Procurement Models for SeedSync Platform
Core marketplace functionality for farmers to list their produce
"""
from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import TimeStampedModel
from apps.core.constants import (
    OILSEED_CHOICES, QUALITY_GRADE_CHOICES, LOT_STATUS_CHOICES
)
from apps.core.validators import validate_positive
from apps.core.utils import get_financial_year, generate_unique_code
import datetime


def lot_image_path(instance, filename):
    """Generate upload path for lot images"""
    return f'lots/{instance.lot.id}/images/{filename}'


class ProcurementLot(TimeStampedModel):
    """
    Procurement lot created by farmers
    Core entity representing farmer's produce listing
    """
    # Lot Identification
    lot_number = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text="Auto-generated unique lot number"
    )
    
    # Ownership & Relationships
    farmer = models.ForeignKey(
        'farmers.FarmerProfile',
        on_delete=models.CASCADE,
        related_name='lots',
        null=True,  # Allow NULL for FPO-owned aggregated lots
        blank=True,
        help_text="Farmer who created the lot. NULL for FPO-aggregated lots."
    )
    fpo = models.ForeignKey(
        'fpos.FPOProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='procured_lots',
        help_text="FPO that procured this lot"
    )
    
    # FPO Management Fields
    managed_by_fpo = models.BooleanField(
        default=False,
        help_text="True if farmer is FPO member and lot is auto-managed by FPO"
    )
    listing_type = models.CharField(
        max_length=20,
        choices=[
            ('individual', 'Individual Farmer Lot'),
            ('fpo_managed', 'FPO Managed Lot'),
            ('fpo_aggregated', 'FPO Aggregated Bulk Lot'),
        ],
        default='individual',
        help_text="Type of listing"
    )
    parent_lots = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='aggregated_lots',
        help_text="Parent lots for FPO aggregated listings (traceability)"
    )
    
    # Warehouse Storage (for FPO-managed lots)
    warehouse = models.ForeignKey(
        'fpos.FPOWarehouse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stored_lots',
        help_text="Warehouse where this lot is stored (for FPO lots)"
    )
    
    # Multi-warehouse aggregation (for FPO aggregated lots from multiple warehouses)
    source_warehouses = models.ManyToManyField(
        'fpos.FPOWarehouse',
        blank=True,
        related_name='aggregated_from_lots',
        help_text="Source warehouses for multi-warehouse aggregated lots"
    )
    
    # Crop Details
    crop_type = models.CharField(
        max_length=50,
        choices=OILSEED_CHOICES
    )
    crop_variety = models.CharField(max_length=100, blank=True)
    harvest_date = models.DateField()
    
    # Quantity & Quality
    quantity_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Total quantity available in quintals"
    )
    available_quantity_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Remaining quantity available"
    )
    quality_grade = models.CharField(
        max_length=3,
        choices=QUALITY_GRADE_CHOICES
    )
    moisture_content = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Moisture content percentage"
    )
    oil_content = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Oil content percentage"
    )
    
    # Pricing
    expected_price_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_positive],
        help_text="Farmer's expected price in ₹ per quintal"
    )
    final_price_per_quintal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Final agreed price"
    )
    
    # Location
    location_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    location_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    pickup_address = models.TextField(
        blank=True,
        help_text="Address for pickup"
    )
    
    # Status & Lifecycle
    status = models.CharField(
        max_length=20,
        choices=LOT_STATUS_CHOICES,
        default='available'
    )
    listed_date = models.DateTimeField(auto_now_add=True)
    sold_date = models.DateTimeField(null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)
    
    # Description & Notes
    description = models.TextField(
        blank=True,
        help_text="Additional details about the lot"
    )
    storage_conditions = models.CharField(
        max_length=200,
        blank=True,
        help_text="How the produce is currently stored"
    )
    organic_certified = models.BooleanField(default=False)
    
    # Blockchain Integration
    qr_code_url = models.URLField(
        blank=True,
        help_text="URL to generated QR code image"
    )
    blockchain_tx_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Blockchain transaction ID"
    )
    
    # Statistics
    view_count = models.IntegerField(default=0)
    bid_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'procurement_lots'
        verbose_name = 'Procurement Lot'
        verbose_name_plural = 'Procurement Lots'
        ordering = ['-listed_date']
        indexes = [
            models.Index(fields=['status', 'crop_type']),
            models.Index(fields=['farmer', 'status']),
            models.Index(fields=['listed_date']),
        ]
    
    def __str__(self):
        return f"{self.lot_number} - {self.get_crop_type_display()} ({self.quantity_quintals}Q)"
    
    def save(self, *args, **kwargs):
        # Generate lot number if not exists
        if not self.lot_number:
            self.lot_number = self.generate_lot_number()
        
        # Set available quantity on creation
        if not self.pk:
            self.available_quantity_quintals = self.quantity_quintals
        
        super().save(*args, **kwargs)
    
    def generate_lot_number(self):
        """Generate unique lot number: SB2025001"""
        crop_codes = {
            'soybean': 'SB',
            'mustard': 'MS',
            'groundnut': 'GN',
            'sunflower': 'SF',
            'safflower': 'SA',
            'sesame': 'SE',
            'linseed': 'LS',
            'niger': 'NG',
        }
        
        crop_code = crop_codes.get(self.crop_type, 'XX')
        year = datetime.datetime.now().year
        
        # Get last lot number for this crop this year
        last_lot = ProcurementLot.objects.filter(
            lot_number__startswith=f"{crop_code}{year}"
        ).order_by('-lot_number').first()
        
        if last_lot:
            last_seq = int(last_lot.lot_number[-3:])
            new_seq = last_seq + 1
        else:
            new_seq = 1
        
        return f"{crop_code}{year}{new_seq:03d}"
    
    def increment_view_count(self):
        """Increment view counter"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def increment_bid_count(self):
        """Increment bid counter"""
        self.bid_count += 1
        self.save(update_fields=['bid_count'])


class LotImage(TimeStampedModel):
    """
    Images of the procurement lot
    Farmers can upload 2-3 images of their produce
    """
    lot = models.ForeignKey(
        ProcurementLot,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to=lot_image_path)
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'lot_images'
        verbose_name = 'Lot Image'
        verbose_name_plural = 'Lot Images'
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.lot.lot_number}"


class LotStatusHistory(TimeStampedModel):
    """
    Track status changes of procurement lots
    Audit trail for lot lifecycle
    """
    lot = models.ForeignKey(
        ProcurementLot,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='lot_status_changes'
    )
    reason = models.TextField(blank=True)
    additional_data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'lot_status_history'
        verbose_name = 'Lot Status History'
        verbose_name_plural = 'Lot Status Histories'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.lot.lot_number}: {self.old_status} → {self.new_status}"
