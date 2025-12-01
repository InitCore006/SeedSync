from django.db import models
import uuid

class Farmer(models.Model):
    """Farmer master profile"""
    
    CATEGORY_CHOICES = [
        ('marginal', 'Marginal (< 1 hectare)'),
        ('small', 'Small (1-2 hectares)'),
        ('semi_medium', 'Semi-Medium (2-4 hectares)'),
        ('medium', 'Medium (4-10 hectares)'),
        ('large', 'Large (> 10 hectares)'),
    ]
    
    CASTE_CATEGORY_CHOICES = [
        ('general', 'General'),
        ('obc', 'OBC'),
        ('sc', 'SC'),
        ('st', 'ST'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='farmer_profile')
    
    # Farmer ID (like Kisan Credit Card)
    farmer_id = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Land Details
    total_land_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total land in acres"
    )
    irrigated_land = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Irrigated land in acres"
    )
    rain_fed_land = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Rain-fed land in acres"
    )
    
    # Categorization
    farmer_category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='marginal'
    )
    caste_category = models.CharField(
        max_length=10,
        choices=CASTE_CATEGORY_CHOICES,
        default='general'
    )
    
    # FPO Membership - FIXED: Use string reference to avoid circular import
    is_fpo_member = models.BooleanField(default=False)
    primary_fpo = models.ForeignKey(
        'fpos.FPO',  # String reference instead of direct import
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_members'
    )
    
    # Government Schemes
    has_kisan_credit_card = models.BooleanField(default=False)
    kcc_number = models.CharField(max_length=20, blank=True)
    has_pmfby_insurance = models.BooleanField(default=False)
    pmfby_policy_number = models.CharField(max_length=30, blank=True)
    has_pm_kisan = models.BooleanField(default=False)
    
    # Performance Metrics (for credit scoring)
    total_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Total production in quintals"
    )
    average_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Average yield per acre"
    )
    credit_score = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farmers'
        verbose_name = 'Farmer'
        verbose_name_plural = 'Farmers'
        indexes = [
            models.Index(fields=['farmer_id']),
            models.Index(fields=['is_fpo_member']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} ({self.farmer_id})"
    
    def calculate_credit_score(self):
        """Calculate farmer credit score based on performance"""
        score = 0
        
        # Land ownership (max 30 points)
        if self.total_land_area > 10:
            score += 30
        elif self.total_land_area > 5:
            score += 20
        else:
            score += 10
        
        # FPO membership (10 points)
        if self.is_fpo_member:
            score += 10
        
        # Government schemes (20 points)
        if self.has_kisan_credit_card:
            score += 10
        if self.has_pmfby_insurance:
            score += 10
        
        # Production performance (40 points)
        if self.average_yield > 20:
            score += 40
        elif self.average_yield > 15:
            score += 30
        elif self.average_yield > 10:
            score += 20
        else:
            score += 10
        
        self.credit_score = min(score, 100)
        self.save()
        return self.credit_score




