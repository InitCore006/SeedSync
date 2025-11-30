from django.db import models
import uuid

class DemandForecast(models.Model):
    """Demand forecasting for oilseeds"""
    
    FORECAST_TYPE_CHOICES = [
        ('domestic', 'Domestic Demand'),
        ('industrial', 'Industrial Demand'),
        ('export', 'Export Demand'),
        ('total', 'Total Demand'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='demand_forecasts')
    
    # Period
    forecast_year = models.IntegerField()
    forecast_quarter = models.IntegerField(
        choices=[
            (1, 'Q1 (Apr-Jun)'),
            (2, 'Q2 (Jul-Sep)'),
            (3, 'Q3 (Oct-Dec)'),
            (4, 'Q4 (Jan-Mar)'),
        ],
        null=True,
        blank=True
    )
    forecast_month = models.IntegerField(null=True, blank=True)
    
    # Forecast Details
    forecast_type = models.CharField(max_length=20, choices=FORECAST_TYPE_CHOICES)
    
    # Demand Quantity
    forecasted_demand = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Forecasted demand in tonnes"
    )
    confidence_interval_lower = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Lower bound"
    )
    confidence_interval_upper = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Upper bound"
    )
    
    # Geographic Scope
    state = models.CharField(max_length=100, blank=True)
    region = models.CharField(
        max_length=20,
        choices=[
            ('north', 'North India'),
            ('south', 'South India'),
            ('east', 'East India'),
            ('west', 'West India'),
            ('central', 'Central India'),
            ('northeast', 'North-East India'),
            ('national', 'National'),
        ],
        default='national'
    )
    
    # AI Model Details
    model_used = models.ForeignKey(
        'advisories.AIModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    model_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Actual vs Forecast (for validation)
    actual_demand = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual demand (filled later)"
    )
    forecast_error_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Factors Considered
    factors_considered = models.JSONField(
        default=dict,
        help_text="{'population_growth': 1.2, 'gdp_growth': 6.5, ...}"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'demand_forecasts'
        verbose_name = 'Demand Forecast'
        verbose_name_plural = 'Demand Forecasts'
        unique_together = ['crop', 'forecast_year', 'forecast_quarter', 'forecast_type', 'region']
        indexes = [
            models.Index(fields=['forecast_year', 'forecast_quarter']),
            models.Index(fields=['region']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.forecast_type} - {self.forecast_year}Q{self.forecast_quarter}"


class SupplyAggregate(models.Model):
    """Supply aggregation from farms and FPOs"""
    
    SOURCE_TYPE_CHOICES = [
        ('farm', 'Individual Farm'),
        ('fpo', 'FPO Collective'),
        ('state', 'State Level'),
        ('national', 'National Level'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='supply_aggregates')
    
    # Source
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, null=True, blank=True)
    
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
    
    # Geographic
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    
    # Supply Data
    total_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total production in quintals"
    )
    marketable_surplus = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Marketable surplus after self-consumption"
    )
    already_sold = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Quantity already sold"
    )
    available_for_sale = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Currently available for sale"
    )
    
    # Quality Distribution
    grade_a_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    grade_b_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    grade_c_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Storage Location
    stored_at_farm = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stored_at_warehouse = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stored_at_fpo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Expected Availability
    expected_harvest_date = models.DateField(null=True, blank=True)
    expected_market_date = models.DateField(null=True, blank=True)
    
    # Data Status
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supply_aggregates'
        verbose_name = 'Supply Aggregate'
        verbose_name_plural = 'Supply Aggregates'
        indexes = [
            models.Index(fields=['season', 'year']),
            models.Index(fields=['state', 'district']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.state} - {self.season} {self.year}"


class PricePrediction(models.Model):
    """Price prediction models and results"""
    
    PREDICTION_HORIZON_CHOICES = [
        ('1_week', '1 Week'),
        ('2_weeks', '2 Weeks'),
        ('1_month', '1 Month'),
        ('3_months', '3 Months'),
        ('6_months', '6 Months'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='price_predictions')
    
    # Location
    mandi_name = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Prediction Date
    prediction_date = models.DateField(db_index=True)
    prediction_for_date = models.DateField()
    prediction_horizon = models.CharField(max_length=10, choices=PREDICTION_HORIZON_CHOICES)
    
    # Price Prediction (per quintal in INR)
    predicted_min_price = models.DecimalField(max_digits=10, decimal_places=2)
    predicted_max_price = models.DecimalField(max_digits=10, decimal_places=2)
    predicted_modal_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Confidence Interval
    confidence_level = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=95.00,
        help_text="Confidence level %"
    )
    lower_bound = models.DecimalField(max_digits=10, decimal_places=2)
    upper_bound = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Model Details
    model_used = models.ForeignKey(
        'advisories.AIModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    algorithm = models.CharField(
        max_length=50,
        choices=[
            ('arima', 'ARIMA'),
            ('lstm', 'LSTM'),
            ('random_forest', 'Random Forest'),
            ('gradient_boosting', 'Gradient Boosting'),
            ('ensemble', 'Ensemble Method'),
        ]
    )
    
    # Input Features
    features_used = models.JSONField(
        default=dict,
        help_text="Features used for prediction"
    )
    
    # Validation (after actual date)
    actual_modal_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    prediction_error = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    prediction_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Trend Indicators
    trend_direction = models.CharField(
        max_length=20,
        choices=[
            ('upward', 'Price Rising'),
            ('downward', 'Price Falling'),
            ('stable', 'Price Stable'),
        ],
        blank=True
    )
    volatility_index = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'price_predictions'
        verbose_name = 'Price Prediction'
        verbose_name_plural = 'Price Predictions'
        indexes = [
            models.Index(fields=['prediction_date']),
            models.Index(fields=['prediction_for_date']),
            models.Index(fields=['mandi_name', 'district']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.mandi_name} - {self.prediction_for_date}"


class MarketTrend(models.Model):
    """Market trend analysis and insights"""
    
    TREND_TYPE_CHOICES = [
        ('price', 'Price Trend'),
        ('demand', 'Demand Trend'),
        ('supply', 'Supply Trend'),
        ('import', 'Import Trend'),
        ('export', 'Export Trend'),
    ]
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE, related_name='market_trends')
    
    trend_type = models.CharField(max_length=20, choices=TREND_TYPE_CHOICES)
    
    # Period
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Geographic Scope
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('regional', 'Regional'),
            ('state', 'State-wise'),
            ('district', 'District-wise'),
        ],
        default='national'
    )
    state = models.CharField(max_length=100, blank=True)
    
    # Trend Analysis
    trend_description = models.TextField()
    key_insights = models.JSONField(default=list, help_text="List of key insights")
    
    # Quantitative Data
    percentage_change = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Percentage change over period"
    )
    absolute_change = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Absolute change in value"
    )
    
    # Comparison
    year_over_year_change = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Factors
    influencing_factors = models.JSONField(
        default=list,
        help_text="Factors influencing the trend"
    )
    
    # Forecast
    future_outlook = models.TextField(blank=True)
    
    # Visualization Data
    chart_data = models.JSONField(
        default=dict,
        help_text="Data for chart rendering"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'market_trends'
        verbose_name = 'Market Trend'
        verbose_name_plural = 'Market Trends'
        indexes = [
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['trend_type']),
        ]
    
    def __str__(self):
        return f"{self.crop.name} - {self.get_trend_type_display()}"


