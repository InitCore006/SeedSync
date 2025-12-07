"""
Processors Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class ProcessorProfile(TimeStampedModel):
    """Processor profile"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='processor_profile')
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    processing_capacity_quintals_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'processor_profiles'
    
    def __str__(self):
        return self.company_name


class ProcessingPlant(TimeStampedModel):
    """Processing plant details"""
    processor = models.ForeignKey(ProcessorProfile, on_delete=models.CASCADE, related_name='plants')
    plant_name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    capacity_quintals_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'processing_plants'
    
    def __str__(self):
        return self.plant_name


class ProcessingBatch(TimeStampedModel):
    """Processing batch tracking with multi-stage workflow"""
    
    PROCESSING_STAGES = [
        ('cleaning', 'Cleaning'),
        ('dehulling', 'Dehulling'),
        ('crushing', 'Crushing'),
        ('conditioning', 'Conditioning'),
        ('pressing', 'Pressing'),
        ('filtration', 'Filtration'),
        ('refining', 'Refining'),
        ('packaging', 'Packaging'),
    ]
    
    PROCESSING_METHODS = [
        ('cold_pressed', 'Cold Pressed'),
        ('hot_pressed', 'Hot Pressed'),
        ('solvent_extraction', 'Solvent Extraction'),
        ('expeller_pressed', 'Expeller Pressed'),
    ]
    
    BATCH_STATUS = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    plant = models.ForeignKey(ProcessingPlant, on_delete=models.CASCADE, related_name='batches')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='processing_batches')
    batch_number = models.CharField(max_length=50, unique=True)
    
    # Initial quantity
    initial_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Stage-wise quantities (in quintals)
    cleaned_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dehulled_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    crushed_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    conditioned_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Final products (in quintals)
    oil_extracted_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refined_oil_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cake_produced_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hulls_produced_quintals = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Waste tracking
    waste_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Processing metadata
    processing_method = models.CharField(max_length=50, choices=PROCESSING_METHODS, default='cold_pressed')
    current_stage = models.CharField(max_length=50, choices=PROCESSING_STAGES, default='cleaning')
    status = models.CharField(max_length=20, choices=BATCH_STATUS, default='pending')
    
    # Dates
    start_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'processing_batches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.batch_number} - {self.get_current_stage_display()}"
    
    @property
    def oil_yield_percentage(self):
        """Calculate oil yield percentage"""
        if self.initial_quantity_quintals and self.oil_extracted_quintals:
            return (self.oil_extracted_quintals / self.initial_quantity_quintals) * 100
        return 0
    
    @property
    def cake_yield_percentage(self):
        """Calculate cake yield percentage"""
        if self.initial_quantity_quintals and self.cake_produced_quintals:
            return (self.cake_produced_quintals / self.initial_quantity_quintals) * 100
        return 0
    
    @property
    def total_waste_percentage(self):
        """Calculate total waste percentage"""
        if self.initial_quantity_quintals and self.waste_quantity_quintals:
            return (self.waste_quantity_quintals / self.initial_quantity_quintals) * 100
        return 0


class ProcessingStageLog(TimeStampedModel):
    """Track each processing stage individually for detailed analysis"""
    
    batch = models.ForeignKey(ProcessingBatch, on_delete=models.CASCADE, related_name='stage_logs')
    stage = models.CharField(max_length=50, choices=ProcessingBatch.PROCESSING_STAGES)
    
    # Quantities (in quintals)
    input_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    output_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    waste_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Quality metrics (JSON field for flexibility)
    quality_metrics = models.JSONField(null=True, blank=True, help_text="Store quality parameters like moisture %, purity %, etc.")
    
    # Operator and equipment
    operator = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='processing_stages')
    equipment_used = models.CharField(max_length=200, blank=True)
    
    # Timing
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    
    # Issues and notes
    issues_encountered = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'processing_stage_logs'
        ordering = ['created_at']
        unique_together = ['batch', 'stage']
    
    def __str__(self):
        return f"{self.batch.batch_number} - {self.get_stage_display()}"
    
    @property
    def yield_percentage(self):
        """Calculate yield for this stage"""
        if self.input_quantity and self.output_quantity:
            return (self.output_quantity / self.input_quantity) * 100
        return 0
    
    @property
    def loss_percentage(self):
        """Calculate loss for this stage"""
        if self.input_quantity:
            loss = self.input_quantity - self.output_quantity - self.waste_quantity
            return (loss / self.input_quantity) * 100
        return 0
    
    def save(self, *args, **kwargs):
        """Auto-calculate duration if end_time is set"""
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            self.duration_minutes = int(delta.total_seconds() / 60)
        super().save(*args, **kwargs)


class FinishedProduct(TimeStampedModel):
    """Inventory management for finished products"""
    
    PRODUCT_TYPES = [
        ('crude_oil', 'Crude Oil'),
        ('refined_oil', 'Refined Oil'),
        ('oil_cake', 'Oil Cake'),
        ('hulls', 'Hulls/Shells'),
    ]
    
    PRODUCT_STATUS = [
        ('in_stock', 'In Stock'),
        ('reserved', 'Reserved'),
        ('sold', 'Sold'),
        ('shipped', 'Shipped'),
        ('expired', 'Expired'),
    ]
    
    STORAGE_CONDITIONS = [
        ('ambient', 'Ambient Temperature'),
        ('cool_dry', 'Cool & Dry'),
        ('refrigerated', 'Refrigerated'),
        ('climate_controlled', 'Climate Controlled'),
    ]
    
    batch = models.ForeignKey(ProcessingBatch, on_delete=models.CASCADE, related_name='finished_products')
    product_type = models.CharField(max_length=50, choices=PRODUCT_TYPES)
    
    # Quantity
    quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2)
    reserved_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    available_quantity_quintals = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Storage
    storage_location = models.CharField(max_length=200)
    storage_conditions = models.CharField(max_length=50, choices=STORAGE_CONDITIONS, default='cool_dry')
    
    # Quality
    quality_grade = models.CharField(max_length=50, blank=True)
    quality_test_report = models.FileField(upload_to='quality_reports/', null=True, blank=True)
    
    # Packaging
    packaging_type = models.CharField(max_length=100, blank=True)
    units_per_package = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_packages = models.IntegerField(null=True, blank=True)
    
    # Dates
    production_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=PRODUCT_STATUS, default='in_stock')
    
    # Pricing
    cost_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Alerts
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'finished_products'
        ordering = ['-production_date']
    
    def __str__(self):
        return f"{self.get_product_type_display()} - {self.quantity_quintals}Q (Batch: {self.batch.batch_number})"
    
    @property
    def is_low_stock(self):
        """Check if stock is below threshold"""
        return self.available_quantity_quintals <= self.low_stock_threshold
    
    @property
    def is_expired(self):
        """Check if product has expired"""
        if self.expiry_date:
            from django.utils import timezone
            return timezone.now().date() > self.expiry_date
        return False
    
    def save(self, *args, **kwargs):
        """Auto-calculate available quantity"""
        self.available_quantity_quintals = self.quantity_quintals - self.reserved_quantity_quintals
        super().save(*args, **kwargs)
