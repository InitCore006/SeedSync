from django.db import models
import uuid

class PolicyMetric(models.Model):
    """Government policy metrics and KPIs"""
    
    METRIC_CATEGORY_CHOICES = [
        ('production', 'Production Metrics'),
        ('area', 'Area Coverage Metrics'),
        ('fpo', 'FPO Performance Metrics'),
        ('price', 'Price Stability Metrics'),
        ('import_export', 'Trade Metrics'),
        ('farmer_income', 'Farmer Income Metrics'),
        ('subsidy', 'Subsidy Utilization'),
        ('infrastructure', 'Infrastructure Development'),
        ('technology', 'Technology Adoption'),
        ('sustainability', 'Sustainability Metrics'),
    ]
    
    SCOPE_CHOICES = [
        ('national', 'National'),
        ('state', 'State'),
        ('district', 'District'),
        ('block', 'Block'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Metric Definition
    metric_name = models.CharField(max_length=200)
    metric_code = models.CharField(max_length=50, unique=True, db_index=True)
    metric_category = models.CharField(max_length=30, choices=METRIC_CATEGORY_CHOICES)
    description = models.TextField()
    
    # Scope
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    block = models.CharField(max_length=100, blank=True)
    
    # Period
    financial_year = models.CharField(max_length=10)
    quarter = models.IntegerField(
        null=True,
        blank=True,
        choices=[
            (1, 'Q1 (Apr-Jun)'),
            (2, 'Q2 (Jul-Sep)'),
            (3, 'Q3 (Oct-Dec)'),
            (4, 'Q4 (Jan-Mar)'),
        ]
    )
    month = models.IntegerField(null=True, blank=True)
    
    # Metric Value
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50, help_text="Unit of measurement")
    
    # Target & Baseline
    baseline_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    target_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Target as per NMEO-OP or state plan"
    )
    achievement_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Trend Analysis
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
    trend_direction = models.CharField(
        max_length=20,
        choices=[
            ('upward', 'Upward'),
            ('downward', 'Downward'),
            ('stable', 'Stable'),
        ],
        blank=True
    )
    
    # NMEO-OP Alignment
    nmeo_op_aligned = models.BooleanField(default=True)
    nmeo_op_target = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Data Quality
    data_source = models.CharField(max_length=200)
    data_reliability_score = models.IntegerField(
        default=100,
        help_text="Reliability score 0-100"
    )
    last_verified_date = models.DateField(null=True, blank=True)
    
    # Status Indicators
    status = models.CharField(
        max_length=20,
        choices=[
            ('on_track', 'On Track'),
            ('behind', 'Behind Target'),
            ('critical', 'Critical'),
            ('achieved', 'Target Achieved'),
        ],
        default='on_track'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'policy_metrics'
        verbose_name = 'Policy Metric'
        verbose_name_plural = 'Policy Metrics'
        unique_together = ['metric_code', 'scope', 'state', 'district', 'financial_year', 'quarter']
        indexes = [
            models.Index(fields=['metric_category', 'scope']),
            models.Index(fields=['financial_year']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.metric_name} - {self.scope} - FY{self.financial_year}"


class ForecastModel(models.Model):
    """AI-powered forecasting models for policy planning"""
    
    MODEL_TYPE_CHOICES = [
        ('production', 'Production Forecast'),
        ('price', 'Price Forecast'),
        ('demand', 'Demand Forecast'),
        ('import', 'Import Requirement Forecast'),
        ('area', 'Area Coverage Forecast'),
        ('yield', 'Yield Forecast'),
        ('revenue', 'Revenue Forecast'),
    ]
    
    ALGORITHM_CHOICES = [
        ('arima', 'ARIMA'),
        ('sarima', 'SARIMA'),
        ('lstm', 'LSTM Neural Network'),
        ('prophet', 'Facebook Prophet'),
        ('random_forest', 'Random Forest'),
        ('gradient_boosting', 'Gradient Boosting'),
        ('ensemble', 'Ensemble Method'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Model Details
    model_name = models.CharField(max_length=200)
    model_code = models.CharField(max_length=50, unique=True)
    model_type = models.CharField(max_length=30, choices=MODEL_TYPE_CHOICES)
    algorithm = models.CharField(max_length=30, choices=ALGORITHM_CHOICES)
    
    # Crop Specificity
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='forecast_models'
    )
    
    # Geographic Scope
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('state', 'State'),
            ('district', 'District'),
        ]
    )
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    
    # Model Configuration
    input_features = models.JSONField(
        default=list,
        help_text="List of input features used"
    )
    hyperparameters = models.JSONField(
        default=dict,
        help_text="Model hyperparameters"
    )
    
    # Training Details
    training_data_period_start = models.DateField()
    training_data_period_end = models.DateField()
    training_date = models.DateField()
    training_samples = models.IntegerField()
    
    # Model Performance
    accuracy_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Accuracy percentage"
    )
    rmse = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True,
        help_text="Root Mean Square Error"
    )
    mae = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True,
        help_text="Mean Absolute Error"
    )
    r2_score = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        help_text="R-squared score"
    )
    
    # Validation
    validation_method = models.CharField(
        max_length=50,
        choices=[
            ('train_test_split', 'Train-Test Split'),
            ('cross_validation', 'Cross Validation'),
            ('time_series_cv', 'Time Series CV'),
        ]
    )
    validation_accuracy = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Forecast Horizon
    forecast_horizon_months = models.IntegerField(
        help_text="How many months ahead can this model predict"
    )
    
    # Model Version
    version = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    
    # Model File
    model_file_path = models.CharField(max_length=500, help_text="Path to saved model file")
    
    # Usage Statistics
    total_predictions = models.IntegerField(default=0)
    average_prediction_time_ms = models.IntegerField(default=0)
    
    # Created By
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_models'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'forecast_models'
        verbose_name = 'Forecast Model'
        verbose_name_plural = 'Forecast Models'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.model_name} (v{self.version})"


