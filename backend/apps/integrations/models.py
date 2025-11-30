from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid

class ExternalService(models.Model):
    """External service/API configuration"""
    
    SERVICE_TYPE_CHOICES = [
        ('agri_stack', 'Agri-Stack'),
        ('weather', 'Weather API'),
        ('satellite', 'Satellite Data'),
        ('payment_gateway', 'Payment Gateway'),
        ('sms_gateway', 'SMS Gateway'),
        ('email_service', 'Email Service'),
        ('government_scheme', 'Government Scheme API'),
        ('ename', 'eNAM Portal'),
        ('digilocker', 'DigiLocker'),
        ('upi', 'UPI Payment'),
        ('nabard', 'NABARD FPO Database'),
        ('sfac', 'SFAC Portal'),
        ('fci', 'FCI Portal'),
        ('pmfby', 'PMFBY (Crop Insurance)'),
        ('kcc', 'Kisan Credit Card'),
        ('bhuvan', 'ISRO Bhuvan'),
        ('imd', 'India Meteorological Department'),
        ('whatsapp', 'WhatsApp Business API'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Service Details
    service_name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=30, choices=SERVICE_TYPE_CHOICES)
    service_code = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Provider
    provider_name = models.CharField(max_length=200)
    provider_website = models.URLField(blank=True)
    
    # API Configuration
    base_url = models.URLField(help_text="Base API URL")
    api_version = models.CharField(max_length=20, default='v1')
    
    # Authentication
    auth_type = models.CharField(
        max_length=20,
        choices=[
            ('api_key', 'API Key'),
            ('oauth2', 'OAuth 2.0'),
            ('basic', 'Basic Auth'),
            ('bearer', 'Bearer Token'),
            ('jwt', 'JWT'),
            ('none', 'No Authentication'),
        ]
    )
    
    # Credentials (encrypted in production)
    api_key = models.CharField(max_length=500, blank=True)
    api_secret = models.CharField(max_length=500, blank=True)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    
    # Additional Headers
    custom_headers = models.JSONField(
        default=dict,
        help_text="Custom headers to send with requests"
    )
    
    # Rate Limiting
    rate_limit_per_minute = models.IntegerField(
        default=60,
        help_text="Max requests per minute"
    )
    rate_limit_per_day = models.IntegerField(
        default=10000,
        help_text="Max requests per day"
    )
    
    # Timeout Settings
    connection_timeout = models.IntegerField(default=10, help_text="Timeout in seconds")
    read_timeout = models.IntegerField(default=30, help_text="Timeout in seconds")
    
    # Retry Configuration
    max_retries = models.IntegerField(default=3)
    retry_delay_seconds = models.IntegerField(default=5)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_enabled = models.BooleanField(default=True)
    
    # Health Monitoring
    last_health_check = models.DateTimeField(null=True, blank=True)
    health_check_url = models.URLField(blank=True)
    is_healthy = models.BooleanField(default=True)
    consecutive_failures = models.IntegerField(default=0)
    
    # Usage Statistics
    total_requests = models.IntegerField(default=0)
    successful_requests = models.IntegerField(default=0)
    failed_requests = models.IntegerField(default=0)
    average_response_time_ms = models.IntegerField(default=0)
    
    # Costs
    cost_per_request = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text="Cost in INR"
    )
    monthly_subscription_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    total_cost_incurred = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Documentation
    documentation_url = models.URLField(blank=True)
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=15, blank=True)
    
    # Webhook Configuration
    webhook_enabled = models.BooleanField(default=False)
    webhook_url = models.URLField(blank=True)
    webhook_secret = models.CharField(max_length=200, blank=True)
    
    # Contact Person
    technical_contact_name = models.CharField(max_length=200, blank=True)
    technical_contact_email = models.EmailField(blank=True)
    technical_contact_phone = models.CharField(max_length=15, blank=True)
    
    # Contract Details
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    auto_renewal = models.BooleanField(default=False)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'external_services'
        verbose_name = 'External Service'
        verbose_name_plural = 'External Services'
        indexes = [
            models.Index(fields=['service_type']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.service_name} ({self.get_service_type_display()})"


class APIKey(models.Model):
    """API keys for external access to SeedSync"""
    
    KEY_TYPE_CHOICES = [
        ('full_access', 'Full Access'),
        ('read_only', 'Read Only'),
        ('write_only', 'Write Only'),
        ('limited', 'Limited Access'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Key Details
    key_name = models.CharField(max_length=200)
    api_key = models.CharField(max_length=64, unique=True, db_index=True)
    api_secret = models.CharField(max_length=64)
    
    # Owner
    organization = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='api_keys'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='api_keys'
    )
    
    # Access Control
    key_type = models.CharField(max_length=20, choices=KEY_TYPE_CHOICES)
    allowed_endpoints = models.JSONField(
        default=list,
        help_text="List of allowed API endpoints"
    )
    allowed_ip_addresses = models.JSONField(
        default=list,
        help_text="Whitelist of IP addresses"
    )
    
    # Rate Limiting
    rate_limit_per_minute = models.IntegerField(default=100)
    rate_limit_per_hour = models.IntegerField(default=1000)
    rate_limit_per_day = models.IntegerField(default=10000)
    
    # Validity
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Usage Statistics
    total_requests = models.IntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)
    last_used_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Security
    can_rotate = models.BooleanField(default=True)
    last_rotated_at = models.DateTimeField(null=True, blank=True)
    rotation_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_keys'
        verbose_name = 'API Key'
        verbose_name_plural = 'API Keys'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.key_name} - {self.key_type}"


