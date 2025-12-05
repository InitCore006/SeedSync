"""
Blockchain Models for SeedSync Platform
Simplified blockchain implementation using hash chains
Traceability from farm to fork
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import BLOCKCHAIN_ACTION_CHOICES
from apps.core.utils import generate_hash
import json


class BlockchainTransaction(TimeStampedModel):
    """
    Blockchain transaction record
    Each transaction represents a stage in the lot's journey
    """
    # Transaction ID (acts as block hash)
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        editable=False
    )
    
    # Linked Lot
    lot = models.ForeignKey(
        'lots.ProcurementLot',
        on_delete=models.CASCADE,
        related_name='blockchain_transactions'
    )
    
    # Action Details
    action_type = models.CharField(
        max_length=50,
        choices=BLOCKCHAIN_ACTION_CHOICES
    )
    actor_id = models.UUIDField(help_text="UUID of the user who performed the action")
    actor_role = models.CharField(
        max_length=20,
        help_text="Role of the actor (farmer/fpo/processor)"
    )
    actor_name = models.CharField(max_length=200)
    
    # Chain Linking
    data_hash = models.CharField(
        max_length=64,
        help_text="SHA-256 hash of transaction data"
    )
    previous_hash = models.CharField(
        max_length=64,
        blank=True,
        help_text="Hash of previous transaction (creates chain)"
    )
    
    # Transaction Data
    transaction_data = models.JSONField(
        default=dict,
        help_text="Actual transaction details"
    )
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
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
    
    # Verification
    is_verified = models.BooleanField(default=True)
    verification_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'blockchain_transactions'
        verbose_name = 'Blockchain Transaction'
        verbose_name_plural = 'Blockchain Transactions'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['lot', 'created_at']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.get_action_type_display()}"
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            # Generate transaction ID
            self.transaction_id = generate_hash(
                f"{self.lot.id}{self.action_type}{self.timestamp}"
            )
        
        if not self.data_hash:
            # Generate data hash
            data_string = json.dumps(self.transaction_data, sort_keys=True)
            self.data_hash = generate_hash(data_string)
        
        if not self.previous_hash:
            # Get previous transaction
            previous_tx = BlockchainTransaction.objects.filter(
                lot=self.lot
            ).order_by('-created_at').first()
            
            if previous_tx:
                self.previous_hash = previous_tx.data_hash
            else:
                self.previous_hash = "0" * 64  # Genesis block
        
        super().save(*args, **kwargs)


class TraceabilityRecord(TimeStampedModel):
    """
    Complete traceability record for a lot
    Aggregated view of all blockchain transactions
    """
    lot = models.OneToOneField(
        'lots.ProcurementLot',
        on_delete=models.CASCADE,
        related_name='traceability'
    )
    
    # Journey Timeline
    journey = models.JSONField(
        default=list,
        help_text="Complete journey from farm to consumer"
    )
    
    # QR Code Data
    qr_code_data = models.TextField(
        blank=True,
        help_text="Data encoded in QR code"
    )
    
    # Certificate
    certificate_url = models.URLField(
        blank=True,
        help_text="URL to downloadable certificate"
    )
    certificate_hash = models.CharField(
        max_length=64,
        blank=True,
        help_text="Hash of certificate for verification"
    )
    
    # Verification
    total_transactions = models.IntegerField(default=0)
    chain_verified = models.BooleanField(default=True)
    last_verification_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'traceability_records'
        verbose_name = 'Traceability Record'
        verbose_name_plural = 'Traceability Records'
    
    def __str__(self):
        return f"Traceability for {self.lot.lot_number}"
    
    def update_journey(self):
        """Update journey from blockchain transactions"""
        transactions = self.lot.blockchain_transactions.all().order_by('created_at')
        
        journey_data = []
        for tx in transactions:
            journey_data.append({
                'stage': tx.get_action_type_display(),
                'action_code': tx.action_type,
                'actor': tx.actor_name,
                'actor_role': tx.actor_role,
                'timestamp': tx.timestamp.isoformat(),
                'location': {
                    'lat': float(tx.location_latitude) if tx.location_latitude else None,
                    'lng': float(tx.location_longitude) if tx.location_longitude else None
                },
                'transaction_id': tx.transaction_id,
                'data': tx.transaction_data
            })
        
        self.journey = journey_data
        self.total_transactions = len(journey_data)
        self.save()
        
        return journey_data


class QRCode(TimeStampedModel):
    """
    QR Code for lot traceability
    Scannable QR codes for easy verification
    """
    lot = models.OneToOneField(
        'lots.ProcurementLot',
        on_delete=models.CASCADE,
        related_name='qr_code'
    )
    
    # QR Code Details
    qr_image = models.ImageField(
        upload_to='qr_codes/',
        blank=True,
        null=True
    )
    qr_data = models.TextField(
        help_text="Data encoded in QR (typically URL)"
    )
    qr_version = models.IntegerField(default=1)
    
    # Statistics
    scan_count = models.IntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    
    # Validity
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'qr_codes'
        verbose_name = 'QR Code'
        verbose_name_plural = 'QR Codes'
    
    def __str__(self):
        return f"QR Code for {self.lot.lot_number}"
    
    def increment_scan_count(self):
        """Increment scan counter"""
        from django.utils import timezone
        self.scan_count += 1
        self.last_scanned_at = timezone.now()
        self.save(update_fields=['scan_count', 'last_scanned_at'])