class ForecastResult(models.Model):
    """Generated forecast results"""
    
    forecast_model = models.ForeignKey(
        ForecastModel,
        on_delete=models.CASCADE,
        related_name='results'
    )
    
    # Forecast Period
    forecast_for_year = models.IntegerField()
    forecast_for_quarter = models.IntegerField(null=True, blank=True)
    forecast_for_month = models.IntegerField(null=True, blank=True)
    forecast_for_season = models.CharField(
        max_length=10,
        choices=[
            ('kharif', 'Kharif'),
            ('rabi', 'Rabi'),
            ('zaid', 'Zaid'),
        ],
        blank=True
    )
    
    # Generated On
    generated_date = models.DateField(auto_now_add=True)
    
    # Forecast Values
    forecasted_value = models.DecimalField(max_digits=15, decimal_places=2)
    unit = models.CharField(max_length=50)
    
    # Confidence Intervals
    confidence_level = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=95.00
    )
    lower_bound = models.DecimalField(max_digits=15, decimal_places=2)
    upper_bound = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Actual Value (for validation after period ends)
    actual_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    forecast_error = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    forecast_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Assumptions
    assumptions = models.JSONField(
        default=dict,
        help_text="Key assumptions made in forecast"
    )
    
    # Risk Factors
    risk_factors = models.JSONField(
        default=list,
        help_text="Identified risk factors"
    )
    
    class Meta:
        db_table = 'forecast_results'
        verbose_name = 'Forecast Result'
        verbose_name_plural = 'Forecast Results'
        ordering = ['-generated_date']
        unique_together = ['forecast_model', 'forecast_for_year', 'forecast_for_quarter']
    
    def __str__(self):
        return f"{self.forecast_model.model_name} - {self.forecast_for_year}"


