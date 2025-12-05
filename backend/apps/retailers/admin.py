"""Retailers Admin"""
from django.contrib import admin
from .models import RetailerProfile, Store

admin.site.register(RetailerProfile)
admin.site.register(Store)
