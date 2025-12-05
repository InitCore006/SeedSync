"""
Notifications Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel


class Notification(TimeStampedModel):
    """Notification tracking"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.phone_number}"


class PushToken(TimeStampedModel):
    """Push notification tokens"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='push_tokens')
    token = models.CharField(max_length=500, unique=True)
    device_type = models.CharField(max_length=20)
    
    class Meta:
        db_table = 'push_tokens'
    
    def __str__(self):
        return f"{self.user.phone_number} - {self.device_type}"
