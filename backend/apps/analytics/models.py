from django.db import models
import uuid

class KPIMetric(models.Model):
    """Key Performance Indicators for dashboard"""
    
    METRIC_TYPE_CHOICES = [
        ('production', 'Production Volume'),
        ('area', 'Area Under Cultivation'),
        ('yield', 'Average Yield'),
        ('price', 'Average Price'),
        ('revenue', 'Revenue'),
        ('fpo_count', 'Number of FPOs'),
        ('farmer_count', 'Number of Farmers'),
        ('procurement', 'Procurement Volume'),
        ('loss', 'Post-harvest Loss'),
        ('value_addition', 'Value Addition %'),
    ]
    
    SCOPE_CHOICES = [
        ('national', 'National'),
        ('state', 'State'),
        ('district', 'District'),
        ('fpo', 'FPO'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Metric Details
    metric_type = models.CharField(max_length=30, choices=METRIC_TYPE_CHOICES)
    metric_name = models.CharField(max_length=100)
    
    # Scope
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='kpi_metrics'
    )
    
    # Period
    date = models.DateField()
    month = models.IntegerField(null=True, blank=True)
    year = models.IntegerField()
    quarter = models.IntegerField(null=True, blank=True)
    
    # Value
    metric_value = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50, help_text="Unit of measurement")
    
    # Comparison
    previous_period_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    percentage_change = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Target
    target_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    achievement_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'kpi_metrics'
        verbose_name = 'KPI Metric'
        verbose_name_plural = 'KPI Metrics'
        indexes = [
            models.Index(fields=['metric_type', 'scope']),
            models.Index(fields=['date']),
            models.Index(fields=['year', 'quarter']),
        ]
    
    def __str__(self):
        return f"{self.metric_name} - {self.date}"


class ProductionStats(models.Model):
    """Production statistics for analytics"""
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='production_stats')
    
    # Geographic
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    block = models.CharField(max_length=100, blank=True)
    
    # Period
    season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
        ]
    )
    year = models.IntegerField()
    
    # Production Data
    total_area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Area in hectares"
    )
    total_production = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Production in tonnes"
    )
    average_yield = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Yield in quintal/hectare"
    )
    
    # Farmer Participation
    number_of_farmers = models.IntegerField(default=0)
    fpo_farmers = models.IntegerField(default=0)
    non_fpo_farmers = models.IntegerField(default=0)
    
    # Quality Distribution
    premium_quality_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    standard_quality_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    substandard_quality_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Economic Data
    average_price_realized = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Average price per quintal"
    )
    total_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Total production value in INR"
    )
    
    # Comparison with Benchmarks
    yield_variance_from_benchmark = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Percentage variance"
    )
    
    # Data Source
    data_source = models.CharField(
        max_length=100,
        choices=[
            ('fpo', 'FPO Data'),
            ('govt', 'Government Survey'),
            ('estimated', 'Estimated'),
        ]
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'production_stats'
        verbose_name = 'Production Statistics'
        verbose_name_plural = 'Production Statistics'
        unique_together = ['crop', 'state', 'district', 'season', 'year']
    
    def __str__(self):
        return f"{self.crop.name} - {self.state} - {self.season} {self.year}"


class LossAnalysis(models.Model):
    """Post-harvest loss tracking and analysis"""
    
    LOSS_STAGE_CHOICES = [
        ('harvesting', 'During Harvesting'),
        ('threshing', 'During Threshing'),
        ('drying', 'During Drying'),
        ('storage', 'During Storage'),
        ('transportation', 'During Transportation'),
        ('processing', 'During Processing'),
    ]
    
    LOSS_CAUSE_CHOICES = [
        ('spillage', 'Spillage'),
        ('moisture', 'Moisture/Humidity'),
        ('pest', 'Pest Attack'),
        ('rodents', 'Rodents'),
        ('birds', 'Birds'),
        ('fungal', 'Fungal Infection'),
        ('improper_handling', 'Improper Handling'),
        ('poor_infrastructure', 'Poor Infrastructure'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='loss_analyses')
    
    # Location
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    
    # Source (Farm/FPO/Warehouse)
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loss_records'
    )
    warehouse = models.ForeignKey(
        'warehouses.Warehouse',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='loss_records'
    )
    
    # Period
    loss_date = models.DateField()
    season = models.CharField(max_length=10)
    year = models.IntegerField()
    
    # Loss Details
    loss_stage = models.CharField(max_length=20, choices=LOSS_STAGE_CHOICES)
    loss_cause = models.CharField(max_length=30, choices=LOSS_CAUSE_CHOICES)
    
    # Quantity
    initial_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Initial quantity in quintals"
    )
    loss_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Loss quantity in quintals"
    )
    loss_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Financial Impact
    market_price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    financial_loss = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Financial loss in INR"
    )
    
    # Prevention Measures
    preventive_measures_available = models.BooleanField(default=False)
    preventive_measures_description = models.TextField(blank=True)
    
    # Recommendations
    recommendations = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'loss_analyses'
        verbose_name = 'Loss Analysis'
        verbose_name_plural = 'Loss Analyses'
        indexes = [
            models.Index(fields=['loss_date']),
            models.Index(fields=['loss_stage']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.get_loss_stage_display()} - {self.loss_date}"


class Report(models.Model):
    """Generated reports for various stakeholders"""
    
    REPORT_TYPE_CHOICES = [
        ('production', 'Production Report'),
        ('procurement', 'Procurement Report'),
        ('financial', 'Financial Report'),
        ('fpo_performance', 'FPO Performance Report'),
        ('market_analysis', 'Market Analysis'),
        ('loss_analysis', 'Loss Analysis Report'),
        ('policy_brief', 'Policy Brief'),
        ('custom', 'Custom Report'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Report Details
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Period Covered
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Scope
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('state', 'State'),
            ('district', 'District'),
            ('fpo', 'FPO-specific'),
        ]
    )
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports'
    )
    
    # File Details
    file_format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    file_path = models.FileField(upload_to='reports/')
    file_size = models.BigIntegerField(help_text="File size in bytes")
    
    # Metadata
    generated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_reports'
    )
    parameters = models.JSONField(
        default=dict,
        help_text="Parameters used to generate report"
    )
    
    # Access Control
    is_public = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(
        'users.User',
        related_name='accessible_reports',
        blank=True
    )
    
    # Statistics
    download_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at.date()}"


class FPOComparison(models.Model):
    """FPO performance comparison and benchmarking"""
    
    # Comparison Group
    comparison_name = models.CharField(max_length=200)
    fpos = models.ManyToManyField('fpos.FPO', related_name='comparisons')
    
    # Period
    financial_year = models.CharField(max_length=10)
    
    # Metrics for Comparison
    metrics = models.JSONField(
        default=dict,
        help_text="""
        {
            'fpo_id': {
                'revenue': 5000000,
                'members': 250,
                'production': 1500,
                'avg_member_income': 25000,
                ...
            }
        }
        """
    )
    
    # Rankings
    rankings = models.JSONField(
        default=dict,
        help_text="Rankings for each metric"
    )
    
    # Best Practices
    top_performers = models.JSONField(default=list)
    best_practices_identified = models.TextField(blank=True)
    
    # Insights
    key_insights = models.TextField()
    recommendations = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_comparisons'
        verbose_name = 'FPO Comparison'
        verbose_name_plural = 'FPO Comparisons'
    
    def __str__(self):
        return f"{self.comparison_name} - {self.financial_year}"