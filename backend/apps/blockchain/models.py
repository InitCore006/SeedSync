from django.db import models
from django.utils import timezone
import uuid
import hashlib
import json
from datetime import datetime

class FPOBatch(models.Model):
    """
    Production batch tracking at FPO level
    Each batch represents a collection of produce from multiple farmers
    """
    
    BATCH_STATUS_CHOICES = [
        ('created', 'Batch Created'),
        ('procurement_complete', 'Procurement Complete'),
        ('quality_checked', 'Quality Checked'),
        ('stored', 'In Storage'),
        ('processing', 'Under Processing'),
        ('processed', 'Processing Complete'),
        ('packed', 'Packed'),
        ('dispatched', 'Dispatched'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('sold', 'Sold to End Customer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Batch Identification
    batch_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique batch identifier (e.g., FPO-CROP-YYYYMMDD-001)"
    )
    batch_name = models.CharField(max_length=200)
    
    # FPO Details
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        related_name='production_batches'
    )
    
    # Crop Details
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE,
        related_name='batches'
    )
    crop_variety = models.ForeignKey(
        'crops.CropVariety',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='batches'
    )
    
    # Procurement Details
    procurement_orders = models.ManyToManyField(
        'procurement.ProcurementOrder',
        related_name='blockchain_batches',
        blank=True,
        help_text="Procurement orders that contributed to this batch"
    )
    
    # Source Farmers
    contributing_farmers = models.ManyToManyField(
        'farmers.Farmer',
        through='BatchContribution',
        related_name='contributed_batches'
    )
    total_contributing_farmers = models.IntegerField(default=0)
    
    # Source Farms (Geographic Traceability)
    source_farms = models.JSONField(
        default=list,
        help_text="List of farm IDs with GPS coordinates"
    )
    
    # Quantity
    total_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total quantity in kg"
    )
    available_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Available quantity in kg"
    )
    unit = models.CharField(max_length=20, default='kg')
    
    # Quality Metrics
    average_quality_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    quality_grade = models.CharField(
        max_length=10,
        choices=[
            ('A+', 'Premium'),
            ('A', 'Grade A'),
            ('B', 'Grade B'),
            ('C', 'Grade C'),
        ],
        blank=True
    )
    
    # Harvest Details
    harvest_start_date = models.DateField()
    harvest_end_date = models.DateField()
    harvest_season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
        ]
    )
    
    # Processing Details
    is_processed = models.BooleanField(default=False)
    processing_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g., Oil Extraction, Cleaning, Sorting"
    )
    processing_date = models.DateField(null=True, blank=True)
    processing_unit = models.ForeignKey(
        'processing.ProcessingUnit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_batches'
    )
    
    # Storage Details
    warehouse = models.ForeignKey(
        'warehouses.Warehouse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stored_batches'
    )
    storage_start_date = models.DateField(null=True, blank=True)
    storage_end_date = models.DateField(null=True, blank=True)
    
    # Packaging Details
    packaging_date = models.DateField(null=True, blank=True)
    package_type = models.CharField(max_length=100, blank=True)
    packages_count = models.IntegerField(default=0)
    package_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weight per package in kg"
    )
    
    # Certifications
    organic_certified = models.BooleanField(default=False)
    fair_trade_certified = models.BooleanField(default=False)
    agmark_certified = models.BooleanField(default=False)
    certifications = models.ManyToManyField(
        'compliance.Certificate',
        related_name='certified_batches',
        blank=True
    )
    
    # Blockchain Integration
    blockchain_hash = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        db_index=True,
        help_text="SHA-256 hash of batch data"
    )
    blockchain_registered = models.BooleanField(default=False)
    blockchain_registration_date = models.DateTimeField(null=True, blank=True)
    previous_block_hash = models.CharField(
        max_length=64,
        blank=True,
        help_text="Hash of previous batch in chain"
    )
    
    # QR Code
    qr_code_generated = models.BooleanField(default=False)
    qr_code_image = models.ImageField(
        upload_to='blockchain/qr_codes/',
        null=True,
        blank=True
    )
    qr_code_url = models.URLField(
        blank=True,
        help_text="Public URL for QR code verification"
    )
    
    # Status
    status = models.CharField(
        max_length=30,
        choices=BATCH_STATUS_CHOICES,
        default='created'
    )
    
    # Destination
    buyer_name = models.CharField(max_length=200, blank=True)
    buyer_type = models.CharField(
        max_length=20,
        choices=[
            ('retailer', 'Retailer'),
            ('wholesaler', 'Wholesaler'),
            ('processor', 'Processor'),
            ('exporter', 'Exporter'),
            ('government', 'Government Agency'),
            ('consumer', 'Direct Consumer'),
        ],
        blank=True
    )
    destination_city = models.CharField(max_length=100, blank=True)
    destination_state = models.CharField(max_length=100, blank=True)
    
    # Sustainability Metrics
    water_usage_liters = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    carbon_footprint_kg = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    pesticide_used = models.BooleanField(default=False)
    pesticide_details = models.TextField(blank=True)
    
    # Traceability Verification
    traceability_verified = models.BooleanField(default=False)
    verification_count = models.IntegerField(
        default=0,
        help_text="Number of times QR code was scanned"
    )
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        help_text="Additional batch metadata"
    )
    
    # Created By
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_batches'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_batches'
        verbose_name = 'FPO Batch'
        verbose_name_plural = 'FPO Batches'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch_number']),
            models.Index(fields=['blockchain_hash']),
            models.Index(fields=['status']),
            models.Index(fields=['harvest_start_date']),
        ]
    
    def __str__(self):
        return f"{self.batch_number} - {self.crop.name}"
    
    def generate_blockchain_hash(self):
        """Generate SHA-256 hash for blockchain"""
        batch_data = {
            'batch_number': self.batch_number,
            'fpo_id': str(self.fpo.id),
            'crop_id': str(self.crop.id),
            'total_quantity': str(self.total_quantity),
            'harvest_start_date': str(self.harvest_start_date),
            'harvest_end_date': str(self.harvest_end_date),
            'quality_grade': self.quality_grade,
            'timestamp': str(timezone.now()),
            'previous_hash': self.previous_block_hash or '0',
        }
        
        # Create deterministic JSON string
        batch_json = json.dumps(batch_data, sort_keys=True)
        
        # Generate SHA-256 hash
        hash_object = hashlib.sha256(batch_json.encode())
        self.blockchain_hash = hash_object.hexdigest()
        
        return self.blockchain_hash
    
    def register_on_blockchain(self):
        """Register batch on blockchain"""
        if not self.blockchain_hash:
            self.generate_blockchain_hash()
        
        self.blockchain_registered = True
        self.blockchain_registration_date = timezone.now()
        self.save()
        
        # Create blockchain transaction record
        BlockchainTransaction.objects.create(
            transaction_type='batch_creation',
            batch=self,
            fpo=self.fpo,
            transaction_hash=self.blockchain_hash,
            transaction_data={
                'batch_number': self.batch_number,
                'quantity': str(self.total_quantity),
                'farmers_count': self.total_contributing_farmers,
            }
        )
        
        return True


