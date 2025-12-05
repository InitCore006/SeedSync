"""Government Dashboard Models"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import OILSEED_CHOICES, INDIAN_STATES


# Note: For hackathon, we don't need persistent models for government stats
# Stats will be calculated on-the-fly from existing data
# This keeps the system simple and focused on functionality