class SimulationResult(models.Model):
    """Policy impact simulation results"""
    
    SIMULATION_TYPE_CHOICES = [
        ('subsidy', 'Subsidy Impact'),
        ('msp', 'MSP Change Impact'),
        ('infrastructure', 'Infrastructure Investment'),
        ('fpo_expansion', 'FPO Expansion'),
        ('technology', 'Technology Adoption'),
        ('price_support', 'Price Support Mechanism'),
        ('import_policy', 'Import Policy Change'),
        ('credit', 'Credit Policy'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Simulation Details
    simulation_name = models.CharField(max_length=200)
    simulation_code = models.CharField(max_length=50, unique=True)
    simulation_type = models.CharField(max_length=30, choices=SIMULATION_TYPE_CHOICES)
    
    # Policy Intervention
    policy_description = models.TextField()
    intervention_details = models.JSONField(
        default=dict,
        help_text="Details of the policy intervention"
    )
    
    # Scope
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('state', 'State'),
            ('district', 'District'),
        ]
    )
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    
    # Timeframe
    simulation_period_years = models.IntegerField()
    baseline_year = models.IntegerField()
    
    # Budget/Investment
    estimated_budget = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Estimated budget in INR Crores"
    )
    
    # Baseline Scenario
    baseline_metrics = models.JSONField(
        default=dict,
        help_text="Baseline values of key metrics"
    )
    
    # Projected Impact
    projected_metrics = models.JSONField(
        default=dict,
        help_text="Projected values after intervention"
    )
    
    # Key Outcomes
    production_increase_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    farmer_income_increase_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    import_reduction_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    fpo_coverage_increase = models.IntegerField(null=True, blank=True)
    
    # Cost-Benefit Analysis
    total_cost = models.DecimalField(max_digits=15, decimal_places=2)
    total_benefit = models.DecimalField(max_digits=15, decimal_places=2)
    benefit_cost_ratio = models.DecimalField(max_digits=6, decimal_places=2)
    roi_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Beneficiaries
    estimated_beneficiaries = models.IntegerField()
    per_beneficiary_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Risks & Challenges
    risks = models.JSONField(default=list)
    mitigation_strategies = models.JSONField(default=list)
    
    # Recommendations
    implementation_roadmap = models.TextField()
    monitoring_indicators = models.JSONField(default=list)
    
    # Model Used
    forecast_model = models.ForeignKey(
        ForecastModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Simulation Date
    simulation_date = models.DateField(auto_now_add=True)
    conducted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Approval Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('submitted', 'Submitted for Review'),
            ('approved', 'Approved'),
            ('implemented', 'Being Implemented'),
        ],
        default='draft'
    )
    
    # Documents
    detailed_report = models.FileField(
        upload_to='simulations/reports/',
        null=True,
        blank=True
    )
    presentation = models.FileField(
        upload_to='simulations/presentations/',
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'simulation_results'
        verbose_name = 'Simulation Result'
        verbose_name_plural = 'Simulation Results'
        ordering = ['-simulation_date']
    
    def __str__(self):
        return f"{self.simulation_name} - BCR: {self.benefit_cost_ratio}"


class Recommendation(models.Model):
    """AI-generated policy recommendations"""
    
    RECOMMENDATION_TYPE_CHOICES = [
        ('budget_allocation', 'Budget Allocation'),
        ('subsidy_revision', 'Subsidy Revision'),
        ('msp_adjustment', 'MSP Adjustment'),
        ('infrastructure', 'Infrastructure Investment'),
        ('fpo_support', 'FPO Support Program'),
        ('technology', 'Technology Adoption'),
        ('market_intervention', 'Market Intervention'),
        ('import_policy', 'Import Policy'),
        ('credit', 'Credit Policy'),
        ('risk_mitigation', 'Risk Mitigation'),
    ]
    
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recommendation Details
    recommendation_code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=300)
    recommendation_type = models.CharField(max_length=30, choices=RECOMMENDATION_TYPE_CHOICES)
    
    # Description
    problem_statement = models.TextField(help_text="What problem does this address?")
    proposed_solution = models.TextField()
    expected_outcomes = models.TextField()
    
    # Priority
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    urgency_score = models.IntegerField(
        help_text="Urgency score 0-100",
        default=50
    )
    
    # Scope
    scope = models.CharField(
        max_length=20,
        choices=[
            ('national', 'National'),
            ('state', 'State'),
            ('district', 'District'),
        ]
    )
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    
    # Crop Specific
    crop = models.ForeignKey(
        'crops.CropMaster',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Financial Implications
    estimated_budget_required = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Budget required in INR Crores"
    )
    expected_roi_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    payback_period_years = models.IntegerField(null=True, blank=True)
    
    # Implementation
    implementation_timeframe = models.CharField(
        max_length=50,
        choices=[
            ('immediate', 'Immediate (0-3 months)'),
            ('short_term', 'Short-term (3-12 months)'),
            ('medium_term', 'Medium-term (1-3 years)'),
            ('long_term', 'Long-term (3+ years)'),
        ]
    )
    implementing_agency = models.CharField(max_length=200)
    required_approvals = models.JSONField(default=list)
    
    # Impact Metrics
    expected_production_increase = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Expected increase %"
    )
    expected_income_increase = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Expected increase %"
    )
    beneficiaries_count = models.IntegerField(null=True, blank=True)
    
    # Data Sources
    data_sources = models.JSONField(
        default=list,
        help_text="Sources of data used for this recommendation"
    )
    
    # AI Model
    generated_by_model = models.ForeignKey(
        ForecastModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="AI confidence score 0-100"
    )
    
    # Related Simulation
    simulation_result = models.ForeignKey(
        SimulationResult,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('generated', 'Generated'),
            ('under_review', 'Under Review'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('implemented', 'Being Implemented'),
            ('completed', 'Implementation Completed'),
        ],
        default='generated'
    )
    
    # Review
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_recommendations'
    )
    review_date = models.DateField(null=True, blank=True)
    review_comments = models.TextField(blank=True)
    
    # Documents
    detailed_report = models.FileField(
        upload_to='recommendations/reports/',
        null=True,
        blank=True
    )
    
    # Timestamps
    generated_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recommendations'
        verbose_name = 'Recommendation'
        verbose_name_plural = 'Recommendations'
        ordering = ['-urgency_score', '-generated_date']
        indexes = [
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['recommendation_type']),
        ]
    
    def __str__(self):
        return f"{self.recommendation_code} - {self.title}"


