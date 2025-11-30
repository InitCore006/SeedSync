from django.db import models
from django.db import models
import uuid

class ProcessingUnit(models.Model):
    """Oil mills and processing units"""
    
    UNIT_TYPE_CHOICES = [
        ('oil_mill', 'Oil Extraction Mill'),
        ('solvent_extraction', 'Solvent Extraction Plant'),
        ('refinery', 'Oil Refinery'),
        ('packaging', 'Packaging Unit'),
        ('integrated', 'Integrated Processing Unit'),
    ]
    
    OWNERSHIP_CHOICES = [
        ('fpo_owned', 'FPO Owned'),
        ('cooperative', 'Cooperative'),
        ('private', 'Private'),
        ('govt', 'Government'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    unit_name = models.CharField(max_length=200)
    unit_code = models.CharField(max_length=20, unique=True, db_index=True)
    unit_type = models.CharField(max_length=30, choices=UNIT_TYPE_CHOICES)
    ownership_type = models.CharField(max_length=20, choices=OWNERSHIP_CHOICES)
    
    # Owner
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='processing_units'
    )
    owner_name = models.CharField(max_length=200)
    owner_contact = models.CharField(max_length=10)
    
    # Location
    address = models.TextField()
    village = models.CharField(max_length=100, blank=True)
    block = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    # GIS Location
    location = models.JSONField(null=True, blank=True)
    
    # Capacity
    daily_capacity_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Daily processing capacity"
    )
    annual_capacity_quintals = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Annual processing capacity"
    )
    
    # Current Utilization
    current_utilization_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Infrastructure
    number_of_expellers = models.IntegerField(default=0)
    storage_capacity_quintals = models.DecimalField(max_digits=10, decimal_places=2)
    has_quality_testing_lab = models.BooleanField(default=False)
    has_packaging_facility = models.BooleanField(default=False)
    
    # Technology
    technology_type = models.CharField(
        max_length=50,
        choices=[
            ('traditional', 'Traditional Ghani'),
            ('mechanical', 'Mechanical Expeller'),
            ('solvent', 'Solvent Extraction'),
            ('cold_press', 'Cold Press'),
            ('supercritical', 'Supercritical CO2'),
        ]
    )
    automation_level = models.CharField(
        max_length=20,
        choices=[
            ('manual', 'Manual'),
            ('semi_automated', 'Semi-Automated'),
            ('fully_automated', 'Fully Automated'),
        ],
        default='semi_automated'
    )
    
    # Certifications
    fssai_license = models.CharField(max_length=14)
    iso_certified = models.BooleanField(default=False)
    iso_certificate_number = models.CharField(max_length=50, blank=True)
    agmark_certified = models.BooleanField(default=False)
    organic_certified = models.BooleanField(default=False)
    halal_certified = models.BooleanField(default=False)
    
    # Licensing
    factory_license_number = models.CharField(max_length=50)
    pollution_clearance = models.CharField(max_length=50, blank=True)
    fire_safety_certificate = models.CharField(max_length=50, blank=True)
    
    # Products
    products_manufactured = models.JSONField(
        default=list,
        help_text="List of products: ['crude oil', 'refined oil', 'oil cake', ...]"
    )
    
    # Oil Extraction Rate
    average_oil_extraction_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Average oil recovery %"
    )
    
    # Pricing
    processing_charges_per_quintal = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Processing charges in INR"
    )
    toll_processing_available = models.BooleanField(default=True)
    
    # Contact Person
    manager_name = models.CharField(max_length=200)
    manager_contact = models.CharField(max_length=10)
    manager_email = models.EmailField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_operational = models.BooleanField(default=True)
    
    # Performance
    total_processed_quintals = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )
    average_monthly_processing = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    # Timestamps
    established_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'processing_units'
        verbose_name = 'Processing Unit'
        verbose_name_plural = 'Processing Units'
        indexes = [
            models.Index(fields=['unit_code']),
            models.Index(fields=['district', 'state']),
        ]
    
    def __str__(self):
        return f"{self.unit_name} ({self.unit_code})"


