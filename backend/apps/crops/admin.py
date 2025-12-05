"""
Admin Configuration for Crops App
"""
from django.contrib import admin
from .models import CropMaster, CropVariety, MandiPrice, MSPRecord

admin.site.register(CropMaster)
admin.site.register(CropVariety)
admin.site.register(MandiPrice)
admin.site.register(MSPRecord)

