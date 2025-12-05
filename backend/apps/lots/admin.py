"""
Admin Configuration for Lots App
"""
from django.contrib import admin
from .models import ProcurementLot, LotImage, LotStatusHistory

admin.site.register(ProcurementLot)
admin.site.register(LotImage)
admin.site.register(LotStatusHistory)

