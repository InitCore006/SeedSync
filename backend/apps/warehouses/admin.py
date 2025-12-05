"""Warehouses Admin"""
from django.contrib import admin
from .models import Warehouse, Inventory, StockMovement, QualityCheck

admin.site.register(Warehouse)
admin.site.register(Inventory)
admin.site.register(StockMovement)
admin.site.register(QualityCheck)