class IntegrationLog(models.Model):
    """Detailed logging of all external API calls"""
    
    REQUEST_METHOD_CHOICES = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('timeout', 'Timeout'),
        ('rate_limited', 'Rate Limited'),
        ('unauthorized', 'Unauthorized'),
        ('not_found', 'Not Found'),
        ('server_error', 'Server Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Service
    external_service = models.ForeignKey(
        ExternalService,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    # Request Details
    endpoint = models.CharField(max_length=500)
    request_method = models.CharField(max_length=10, choices=REQUEST_METHOD_CHOICES)
    request_url = models.TextField()
    
    # Request Data
    request_headers = models.JSONField(default=dict)
    request_params = models.JSONField(default=dict, blank=True)
    request_body = models.JSONField(default=dict, blank=True)
    
    # Response Details
    response_status_code = models.IntegerField(null=True, blank=True)
    response_headers = models.JSONField(default=dict, blank=True)
    response_body = models.JSONField(default=dict, blank=True)
    
    # Performance
    response_time_ms = models.IntegerField(help_text="Response time in milliseconds")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Error Details
    error_message = models.TextField(blank=True)
    error_code = models.CharField(max_length=50, blank=True)
    stack_trace = models.TextField(blank=True)
    
    # Retry Information
    is_retry = models.BooleanField(default=False)
    retry_attempt = models.IntegerField(default=0)
    original_request_id = models.UUIDField(null=True, blank=True)
    
    # Context
    triggered_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    source_module = models.CharField(
        max_length=50,
        help_text="Module that triggered this API call"
    )
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.CharField(max_length=50, blank=True)
    
    # IP Address
    client_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Cost
    request_cost = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0
    )
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'integration_logs'
        verbose_name = 'Integration Log'
        verbose_name_plural = 'Integration Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['external_service', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.external_service.service_name} - {self.request_method} {self.endpoint}"


class AgriStackIntegration(models.Model):
    """Agri-Stack specific integration data"""
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('failed', 'Verification Failed'),
        ('expired', 'Expired'),
    ]
    
    # Farmer
    farmer = models.OneToOneField(
        'farmers.Farmer',
        on_delete=models.CASCADE,
        related_name='agri_stack_data'
    )
    
    # Farmer ID
    agri_stack_farmer_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Land Records
    land_records_synced = models.BooleanField(default=False)
    land_records_last_sync = models.DateTimeField(null=True, blank=True)
    total_land_area_from_agristack = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        null=True,
        blank=True
    )
    
    # DigiLocker Integration
    digilocker_linked = models.BooleanField(default=False)
    digilocker_documents = models.JSONField(
        default=list,
        help_text="List of documents fetched from DigiLocker"
    )
    
    # Aadhaar Verification
    aadhaar_verified = models.BooleanField(default=False)
    aadhaar_verification_date = models.DateTimeField(null=True, blank=True)
    aadhaar_last_four_digits = models.CharField(max_length=4, blank=True)
    
    # Bank Account Verification
    bank_account_verified = models.BooleanField(default=False)
    bank_verification_date = models.DateTimeField(null=True, blank=True)
    
    # Crop Insurance (PMFBY)
    pmfby_enrolled = models.BooleanField(default=False)
    pmfby_policy_number = models.CharField(max_length=50, blank=True)
    pmfby_data = models.JSONField(default=dict, blank=True)
    
    # KCC Details
    has_kisan_credit_card = models.BooleanField(default=False)
    kcc_number = models.CharField(max_length=50, blank=True)
    kcc_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    kcc_data = models.JSONField(default=dict, blank=True)
    
    # Soil Health Card
    soil_health_card_number = models.CharField(max_length=50, blank=True)
    soil_health_data = models.JSONField(default=dict, blank=True)
    soil_health_last_updated = models.DateField(null=True, blank=True)
    
    # PM-KISAN
    pm_kisan_beneficiary = models.BooleanField(default=False)
    pm_kisan_registration_number = models.CharField(max_length=50, blank=True)
    
    # Status
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending'
    )
    
    # Sync Status
    last_full_sync = models.DateTimeField(null=True, blank=True)
    sync_errors = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agri_stack_integrations'
        verbose_name = 'Agri-Stack Integration'
        verbose_name_plural = 'Agri-Stack Integrations'
    
    def __str__(self):
        return f"{self.farmer.user.full_name} - {self.agri_stack_farmer_id}"


