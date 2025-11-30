from django.db import models
import uuid

class Warehouse(models.Model):
    """Warehouse/godown master database"""
    
    WAREHOUSE_TYPE_CHOICES = [
        ('fpo_owned', 'FPO Owned'),
        ('fci', 'Food Corporation of India'),
        ('cwc', 'Central Warehousing Corporation'),
        ('swc', 'State Warehousing Corporation'),
        ('private', 'Private'),
        ('cooperative', 'Cooperative'),
    ]
    
    FACILITY_TYPE_CHOICES = [
        ('covered', 'Covered Warehouse'),
        ('cold_storage', 'Cold Storage'),
        ('silo', 'Silo'),
        ('open_yard', 'Open Yard'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    warehouse_name = models.CharField(max_length=200)
    warehouse_code = models.CharField(max_length=20, unique=True, db_index=True)
    warehouse_type = models.CharField(max_length=20, choices=WAREHOUSE_TYPE_CHOICES)
    facility_type = models.CharField(max_length=20, choices=FACILITY_TYPE_CHOICES)
    
    # Ownership
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='warehouses'
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
    total_capacity_quintals = models.DecimalField(max_digits=12, decimal_places=2)
    covered_capacity_quintals = models.DecimalField(max_digits=12, decimal_places=2)
    open_capacity_quintals = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Current Status
    occupied_capacity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    available_capacity = models.DecimalField(max_digits=12, decimal_places=2)
    utilization_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Infrastructure
    number_of_chambers = models.IntegerField(default=1)
    has_weighbridge = models.BooleanField(default=False)
    has_fumigation_facility = models.BooleanField(default=False)
    has_loading_dock = models.BooleanField(default=False)
    has_security = models.BooleanField(default=True)
    
    # Environment Control
    temperature_controlled = models.BooleanField(default=False)
    humidity_controlled = models.BooleanField(default=False)
    ventilation_system = models.BooleanField(default=True)
    
    # IoT Integration
    iot_enabled = models.BooleanField(default=False)
    temperature_sensors = models.IntegerField(default=0)
    humidity_sensors = models.IntegerField(default=0)
    
    # Licensing
    fssai_license = models.CharField(max_length=14, blank=True)
    wdra_registration = models.CharField(max_length=50, blank=True, help_text="WDRA registration number")
    insurance_policy_number = models.CharField(max_length=50, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    
    # Storage Rates
    storage_rate_per_quintal_per_month = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Storage charges in INR"
    )
    loading_rate_per_quintal = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    unloading_rate_per_quintal = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Contact Person
    manager_name = models.CharField(max_length=200)
    manager_contact = models.CharField(max_length=10)
    manager_email = models.EmailField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_certified = models.BooleanField(default=False)
    
    # Performance
    total_storage_handled = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Total quantity handled (quintals)"
    )
    average_storage_duration_days = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'warehouses'
        verbose_name = 'Warehouse'
        verbose_name_plural = 'Warehouses'
        indexes = [
            models.Index(fields=['warehouse_code']),
            models.Index(fields=['district', 'state']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.warehouse_name} ({self.warehouse_code})"


class Inventory(models.Model):
    """Real-time inventory tracking"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='inventory')
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    
    # Batch Details
    batch_number = models.CharField(max_length=50, unique=True)
    lot_number = models.CharField(max_length=50)
    
    # Owner
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='stored_inventory'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='stored_inventory'
    )
    
    # Quantity
    initial_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Initial stored quantity in quintals"
    )
    current_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Current quantity"
    )
    withdrawn_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    loss_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Quality at Entry
    quality_grade = models.CharField(max_length=10)
    moisture_content_at_entry = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Storage Details
    storage_chamber = models.CharField(max_length=50)
    stack_number = models.CharField(max_length=50, blank=True)
    
    # Dates
    storage_start_date = models.DateField()
    expected_withdrawal_date = models.DateField(null=True, blank=True)
    actual_withdrawal_date = models.DateField(null=True, blank=True)
    
    # Duration
    storage_duration_days = models.IntegerField(default=0)
    
    # Charges
    storage_charges_per_month = models.DecimalField(max_digits=8, decimal_places=2)
    total_storage_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    handling_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('stored', 'Stored'),
            ('partially_withdrawn', 'Partially Withdrawn'),
            ('fully_withdrawn', 'Fully Withdrawn'),
            ('damaged', 'Damaged'),
        ],
        default='stored'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventory'
        verbose_name = 'Inventory'
        verbose_name_plural = 'Inventory'
        indexes = [
            models.Index(fields=['batch_number']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.batch_number} - {self.crop.name}"


class StorageBooking(models.Model):
    """Storage booking system"""
    
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    booking_number = models.CharField(max_length=50, unique=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='bookings')
    
    # Requester
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='storage_bookings'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='storage_bookings'
    )
    
    # Booking Details
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    quantity_to_store = models.DecimalField(max_digits=12, decimal_places=2)
    expected_storage_duration_months = models.IntegerField()
    
    # Dates
    booking_date = models.DateField(auto_now_add=True)
    expected_arrival_date = models.DateField()
    actual_arrival_date = models.DateField(null=True, blank=True)
    expected_withdrawal_date = models.DateField()
    
    # Cost Estimate
    estimated_storage_cost = models.DecimalField(max_digits=10, decimal_places=2)
    advance_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    # Linked Inventory
    inventory = models.OneToOneField(
        Inventory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booking'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'storage_bookings'
        verbose_name = 'Storage Booking'
        verbose_name_plural = 'Storage Bookings'
    
    def __str__(self):
        return f"{self.booking_number} - {self.warehouse.warehouse_name}"


class QualityLog(models.Model):
    """Quality monitoring logs with IoT data"""
    
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='quality_logs')
    
    # Timestamp
    log_date = models.DateTimeField(auto_now_add=True)
    
    # Environmental Conditions
    temperature = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Temperature in Celsius"
    )
    humidity = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Relative humidity %"
    )
    
    # Quality Parameters
    moisture_content = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Inspection
    visual_inspection_done = models.BooleanField(default=False)
    pest_infestation_detected = models.BooleanField(default=False)
    fungal_growth_detected = models.BooleanField(default=False)
    rodent_activity_detected = models.BooleanField(default=False)
    
    # Observations
    observations = models.TextField(blank=True)
    
    # Actions Taken
    fumigation_done = models.BooleanField(default=False)
    aeration_done = models.BooleanField(default=False)
    other_actions = models.TextField(blank=True)
    
    # Quality Score
    quality_score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Quality score 0-100"
    )
    
    # Inspector
    inspected_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # IoT Source
    iot_device_id = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'quality_logs'
        verbose_name = 'Quality Log'
        verbose_name_plural = 'Quality Logs'
        ordering = ['-log_date']
    
    def __str__(self):
        return f"{self.inventory.batch_number} - {self.log_date}"


class LossRecord(models.Model):
    """Storage loss tracking"""
    
    LOSS_TYPE_CHOICES = [
        ('natural_drying', 'Natural Drying Loss'),
        ('pest', 'Pest Damage'),
        ('rodent', 'Rodent Damage'),
        ('fungal', 'Fungal Infection'),
        ('moisture', 'Moisture Damage'),
        ('spillage', 'Spillage'),
        ('fire', 'Fire'),
        ('flood', 'Flood'),
        ('other', 'Other'),
    ]
    
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='loss_records')
    
    # Loss Details
    loss_date = models.DateField()
    loss_type = models.CharField(max_length=20, choices=LOSS_TYPE_CHOICES)
    
    # Quantity
    loss_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Loss quantity in quintals"
    )
    loss_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Financial Impact
    market_value_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    total_financial_loss = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Cause Analysis
    root_cause = models.TextField()
    contributing_factors = models.JSONField(default=list)
    
    # Prevention
    could_have_been_prevented = models.BooleanField(default=False)
    preventive_measures = models.TextField(blank=True)
    
    # Insurance
    insurance_claimed = models.BooleanField(default=False)
    claim_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    claim_status = models.CharField(
        max_length=20,
        choices=[
            ('not_filed', 'Not Filed'),
            ('filed', 'Filed'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('settled', 'Settled'),
        ],
        default='not_filed'
    )
    
    # Documentation
    loss_report = models.FileField(upload_to='loss_reports/', null=True, blank=True)
    photos = models.JSONField(default=list)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loss_records'
        verbose_name = 'Loss Record'
        verbose_name_plural = 'Loss Records'
        ordering = ['-loss_date']
    
    def __str__(self):
        return f"{self.inventory.batch_number} - {self.get_loss_type_display()}"


class FPOStorage(models.Model):
    """FPO storage cost sharing and management"""
    
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='storage_records')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    
    # Period
    month = models.IntegerField()
    year = models.IntegerField()
    
    # Storage Usage
    average_quantity_stored = models.DecimalField(max_digits=12, decimal_places=2)
    peak_quantity_stored = models.DecimalField(max_digits=12, decimal_places=2)
    storage_days = models.IntegerField()
    
    # Costs
    storage_charges = models.DecimalField(max_digits=12, decimal_places=2)
    handling_charges = models.DecimalField(max_digits=10, decimal_places=2)
    maintenance_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    insurance_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Cost Sharing
    fpo_share = models.DecimalField(max_digits=12, decimal_places=2)
    member_share = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Member Distribution
    members_using_storage = models.IntegerField()
    per_member_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_storage'
        verbose_name = 'FPO Storage'
        verbose_name_plural = 'FPO Storage'
        unique_together = ['fpo', 'warehouse', 'month', 'year']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.month}/{self.year}"