class BatchContribution(models.Model):
    """
    Through model for farmer contributions to a batch
    Tracks individual farmer's contribution to collective batch
    """
    
    batch = models.ForeignKey(FPOBatch, on_delete=models.CASCADE)
    farmer = models.ForeignKey('farmers.Farmer', on_delete=models.CASCADE)
    
    # Contribution Details
    quantity_contributed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Quantity in kg"
    )
    quality_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Farm Details
    farm = models.ForeignKey(
        'farmers.FarmPlot',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Procurement
    procurement_order = models.ForeignKey(
        'procurement.ProcurementOrder',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Date
    contribution_date = models.DateField()
    
    # Payment
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'batch_contributions'
        unique_together = ['batch', 'farmer', 'procurement_order']
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - {self.quantity_contributed}kg"


class TraceabilityRecord(models.Model):
    """
    Detailed traceability record for farm-to-fork tracking
    Captures every stage of the supply chain
    """
    
    STAGE_CHOICES = [
        ('sowing', 'Sowing'),
        ('growth', 'Growth Phase'),
        ('harvest', 'Harvesting'),
        ('collection', 'Collection at FPO'),
        ('quality_check', 'Quality Check'),
        ('grading', 'Grading & Sorting'),
        ('storage', 'Storage'),
        ('processing', 'Processing'),
        ('packaging', 'Packaging'),
        ('dispatch', 'Dispatch'),
        ('transit', 'In Transit'),
        ('delivery', 'Delivery'),
        ('retail', 'Retail Sale'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Batch Reference
    batch = models.ForeignKey(
        FPOBatch,
        on_delete=models.CASCADE,
        related_name='traceability_records'
    )
    
    # Stage Details
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    stage_name = models.CharField(max_length=200)
    stage_description = models.TextField()
    
    # Location
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Timestamp
    stage_timestamp = models.DateTimeField()
    duration_hours = models.IntegerField(
        null=True,
        blank=True,
        help_text="Duration spent at this stage"
    )
    
    # Responsible Party
    responsible_person = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    responsible_organization = models.CharField(max_length=200, blank=True)
    
    # Environmental Conditions
    temperature_celsius = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    humidity_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Quality Observations
    quality_observations = models.TextField(blank=True)
    quality_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Photos/Documents
    photos = models.JSONField(
        default=list,
        help_text="List of photo URLs"
    )
    documents = models.JSONField(
        default=list,
        help_text="List of document URLs"
    )
    
    # Blockchain Hash
    record_hash = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        help_text="SHA-256 hash of this record"
    )
    
    # Previous Record Link (Chain)
    previous_record = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='next_records'
    )
    
    # Additional Data
    additional_data = models.JSONField(
        default=dict,
        help_text="Stage-specific additional data"
    )
    
    # Verification
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_records'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'traceability_records'
        verbose_name = 'Traceability Record'
        verbose_name_plural = 'Traceability Records'
        ordering = ['stage_timestamp']
        indexes = [
            models.Index(fields=['batch', 'stage']),
            models.Index(fields=['stage_timestamp']),
        ]
    
    def __str__(self):
        return f"{self.batch.batch_number} - {self.get_stage_display()}"
    
    def generate_record_hash(self):
        """Generate hash for this record"""
        record_data = {
            'batch_number': self.batch.batch_number,
            'stage': self.stage,
            'timestamp': str(self.stage_timestamp),
            'location': self.location,
            'responsible_person': str(self.responsible_person.id) if self.responsible_person else '',
            'previous_hash': self.previous_record.record_hash if self.previous_record else '0',
        }
        
        record_json = json.dumps(record_data, sort_keys=True)
        hash_object = hashlib.sha256(record_json.encode())
        self.record_hash = hash_object.hexdigest()
        
        return self.record_hash


class BlockchainTransaction(models.Model):
    """
    Blockchain transaction log
    Records all blockchain operations
    """
    
    TRANSACTION_TYPE_CHOICES = [
        ('batch_creation', 'Batch Creation'),
        ('quality_update', 'Quality Update'),
        ('transfer', 'Ownership Transfer'),
        ('processing', 'Processing Event'),
        ('delivery', 'Delivery Confirmation'),
        ('certification', 'Certification'),
        ('payment', 'Payment Record'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Transaction Details
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="SHA-256 transaction hash"
    )
    
    # Related Objects
    batch = models.ForeignKey(
        FPOBatch,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='blockchain_transactions'
    )
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        related_name='blockchain_transactions'
    )
    
    # Transaction Data
    transaction_data = models.JSONField(
        default=dict,
        help_text="Complete transaction payload"
    )
    
    # Blockchain Details
    block_number = models.BigIntegerField(null=True, blank=True)
    block_hash = models.CharField(max_length=64, blank=True)
    previous_transaction_hash = models.CharField(max_length=64, blank=True)
    
    # Smart Contract (if applicable)
    smart_contract = models.ForeignKey(
        'SmartContract',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    
    # Participants
    from_party = models.CharField(max_length=200, help_text="Sender/Source")
    to_party = models.CharField(max_length=200, help_text="Receiver/Destination")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Hyperledger Fabric Details (if using)
    channel_name = models.CharField(max_length=100, blank=True)
    chaincode_name = models.CharField(max_length=100, blank=True)
    endorsement_policy = models.TextField(blank=True)
    
    # Verification
    signature = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    
    # Gas/Fees (if applicable)
    transaction_fee = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        default=0
    )
    
    # Error Handling
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'blockchain_transactions'
        verbose_name = 'Blockchain Transaction'
        verbose_name_plural = 'Blockchain Transactions'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['transaction_hash']),
            models.Index(fields=['status']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.transaction_hash[:16]}..."


class QRCode(models.Model):
    """
    QR Code generation and management
    Each batch gets a unique QR code for consumer verification
    """
    
    QR_TYPE_CHOICES = [
        ('batch', 'Batch QR Code'),
        ('package', 'Package QR Code'),
        ('certificate', 'Certificate QR Code'),
        ('farmer', 'Farmer Profile QR'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # QR Code Details
    qr_code = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique QR code identifier"
    )
    qr_type = models.CharField(max_length=20, choices=QR_TYPE_CHOICES)
    
    # Related Objects
    batch = models.ForeignKey(
        FPOBatch,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='qr_codes'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='qr_codes'
    )
    certificate = models.ForeignKey(
        'compliance.Certificate',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='qr_codes'
    )
    
    # QR Code Image
    qr_code_image = models.ImageField(
        upload_to='blockchain/qr_codes/',
        help_text="Generated QR code image"
    )
    qr_code_svg = models.FileField(
        upload_to='blockchain/qr_codes/svg/',
        null=True,
        blank=True,
        help_text="SVG version for printing"
    )
    
    # Public URL
    public_verification_url = models.URLField(
        help_text="Public URL that QR code points to"
    )
    
    # Embedded Data
    embedded_data = models.JSONField(
        default=dict,
        help_text="Data embedded in QR code"
    )
    
    # Display Information
    display_title = models.CharField(max_length=200)
    display_description = models.TextField(blank=True)
    
    # Print Details
    print_size_mm = models.IntegerField(
        default=50,
        help_text="Recommended print size in mm"
    )
    dpi = models.IntegerField(default=300)
    
    # Usage Statistics
    scan_count = models.IntegerField(
        default=0,
        help_text="Total number of scans"
    )
    unique_scan_count = models.IntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    
    # Geographic Scan Data
    scan_locations = models.JSONField(
        default=list,
        help_text="List of locations where QR was scanned"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Security
    encryption_key = models.CharField(max_length=64, blank=True)
    requires_authentication = models.BooleanField(default=False)
    
    # Generated By
    generated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'qr_codes'
        verbose_name = 'QR Code'
        verbose_name_plural = 'QR Codes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['qr_code']),
            models.Index(fields=['qr_type']),
        ]
    
    def __str__(self):
        return f"{self.qr_code} - {self.get_qr_type_display()}"
    
    def record_scan(self, scan_data):
        """Record a QR code scan"""
        self.scan_count += 1
        self.last_scanned_at = timezone.now()
        
        # Record scan location if provided
        if 'latitude' in scan_data and 'longitude' in scan_data:
            scan_locations = self.scan_locations or []
            scan_locations.append({
                'timestamp': str(timezone.now()),
                'latitude': scan_data['latitude'],
                'longitude': scan_data['longitude'],
                'ip_address': scan_data.get('ip_address', ''),
            })
            self.scan_locations = scan_locations
        
        self.save()
        
        # Create scan log
        QRCodeScan.objects.create(
            qr_code=self,
            scan_timestamp=timezone.now(),
            scan_data=scan_data
        )


class QRCodeScan(models.Model):
    """
    Individual QR code scan records
    For analytics and consumer insights
    """
    
    qr_code = models.ForeignKey(
        QRCode,
        on_delete=models.CASCADE,
        related_name='scans'
    )
    
    # Scan Details
    scan_timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Location
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Device Information
    device_type = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=50, blank=True)
    
    # Network
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # User (if authenticated)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Additional Data
    scan_data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'qr_code_scans'
        verbose_name = 'QR Code Scan'
        verbose_name_plural = 'QR Code Scans'
        ordering = ['-scan_timestamp']
        indexes = [
            models.Index(fields=['scan_timestamp']),
            models.Index(fields=['qr_code', 'scan_timestamp']),
        ]
    
    def __str__(self):
        return f"{self.qr_code.qr_code} - {self.scan_timestamp}"


class SmartContract(models.Model):
    """
    Smart Contract Templates (Mock/Simulated)
    For automated execution of business logic
    """
    
    CONTRACT_TYPE_CHOICES = [
        ('procurement', 'Procurement Agreement'),
        ('quality_assurance', 'Quality Assurance'),
        ('payment', 'Payment Terms'),
        ('delivery', 'Delivery Terms'),
        ('price_guarantee', 'Price Guarantee'),
        ('insurance', 'Crop Insurance'),
        ('certification', 'Certification Validation'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('deployed', 'Deployed'),
        ('active', 'Active'),
        ('executed', 'Executed'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Contract Details
    contract_name = models.CharField(max_length=200)
    contract_code = models.CharField(max_length=50, unique=True)
    contract_type = models.CharField(max_length=30, choices=CONTRACT_TYPE_CHOICES)
    
    # Parties
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        related_name='smart_contracts'
    )
    counterparty_name = models.CharField(max_length=200)
    counterparty_type = models.CharField(
        max_length=20,
        choices=[
            ('buyer', 'Buyer'),
            ('processor', 'Processor'),
            ('insurer', 'Insurance Company'),
            ('government', 'Government Agency'),
        ]
    )
    
    # Contract Terms
    terms_and_conditions = models.TextField()
    
    # Conditions (JSON)
    trigger_conditions = models.JSONField(
        default=dict,
        help_text="Conditions that trigger contract execution"
    )
    execution_actions = models.JSONField(
        default=dict,
        help_text="Actions to execute when conditions are met"
    )
    
    # Financial Terms
    contract_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Total contract value in INR"
    )
    payment_terms = models.TextField()
    penalty_terms = models.TextField(blank=True)
    
    # Validity
    start_date = models.DateField()
    end_date = models.DateField()
    auto_renew = models.BooleanField(default=False)
    
    # Blockchain Details
    contract_address = models.CharField(
        max_length=100,
        blank=True,
        help_text="Smart contract address on blockchain"
    )
    deployment_hash = models.CharField(max_length=64, blank=True)
    deployed_at = models.DateTimeField(null=True, blank=True)
    
    # Execution Tracking
    execution_count = models.IntegerField(default=0)
    last_executed_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Code (Pseudo-code or actual chaincode)
    contract_code_snippet = models.TextField(
        blank=True,
        help_text="Chaincode or pseudo-code"
    )
    
    # Audit Trail
    creation_hash = models.CharField(max_length=64, blank=True)
    modification_history = models.JSONField(default=list)
    
    # Documents
    contract_document = models.FileField(
        upload_to='blockchain/smart_contracts/',
        null=True,
        blank=True
    )
    
    # Created By
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'smart_contracts'
        verbose_name = 'Smart Contract'
        verbose_name_plural = 'Smart Contracts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.contract_name} - {self.get_status_display()}"
    
    def check_execution_conditions(self):
        """
        Check if contract execution conditions are met
        This is a mock implementation - real implementation would
        interact with Hyperledger Fabric or blockchain network
        """
        # Mock condition checking logic
        conditions_met = True
        
        # Example: Check if quality criteria met
        if self.contract_type == 'quality_assurance':
            # Check related batch quality scores
            pass
        
        # Example: Check if payment terms met
        if self.contract_type == 'payment':
            # Check payment completion
            pass
        
        return conditions_met
    
    def execute(self):
        """
        Execute smart contract actions
        Mock implementation
        """
        if self.status != 'active':
            return False
        
        if not self.check_execution_conditions():
            return False
        
        # Execute actions defined in execution_actions
        # This would interact with blockchain in production
        
        self.execution_count += 1
        self.last_executed_at = timezone.now()
        self.save()
        
        # Create transaction record
        BlockchainTransaction.objects.create(
            transaction_type='processing',
            fpo=self.fpo,
            smart_contract=self,
            transaction_hash=hashlib.sha256(
                f"{self.contract_code}-{timezone.now()}".encode()
            ).hexdigest(),
            transaction_data={
                'contract_name': self.contract_name,
                'execution_count': self.execution_count,
            },
            from_party=self.fpo.name,
            to_party=self.counterparty_name,
            status='confirmed',
        )
        
        return True


class BlockchainNode(models.Model):
    """
    Blockchain network nodes (for Hyperledger Fabric or private blockchain)
    """
    
    NODE_TYPE_CHOICES = [
        ('peer', 'Peer Node'),
        ('orderer', 'Orderer Node'),
        ('ca', 'Certificate Authority'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Node Details
    node_name = models.CharField(max_length=200)
    node_type = models.CharField(max_length=20, choices=NODE_TYPE_CHOICES)
    
    # Organization
    organization_name = models.CharField(max_length=200)
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='blockchain_nodes'
    )
    
    # Network Details
    host = models.CharField(max_length=200)
    port = models.IntegerField()
    endpoint_url = models.URLField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_online = models.BooleanField(default=True)
    
    # Health Monitoring
    last_health_check = models.DateTimeField(null=True, blank=True)
    uptime_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00
    )
    
    # Statistics
    total_transactions_processed = models.BigIntegerField(default=0)
    last_block_number = models.BigIntegerField(null=True, blank=True)
    
    # Timestamps
    joined_network_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blockchain_nodes'
        verbose_name = 'Blockchain Node'
        verbose_name_plural = 'Blockchain Nodes'
    
    def __str__(self):
        return f"{self.node_name} ({self.get_node_type_display()})"