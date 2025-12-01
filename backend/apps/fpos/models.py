from django.db import models
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class FPO(models.Model):
    """FPO - Hackathon Optimized"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='owned_fpo')
    
    # Basic Info
    name = models.CharField(max_length=200, unique=True)
    fpo_code = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Location (for AI matching)
    district = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    pincode = models.CharField(max_length=6)
    
    # Contact
    contact_person = models.CharField(max_length=200)
    phone_regex = RegexValidator(regex=r'^[6-9]\d{9}$')
    contact_phone = models.CharField(max_length=10, validators=[phone_regex])
    contact_email = models.EmailField()
    
    # Essential Registration (for traceability)
    registration_number = models.CharField(max_length=50, unique=True)
    gstin = models.CharField(max_length=15, blank=True)
    
    # Business Metrics (for demand-supply forecasting)
    total_members = models.IntegerField(default=0)
    total_land_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Hectares"
    )
    monthly_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Quintals/month"
    )
    
    # Status
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpos'
        indexes = [
            models.Index(fields=['fpo_code']),
            models.Index(fields=['district', 'state']),
            models.Index(fields=['is_verified', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.fpo_code})"
    
    def save(self, *args, **kwargs):
        if not self.fpo_code:
            state_code = self.state[:2].upper()
            count = FPO.objects.filter(state=self.state).count() + 1
            self.fpo_code = f"FPO{state_code}{count:05d}"
        super().save(*args, **kwargs)


class FPOMembership(models.Model):
    """FPO-Farmer Link"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fpo = models.ForeignKey(FPO, on_delete=models.CASCADE, related_name='memberships')
    farmer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='fpo_memberships')
    
    land_area = models.DecimalField(max_digits=8, decimal_places=2, help_text="Hectares")
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fpo_memberships'
        unique_together = ['fpo', 'farmer']
        indexes = [
            models.Index(fields=['fpo', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.farmer.full_name} - {self.fpo.name}"


# Auto-update user role
@receiver(post_save, sender=FPO)
def update_fpo_owner_role(sender, instance, created, **kwargs):
    if created and instance.owner.role != 'fpo_admin':
        instance.owner.role = 'fpo_admin'
        instance.owner.save(update_fields=['role'])