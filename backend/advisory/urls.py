from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CropTypeViewSet, CropCycleViewSet, WeatherAlertViewSet,
    PestDiseaseDetectionViewSet, CropAdvisoryViewSet
)

router = DefaultRouter()
router.register(r'crop-types', CropTypeViewSet, basename='croptype')
router.register(r'crop-cycles', CropCycleViewSet, basename='cropcycle')
router.register(r'weather-alerts', WeatherAlertViewSet, basename='weatheralert')
router.register(r'pest-detection', PestDiseaseDetectionViewSet, basename='pestdetection')
router.register(r'advisories', CropAdvisoryViewSet, basename='advisory')

urlpatterns = [
    path('', include(router.urls)),
]