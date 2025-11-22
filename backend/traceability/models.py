from django.db import models
from core.models import TimeStampedModel
from users.models import FarmerProfile, FPOProfile, ProcessorProfile, RetailerProfile
from advisory.models import CropCycle
from marketplace.models import Order

class Batch(TimeStampedModel):
    """Blockchain-linked production batch"""
    
    batch_id = models.CharField(max_length=100, unique=True)  # Unique blockchain ID
    crop_cycle = models.ForeignKey(CropCycle, on_delete=models.CASCADE, related_name='batches')
    
    # Origin
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE)
    harvest_date = models.DateField()
    
    # Quantity & Quality
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="In quintals")
    quality_grade = models.CharField(max_length=10)
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2)
    oil_content = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Certification
    quality_certificate_url = models.URLField(blank=True)
    is_organic = models.BooleanField(default=False)
    
    # Blockchain
    blockchain_hash = models.CharField(max_length=256, blank=True)  # Transaction hash
    blockchain_timestamp = models.DateTimeField(null=True, blank=True)
    
    # QR Code
    qr_code = models.ImageField(upload_to='qr_codes/', null=True, blank=True)
    
    class Meta:
        db_table = 'batches'
        indexes = [
            models.Index(fields=['batch_id']),
            models.Index(fields=['farmer', 'harvest_date']),
        ]
    
    def __str__(self):
        return self.batch_id


class SupplyChainEvent(TimeStampedModel):
    """Track each stage in supply chain"""
    
    EVENT_TYPE_CHOICES = [
        ('HARVESTED', 'Harvested'),
        ('STORED_FARM', 'Stored at Farm'),
        ('COLLECTED_FPO', 'Collected by FPO'),
        ('STORED_FPO', 'Stored at FPO Warehouse'),
        ('DISPATCHED', 'Dispatched to Processor'),
        ('RECEIVED_PROCESSOR', 'Received at Processor'),
        ('PROCESSING_STARTED', 'Processing Started'),
        ('PROCESSING_COMPLETED', 'Processing Completed'),
        ('DISPATCHED_RETAIL', 'Dispatched to Retailer'),
        ('RECEIVED_RETAIL', 'Received at Retail'),
    ]
    
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    
    # Event details
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    
    # Actor
    actor_farmer = models.ForeignKey(FarmerProfile, on_delete=models.SET_NULL, null=True, blank=True)
    actor_fpo = models.ForeignKey(FPOProfile, on_delete=models.SET_NULL, null=True, blank=True)
    actor_processor = models.ForeignKey(ProcessorProfile, on_delete=models.SET_NULL, null=True, blank=True)
    actor_retailer = models.ForeignKey(RetailerProfile, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    supporting_documents = models.JSONField(default=list)  # URLs to images/docs
    
    # Blockchain
    blockchain_hash = models.CharField(max_length=256, blank=True)
    
    class Meta:
        db_table = 'supply_chain_events'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['batch', 'timestamp']),
        ]


class QualityTest(TimeStampedModel):
    """Quality testing at various stages"""
    
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='quality_tests')
    
    # Test details
    test_date = models.DateTimeField(auto_now_add=True)
    tested_by = models.CharField(max_length=200)  # Lab name or FPO/Processor name
    test_location = models.CharField(max_length=200)
    
    # Parameters
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2)
    oil_content = models.DecimalField(max_digits=5, decimal_places=2)
    foreign_matter = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage")
    damaged_seeds = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage")
    
    # Result
    final_grade = models.CharField(max_length=10)
    is_passed = models.BooleanField(default=True)
    
    # Certificate
    certificate_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'quality_tests'


class ProductTrace(TimeStampedModel):
    """Final product traceability (Refined Oil)"""
    
    product_id = models.CharField(max_length=100, unique=True)  # SKU/Barcode
    source_batches = models.ManyToManyField(Batch, related_name='products')
    
    # Processor
    processor = models.ForeignKey(ProcessorProfile, on_delete=models.CASCADE)
    processing_date = models.DateField()
    
    # Product details
    product_name = models.CharField(max_length=200)  # "Refined Mustard Oil"
    brand_name = models.CharField(max_length=200)
    net_weight = models.DecimalField(max_digits=8, decimal_places=2, help_text="In liters/kg")
    packaging_date = models.DateField()
    expiry_date = models.DateField()
    
    # Certifications
    fssai_license = models.CharField(max_length=14)
    is_organic_certified = models.BooleanField(default=False)
    
    # QR Code for consumer
    consumer_qr_code = models.ImageField(upload_to='product_qr/', null=True, blank=True)
    
    class Meta:
        db_table = 'product_traces'