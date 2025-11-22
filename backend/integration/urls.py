from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgriStackSyncViewSet, LandRecordViewSet,
    SoilHealthDataViewSet, ExternalAPILogViewSet, SatelliteImageryViewSet
)

router = DefaultRouter()
router.register(r'agristack', AgriStackSyncViewSet, basename='agristack')
router.register(r'land-records', LandRecordViewSet, basename='landrecord')
router.register(r'soil-health', SoilHealthDataViewSet, basename='soilhealth')
router.register(r'api-logs', ExternalAPILogViewSet, basename='apilog')
router.register(r'satellite', SatelliteImageryViewSet, basename='satellite')

urlpatterns = [
    path('', include(router.urls)),
]