class WeatherAPICache(models.Model):
    """Cache for weather API responses"""
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=200)
    
    # Weather Data
    weather_data = models.JSONField(
        default=dict,
        help_text="Current weather data"
    )
    forecast_data = models.JSONField(
        default=list,
        help_text="7-day forecast"
    )
    
    # Metadata
    data_source = models.CharField(
        max_length=50,
        choices=[
            ('imd', 'India Meteorological Department'),
            ('openweather', 'OpenWeatherMap'),
            ('weatherapi', 'WeatherAPI.com'),
        ]
    )
    
    # Cache Info
    cached_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    is_valid = models.BooleanField(default=True)
    
    # Usage
    access_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'weather_api_cache'
        verbose_name = 'Weather API Cache'
        verbose_name_plural = 'Weather API Cache'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.location_name} - {self.cached_at}"


class PaymentGatewayTransaction(models.Model):
    """Payment gateway integration tracking"""
    
    TRANSACTION_TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('refund', 'Refund'),
        ('payout', 'Payout'),
    ]
    
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    GATEWAY_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('paytm', 'Paytm'),
        ('phonepe', 'PhonePe'),
        ('upi', 'UPI'),
        ('neft', 'NEFT'),
        ('rtgs', 'RTGS'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Transaction Details
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    
    # Amount
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    gateway_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    gst_on_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Gateway IDs
    internal_transaction_id = models.CharField(max_length=100, unique=True)
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    gateway_order_id = models.CharField(max_length=100, blank=True)
    
    # Payer/Payee
    payer = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='payments_made'
    )
    payee = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='payments_received',
        null=True,
        blank=True
    )
    
    # Related Objects
    related_order = models.ForeignKey(
        'marketplace.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    related_procurement = models.ForeignKey(
        'procurement.ProcurementOrder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    
    # Gateway Response
    gateway_response = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Webhook
    webhook_received = models.BooleanField(default=False)
    webhook_data = models.JSONField(default=dict, blank=True)
    
    # Retry
    retry_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'payment_gateway_transactions'
        verbose_name = 'Payment Gateway Transaction'
        verbose_name_plural = 'Payment Gateway Transactions'
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['internal_transaction_id']),
            models.Index(fields=['gateway_transaction_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.gateway} - ₹{self.amount} - {self.status}"


class SatelliteDataFetch(models.Model):
    """Satellite imagery and data fetching logs"""
    
    DATA_TYPE_CHOICES = [
        ('ndvi', 'NDVI (Vegetation Index)'),
        ('soil_moisture', 'Soil Moisture'),
        ('land_cover', 'Land Cover'),
        ('crop_health', 'Crop Health'),
        ('rainfall', 'Rainfall Estimate'),
    ]
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    area_polygon = models.JSONField(
        default=dict,
        help_text="GeoJSON polygon for area"
    )
    
    # Data Type
    data_type = models.CharField(max_length=20, choices=DATA_TYPE_CHOICES)
    
    # Source
    satellite_source = models.CharField(
        max_length=50,
        choices=[
            ('bhuvan', 'ISRO Bhuvan'),
            ('sentinel', 'Sentinel'),
            ('landsat', 'Landsat'),
            ('modis', 'MODIS'),
        ]
    )
    
    # Time Period
    from_date = models.DateField()
    to_date = models.DateField()
    
    # Data
    data_url = models.URLField(blank=True)
    data_file = models.FileField(upload_to='satellite_data/', null=True, blank=True)
    processed_data = models.JSONField(default=dict)
    
    # Analysis
    analysis_results = models.JSONField(default=dict, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('requested', 'Requested'),
            ('fetching', 'Fetching'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ]
    )
    
    # Requested By
    requested_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Related Farm
    farm = models.ForeignKey(
        'farmers.FarmPlot',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='satellite_data'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'satellite_data_fetches'
        verbose_name = 'Satellite Data Fetch'
        verbose_name_plural = 'Satellite Data Fetches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_data_type_display()} - {self.from_date} to {self.to_date}"