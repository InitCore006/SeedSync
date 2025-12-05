"""Logistics Admin"""
from django.contrib import admin
from .models import LogisticsPartner, Vehicle, Shipment

admin.site.register(LogisticsPartner)
admin.site.register(Vehicle)
admin.site.register(Shipment)
