from django.db import models
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Retailer(models.Model):
    """Retailer/Buyer - Hackathon Optimized"""
    
    RETAILER_TYPE_CHOICES = [
        ('wholesaler', 'Wholesaler'),
        ('retail_chain', 'Retail Chain'),
        ('food_processor', 'Food Processor'),
        ('exporter', 'Exporter'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='retailer_profile')
    
    # Business Identity
    business_name = models.CharField(max_length=200)
    retailer_code = models.CharField(max_length=20, unique=True, db_index=True)
    retailer_type = models.CharField(max_length=30, choices=RETAILER_TYPE_CHOICES)
    
    # Location (for supply-demand matching)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    pincode = models.CharField(max_length=6)
    
    # Essential Compliance
    gstin = models.CharField(max_length=15, unique=True)
    fssai_license = models.CharField(max_length=14, blank=True)
    
    # Procurement Capacity (AI forecasting)
    monthly_requirement = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monthly requirement in quintals"
    )
    
    # Contact
    contact_person = models.CharField(max_length=200)
    phone_regex = RegexValidator(regex=r'^[6-9]\d{9}$')
    contact_phone = models.CharField(max_length=10, validators=[phone_regex])
    contact_email = models.EmailField()
    
    # Payment Terms (simplified)
    payment_terms = models.CharField(
        max_length=20,
        choices=[
            ('advance', 'Advance'),
            ('credit_15', '15 Days'),
            ('credit_30', '30 Days'),
        ],
        default='credit_15'
    )
    
    # Status
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'retailers'
        indexes = [
            models.Index(fields=['retailer_code']),
            models.Index(fields=['city', 'state']),
            models.Index(fields=['is_verified', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.retailer_code})"
    
    def save(self, *args, **kwargs):
        if not self.retailer_code:
            state_code = self.state[:2].upper()
            count = Retailer.objects.filter(state=self.state).count() + 1
            self.retailer_code = f"RET{state_code}{count:05d}"
        super().save(*args, **kwargs)


# Auto-update user role
@receiver(post_save, sender=Retailer)
def update_retailer_role(sender, instance, created, **kwargs):
    if created and instance.user.role != 'retailer':
        instance.user.role = 'retailer'
        instance.user.save(update_fields=['role'])