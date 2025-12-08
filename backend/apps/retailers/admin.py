"""Retailers Admin"""
from django.contrib import admin
from .models import RetailerProfile, Store, RetailerOrder, OrderItem, RetailerInventory

admin.site.register(RetailerProfile)
admin.site.register(Store)
admin.site.register(RetailerOrder)
admin.site.register(OrderItem)
admin.site.register(RetailerInventory)

