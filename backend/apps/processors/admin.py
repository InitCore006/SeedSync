"""Processors Admin"""
from django.contrib import admin
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch

admin.site.register(ProcessorProfile)
admin.site.register(ProcessingPlant)
admin.site.register(ProcessingBatch)
