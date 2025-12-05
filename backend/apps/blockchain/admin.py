"""Blockchain Admin"""
from django.contrib import admin
from .models import BlockchainTransaction, TraceabilityRecord, QRCode

admin.site.register(BlockchainTransaction)
admin.site.register(TraceabilityRecord)
admin.site.register(QRCode)
