"""\nURL Configuration for Lots App\n"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProcurementLotViewSet

router = DefaultRouter()
router.register(r'procurement', ProcurementLotViewSet, basename='procurement-lot')

app_name = 'lots'
urlpatterns = [
    path('', include(router.urls)),
]
