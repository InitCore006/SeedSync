"""
Core Base Models for SeedSync Platform
"""
from django.db import models
import uuid


class TimeStampedModel(models.Model):
    """
    Abstract base model with timestamp fields
    All models should inherit from this
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self):
        """Soft delete by setting is_active to False"""
        self.is_active = False
        self.save()
