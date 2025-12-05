"""Payments Admin"""
from django.contrib import admin
from .models import Payment, Transaction, Wallet

admin.site.register(Payment)
admin.site.register(Transaction)
admin.site.register(Wallet)