class ProcessingOrder(models.Model):
    """Processing orders/job work"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('in_queue', 'In Queue'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Order Details
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    processing_unit = models.ForeignKey(
        ProcessingUnit,
        on_delete=models.CASCADE,
        related_name='processing_orders'
    )
    
    # Client
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='processing_orders'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='processing_orders'
    )
    
    # Input Material
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    input_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Input quantity in quintals"
    )
    input_quality_grade = models.CharField(max_length=10)
    
    # Processing Type
    processing_type = models.CharField(
        max_length=30,
        choices=[
            ('oil_extraction', 'Oil Extraction'),
            ('refining', 'Refining'),
            ('packaging', 'Packaging'),
            ('full_processing', 'Full Processing'),
        ]
    )
    
    # Expected Output
    expected_oil_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Expected oil output in liters/kg"
    )
    expected_cake_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Expected oil cake output in quintals"
    )
    
    # Actual Output
    actual_oil_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    actual_cake_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    oil_extraction_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timeline
    order_date = models.DateField(auto_now_add=True)
    scheduled_start_date = models.DateField()
    actual_start_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField()
    actual_completion_date = models.DateField(null=True, blank=True)
    
    # Pricing
    processing_charges = models.DecimalField(max_digits=10, decimal_places=2)
    additional_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_charges = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('partial', 'Partial'),
            ('completed', 'Completed'),
        ],
        default='pending'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Quality Certificate
    quality_certificate = models.FileField(
        upload_to='processing/certificates/',
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'processing_orders'
        verbose_name = 'Processing Order'
        verbose_name_plural = 'Processing Orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_number} - {self.processing_unit.unit_name}"


class Product(models.Model):
    """Finished products from processing"""
    
    PRODUCT_TYPE_CHOICES = [
        ('crude_oil', 'Crude Oil'),
        ('refined_oil', 'Refined Oil'),
        ('filtered_oil', 'Filtered Oil'),
        ('oil_cake', 'Oil Cake'),
        ('packaged_oil', 'Packaged Oil'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Product Details
    product_name = models.CharField(max_length=200)
    product_code = models.CharField(max_length=50, unique=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES)
    
    # Source Crop
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='products')
    
    # Specifications
    specifications = models.JSONField(
        default=dict,
        help_text="Product specifications"
    )
    
    # Packaging
    packaging_unit = models.CharField(
        max_length=20,
        choices=[
            ('liter', 'Liter'),
            ('kg', 'Kilogram'),
            ('quintal', 'Quintal'),
        ]
    )
    available_pack_sizes = models.JSONField(
        default=list,
        help_text="['1L', '5L', '15L', '1kg', '50kg']"
    )
    
    # Brand
    brand_name = models.CharField(max_length=100, blank=True)
    fpo_brand = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='branded_products'
    )
    
    # Certifications
    has_agmark = models.BooleanField(default=False)
    has_fssai = models.BooleanField(default=True)
    is_organic = models.BooleanField(default=False)
    certifications = models.JSONField(default=list)
    
    # Pricing
    base_price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Base price in INR"
    )
    mrp_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Maximum Retail Price"
    )
    
    # Shelf Life
    shelf_life_months = models.IntegerField()
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Images
    product_image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
    
    def __str__(self):
        return f"{self.product_name} ({self.product_code})"


class ProductionBatch(models.Model):
    """Production batch tracking"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Batch Details
    batch_number = models.CharField(max_length=50, unique=True, db_index=True)
    processing_order = models.ForeignKey(
        ProcessingOrder,
        on_delete=models.CASCADE,
        related_name='batches'
    )
    processing_unit = models.ForeignKey(ProcessingUnit, on_delete=models.CASCADE)
    
    # Production Date
    production_date = models.DateField()
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()
    
    # Input
    input_crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    input_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    input_batch_numbers = models.JSONField(
        default=list,
        help_text="Source batch numbers from warehouse"
    )
    
    # Output Products
    products_produced = models.JSONField(
        default=dict,
        help_text="{'product_id': {'quantity': 100, 'unit': 'liter'}}"
    )
    
    # Quality Parameters
    oil_quality_ffa = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Free Fatty Acid %"
    )
    oil_quality_moisture = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    oil_quality_impurities = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Quality Test Report
    quality_test_report = models.FileField(
        upload_to='quality_reports/',
        null=True,
        blank=True
    )
    quality_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Traceability
    traceability_code = models.CharField(max_length=100, unique=True)
    qr_code = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('in_production', 'In Production'),
            ('quality_check', 'Quality Check'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('released', 'Released to Market'),
        ],
        default='in_production'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'production_batches'
        verbose_name = 'Production Batch'
        verbose_name_plural = 'Production Batches'
        ordering = ['-production_date']
    
    def __str__(self):
        return f"{self.batch_number} - {self.production_date}"


class ValueAddition(models.Model):
    """Value addition tracking for FPOs"""
    
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='value_additions')
    processing_unit = models.ForeignKey(ProcessingUnit, on_delete=models.CASCADE)
    
    # Period
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Input
    total_input_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total raw material processed"
    )
    total_input_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Total input cost in INR"
    )
    
    # Output
    total_output_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    total_output_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Total output value in INR"
    )
    
    # Processing Costs
    processing_cost = models.DecimalField(max_digits=12, decimal_places=2)
    packaging_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    labour_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_processing_cost = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Value Addition
    gross_value_addition = models.DecimalField(max_digits=15, decimal_places=2)
    net_value_addition = models.DecimalField(max_digits=15, decimal_places=2)
    value_addition_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Member Benefit
    members_benefited = models.IntegerField()
    average_benefit_per_member = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'value_additions'
        verbose_name = 'Value Addition'
        verbose_name_plural = 'Value Additions'
        unique_together = ['fpo', 'processing_unit', 'month', 'year']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.month}/{self.year}"


class ByProduct(models.Model):
    """By-products management (oil cake, husk, etc.)"""
    
    BYPRODUCT_TYPE_CHOICES = [
        ('oil_cake', 'Oil Cake'),
        ('meal', 'Meal'),
        ('husk', 'Husk'),
        ('shell', 'Shell'),
    ]
    
    processing_order = models.ForeignKey(
        ProcessingOrder,
        on_delete=models.CASCADE,
        related_name='byproducts'
    )
    
    byproduct_type = models.CharField(max_length=20, choices=BYPRODUCT_TYPE_CHOICES)
    
    # Quantity
    quantity_produced = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Quantity in quintals/kg"
    )
    
    # Quality
    protein_content = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="For oil cake"
    )
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Pricing
    market_price_per_quintal = models.DecimalField(max_digits=8, decimal_places=2)
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Sales
    quantity_sold = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity_in_stock = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Status
    is_sold = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'byproducts'
        verbose_name = 'By-Product'
        verbose_name_plural = 'By-Products'
    
    def __str__(self):
        return f"{self.get_byproduct_type_display()} - {self.quantity_produced} quintals"