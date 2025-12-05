"""Marketplace Admin"""
from django.contrib import admin
from .models import Listing, Order, Review

admin.site.register(Listing)
admin.site.register(Order)
admin.site.register(Review)
