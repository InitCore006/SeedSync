from django.db import models
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Processor(models.Model):
    """Oil Mill/Processing Unit - Hackathon Optimized"""
    
    BUSINESS_SCALE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='processor_profile')
    
    # Business Identity
    company_name = models.CharField(max_length=200)
    processor_code = models.CharField(max_length=20, unique=True, db_index=True)
    business_scale = models.CharField(max_length=20, choices=BUSINESS_SCALE_CHOICES)
    
    # Location (for supply chain matching)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    pincode = models.CharField(max_length=6)
    
    # Essential Compliance
    gstin = models.CharField(max_length=15, unique=True)
    fssai_license = models.CharField(max_length=14)
    
    # Capacity (for demand-supply matching)
    monthly_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Processing capacity (quintals/month)"
    )
    monthly_requirement = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Raw material needed (quintals/month)"
    )
    
    # Contact
    contact_person = models.CharField(max_length=200)
    phone_regex = RegexValidator(regex=r'^[6-9]\d{9}$')
    contact_phone = models.CharField(max_length=10, validators=[phone_regex])
    contact_email = models.EmailField()
    
    # Status
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'processors'
        indexes = [
            models.Index(fields=['processor_code']),
            models.Index(fields=['city', 'state']),
            models.Index(fields=['is_verified', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.company_name} ({self.processor_code})"
    
    def save(self, *args, **kwargs):
        if not self.processor_code:
            state_code = self.state[:2].upper()
            count = Processor.objects.filter(state=self.state).count() + 1
            self.processor_code = f"PRO{state_code}{count:05d}"
        super().save(*args, **kwargs)


# Auto-update user role
@receiver(post_save, sender=Processor)
def update_processor_role(sender, instance, created, **kwargs):
    if created and instance.user.role != 'processor':
        instance.user.role = 'processor'
        instance.user.save(update_fields=['role'])