class FPOHealthScore(models.Model):
    """FPO health scoring and performance monitoring"""
    
    HEALTH_STATUS_CHOICES = [
        ('excellent', 'Excellent (80-100)'),
        ('good', 'Good (60-79)'),
        ('average', 'Average (40-59)'),
        ('poor', 'Poor (20-39)'),
        ('critical', 'Critical (0-19)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # FPO
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='health_scores')
    
    # Assessment Period
    assessment_date = models.DateField()
    financial_year = models.CharField(max_length=10)
    quarter = models.IntegerField(
        choices=[
            (1, 'Q1'),
            (2, 'Q2'),
            (3, 'Q3'),
            (4, 'Q4'),
        ]
    )
    
    # Overall Score
    overall_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Overall health score 0-100"
    )
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES)
    
    # Component Scores (Each out of 100)
    
    # 1. Financial Health (30%)
    financial_score = models.DecimalField(max_digits=5, decimal_places=2)
    revenue_growth_rate = models.DecimalField(max_digits=6, decimal_places=2)
    profit_margin = models.DecimalField(max_digits=6, decimal_places=2)
    debt_equity_ratio = models.DecimalField(max_digits=6, decimal_places=2)
    working_capital_adequacy = models.DecimalField(max_digits=5, decimal_places=2)
    
    # 2. Operational Efficiency (25%)
    operational_score = models.DecimalField(max_digits=5, decimal_places=2)
    procurement_efficiency = models.DecimalField(max_digits=5, decimal_places=2)
    storage_utilization = models.DecimalField(max_digits=5, decimal_places=2)
    logistics_efficiency = models.DecimalField(max_digits=5, decimal_places=2)
    processing_capacity_utilization = models.DecimalField(max_digits=5, decimal_places=2)
    
    # 3. Member Engagement (20%)
    member_engagement_score = models.DecimalField(max_digits=5, decimal_places=2)
    active_member_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    member_retention_rate = models.DecimalField(max_digits=5, decimal_places=2)
    average_member_income_increase = models.DecimalField(max_digits=6, decimal_places=2)
    member_satisfaction_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    # 4. Governance & Compliance (15%)
    governance_score = models.DecimalField(max_digits=5, decimal_places=2)
    board_meeting_frequency = models.IntegerField()
    agm_conducted_on_time = models.BooleanField()
    audit_completed = models.BooleanField()
    compliance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    # 5. Market Linkages (10%)
    market_linkage_score = models.DecimalField(max_digits=5, decimal_places=2)
    number_of_buyers = models.IntegerField()
    value_of_contracts = models.DecimalField(max_digits=15, decimal_places=2)
    price_realization_vs_mandi = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Key Metrics
    total_members = models.IntegerField()
    active_members = models.IntegerField()
    total_turnover = models.DecimalField(max_digits=15, decimal_places=2)
    net_profit = models.DecimalField(max_digits=12, decimal_places=2)
    share_capital = models.DecimalField(max_digits=12, decimal_places=2)
    reserves = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Trend Analysis
    previous_quarter_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    score_change = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    trend = models.CharField(
        max_length=20,
        choices=[
            ('improving', 'Improving'),
            ('stable', 'Stable'),
            ('declining', 'Declining'),
        ],
        blank=True
    )
    
    # Strengths & Weaknesses
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    
    # Recommendations
    recommendations = models.TextField()
    priority_interventions = models.JSONField(default=list)
    
    # Comparison
    state_rank = models.IntegerField(null=True, blank=True)
    district_rank = models.IntegerField(null=True, blank=True)
    
    # Assessment By
    assessed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_health_scores'
        verbose_name = 'FPO Health Score'
        verbose_name_plural = 'FPO Health Scores'
        unique_together = ['fpo', 'financial_year', 'quarter']
        ordering = ['-assessment_date']
        indexes = [
            models.Index(fields=['overall_score']),
            models.Index(fields=['health_status']),
        ]
    
    def __str__(self):
        return f"{self.fpo.name} - {self.health_status} ({self.overall_score})"


