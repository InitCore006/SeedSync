"""FPO Admin"""
from django.contrib import admin
from .models import FPOProfile, FPOMembership, FPOWarehouse

admin.site.register(FPOProfile)
admin.site.register(FPOMembership)
admin.site.register(FPOWarehouse)