class FPOSupplyPlan(models.Model):
    """FPO collective supply planning"""
    
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='supply_plans')
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    
    # Planning Period
    season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
        ]
    )
    year = models.IntegerField()
    
    # Planned Supply
    planned_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Planned production from all members"
    )
    committed_to_buyers = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Quantity already committed to buyers"
    )
    available_for_sale = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Available for fresh commitments"
    )
    
    # Quality Planning
    target_quality_grade = models.CharField(
        max_length=10,
        choices=[
            ('A', 'Grade A'),
            ('B', 'Grade B'),
            ('C', 'Grade C'),
        ]
    )
    
    # Pricing Strategy
    minimum_acceptable_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Minimum price per quintal"
    )
    target_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Target price per quintal"
    )
    
    # Timeline
    expected_harvest_start = models.DateField()
    expected_harvest_end = models.DateField()
    ready_for_sale_date = models.DateField()
    
    # Member Participation
    participating_members = models.IntegerField()
    total_area_committed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total area in acres"
    )
    
    # Status
    plan_status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('approved', 'Approved'),
            ('active', 'Active'),
            ('completed', 'Completed'),
        ],
        default='draft'
    )
    
    # Actual Performance
    actual_production = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    actual_average_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_supply_plans'
        verbose_name = 'FPO Supply Plan'
        verbose_name_plural = 'FPO Supply Plans'
        unique_together = ['fpo', 'crop', 'season', 'year']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.crop.name} - {self.season} {self.year}"