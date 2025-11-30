from django.db import models
import uuid

class Notification(models.Model):
    """Multi-channel notification system"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('weather', 'Weather Alert'),
        ('price', 'Price Alert'),
        ('advisory', 'Advisory'),
        ('payment', 'Payment Confirmation'),
        ('meeting', 'Meeting Reminder'),
        ('event', 'Event Notification'),
        ('announcement', 'FPO Announcement'),
        ('procurement', 'Procurement Update'),
        ('quality', 'Quality Alert'),
        ('training', 'Training Invitation'),
        ('subsidy', 'Subsidy Update'),
        ('loan', 'Loan Update'),
        ('general', 'General Notification'),
    ]
    
    CHANNEL_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('whatsapp', 'WhatsApp'),
        ('in_app', 'In-App Notification'),
    ]
    
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Notification Details
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Recipient
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    # Channel
    channels = models.JSONField(
        default=list,
        help_text="List of channels to send through"
    )
    
    # Priority
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Status
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery Status
    delivery_status = models.JSONField(
        default=dict,
        help_text="Status per channel: {'sms': 'delivered', 'email': 'failed'}"
    )
    
    # Action
    action_url = models.URLField(blank=True)
    action_data = models.JSONField(default=dict, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Scheduled
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    # Retry
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['scheduled_for']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"


class AlertRule(models.Model):
    """Configurable alert rules"""
    
    RULE_TYPE_CHOICES = [
        ('weather', 'Weather-based'),
        ('price', 'Price-based'),
        ('inventory', 'Inventory-based'),
        ('quality', 'Quality-based'),
        ('payment', 'Payment-based'),
        ('time', 'Time-based'),
    ]
    
    CONDITION_CHOICES = [
        ('equals', 'Equals'),
        ('not_equals', 'Not Equals'),
        ('greater_than', 'Greater Than'),
        ('less_than', 'Less Than'),
        ('between', 'Between'),
        ('contains', 'Contains'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Rule Details
    rule_name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPE_CHOICES)
    description = models.TextField()
    
    # Conditions
    condition_field = models.CharField(max_length=100)
    condition_operator = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    condition_value = models.CharField(max_length=200)
    
    # Notification Template
    notification_template = models.ForeignKey(
        'MessageTemplate',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Recipients
    recipient_groups = models.JSONField(
        default=list,
        help_text="List of user groups to notify"
    )
    
    # Channels
    notification_channels = models.JSONField(default=list)
    
    # Frequency
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
        ],
        default='immediate'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Statistics
    times_triggered = models.IntegerField(default=0)
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    # Created By
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'alert_rules'
        verbose_name = 'Alert Rule'
        verbose_name_plural = 'Alert Rules'
    
    def __str__(self):
        return self.rule_name


class MessageTemplate(models.Model):
    """Message templates for notifications"""
    
    TEMPLATE_TYPE_CHOICES = [
        ('weather', 'Weather Alert'),
        ('price', 'Price Alert'),
        ('payment', 'Payment Confirmation'),
        ('meeting', 'Meeting Reminder'),
        ('training', 'Training Invitation'),
        ('general', 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Template Details
    template_name = models.CharField(max_length=200)
    template_code = models.CharField(max_length=50, unique=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPE_CHOICES)
    
    # Content
    subject = models.CharField(max_length=200, blank=True)
    sms_content = models.TextField(max_length=160, help_text="SMS template (160 chars)")
    email_content = models.TextField(help_text="Email HTML template")
    push_content = models.TextField(help_text="Push notification content")
    whatsapp_content = models.TextField(blank=True)
    
    # Variables
    variables = models.JSONField(
        default=list,
        help_text="List of variables: ['farmer_name', 'amount', ...]"
    )
    
    # Language
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', 'English'),
            ('hi', 'Hindi'),
            ('te', 'Telugu'),
            ('ta', 'Tamil'),
            ('kn', 'Kannada'),
            ('mr', 'Marathi'),
        ],
        default='en'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Usage Stats
    times_used = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'message_templates'
        verbose_name = 'Message Template'
        verbose_name_plural = 'Message Templates'
    
    def __str__(self):
        return f"{self.template_name} ({self.language})"


class DeliveryLog(models.Model):
    """Notification delivery tracking"""
    
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='delivery_logs'
    )
    
    # Channel
    channel = models.CharField(max_length=20, choices=Notification.CHANNEL_CHOICES)
    
    # Recipient
    recipient = models.CharField(max_length=200, help_text="Phone/Email/Device ID")
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('sent', 'Sent'),
            ('delivered', 'Delivered'),
            ('failed', 'Failed'),
            ('bounced', 'Bounced'),
        ]
    )
    
    # Gateway Response
    gateway_response = models.TextField(blank=True)
    gateway_message_id = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    
    # Error Details
    error_message = models.TextField(blank=True)
    
    # Cost
    delivery_cost = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text="Cost in INR"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_logs'
        verbose_name = 'Delivery Log'
        verbose_name_plural = 'Delivery Logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.channel} - {self.status}"


class FPOAnnouncement(models.Model):
    """FPO announcements to all members"""
    
    ANNOUNCEMENT_TYPE_CHOICES = [
        ('meeting', 'Meeting Announcement'),
        ('procurement', 'Procurement Notice'),
        ('payment', 'Payment Announcement'),
        ('event', 'Event Announcement'),
        ('training', 'Training Program'),
        ('policy', 'Policy Update'),
        ('general', 'General Announcement'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # FPO
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        related_name='announcements'
    )
    
    # Announcement Details
    announcement_type = models.CharField(max_length=20, choices=ANNOUNCEMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Target Audience
    target_all_members = models.BooleanField(default=True)
    target_board_members = models.BooleanField(default=False)
    target_specific_members = models.ManyToManyField(
        'farmers.Farmer',
        related_name='targeted_announcements',
        blank=True
    )
    
    # Channels
    send_via_sms = models.BooleanField(default=True)
    send_via_email = models.BooleanField(default=False)
    send_via_whatsapp = models.BooleanField(default=False)
    send_via_app = models.BooleanField(default=True)
    
    # Attachments
    attachments = models.JSONField(
        default=list,
        help_text="List of attachment URLs"
    )
    
    # Status
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # Stats
    total_recipients = models.IntegerField(default=0)
    delivered_count = models.IntegerField(default=0)
    read_count = models.IntegerField(default=0)
    
    # Created By
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_announcements'
        verbose_name = 'FPO Announcement'
        verbose_name_plural = 'FPO Announcements'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.fpo.name} - {self.title}"