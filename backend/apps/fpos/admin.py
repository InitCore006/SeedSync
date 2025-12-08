"""FPO Admin"""
from django.contrib import admin
from .models import FPOProfile, FPOMembership, FPOWarehouse, FPOJoinRequest

admin.site.register(FPOProfile)
admin.site.register(FPOMembership)
admin.site.register(FPOWarehouse)
admin.site.register(FPOJoinRequest)