class DistrictPerformance(models.Model):
    """District-wise performance heatmap data"""
    
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Period
    financial_year = models.CharField(max_length=10)
    quarter = models.IntegerField()
    
    # Production Metrics
    total_oilseed_production = models.DecimalField(max_digits=15, decimal_places=2)
    production_target = models.DecimalField(max_digits=15, decimal_places=2)
    production_achievement_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Area Coverage
    area_under_oilseeds = models.DecimalField(max_digits=12, decimal_places=2)
    area_target = models.DecimalField(max_digits=12, decimal_places=2)
    area_achievement_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    
    # FPO Coverage
    number_of_fpos = models.IntegerField()
    fpo_coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    farmers_in_fpos = models.IntegerField()
    
    # Economic Metrics
    average_farmer_income = models.DecimalField(max_digits=12, decimal_places=2)
    income_growth_rate = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Performance Score
    overall_performance_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Composite score 0-100"
    )
    performance_grade = models.CharField(
        max_length=10,
        choices=[
            ('A+', 'Excellent (90-100)'),
            ('A', 'Very Good (80-89)'),
            ('B', 'Good (70-79)'),
            ('C', 'Average (60-69)'),
            ('D', 'Below Average (50-59)'),
            ('F', 'Poor (<50)'),
        ]
    )
    
    # Ranking
    state_rank = models.IntegerField()
    national_rank = models.IntegerField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'district_performance'
        verbose_name = 'District Performance'
        verbose_name_plural = 'District Performances'
        unique_together = ['district', 'state', 'financial_year', 'quarter']
    
    def __str__(self):
        return f"{self.district}, {self.state} - Grade {self.performance_grade}"


class ImportDependencyAnalysis(models.Model):
    """Import dependency tracking and analysis"""
    
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    
    # Period
    year = models.IntegerField()
    quarter = models.IntegerField(null=True, blank=True)
    
    # Domestic Supply
    domestic_production = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Domestic production in tonnes"
    )
    domestic_consumption = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Import Data
    total_imports = models.DecimalField(max_digits=15, decimal_places=2)
    import_value_inr = models.DecimalField(max_digits=15, decimal_places=2)
    average_import_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Top Import Sources
    top_import_countries = models.JSONField(
        default=list,
        help_text="List of countries with import volumes"
    )
    
    # Dependency Metrics
    import_dependency_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="% of consumption met by imports"
    )
    self_sufficiency_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Gap Analysis
    supply_demand_gap = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Projections
    projected_next_year_import = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Policy Implications
    policy_recommendations = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'import_dependency_analysis'
        verbose_name = 'Import Dependency Analysis'
        verbose_name_plural = 'Import Dependency Analyses'
        unique_together = ['crop', 'year', 'quarter']
    
    def __str__(self):
        return f"{self.crop.name} - {self.year} - {self.import_dependency_percentage}% dependent"