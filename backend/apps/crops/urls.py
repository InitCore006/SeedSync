from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CropViewSet, CropInputViewSet, CropObservationViewSet,
    HarvestRecordViewSet, CropTransactionViewSet, CropPredictionViewSet
)

app_name = 'crops'

router = DefaultRouter()
router.register(r'crops', CropViewSet, basename='crop')
router.register(r'inputs', CropInputViewSet, basename='crop-input')
router.register(r'observations', CropObservationViewSet, basename='crop-observation')
router.register(r'harvests', HarvestRecordViewSet, basename='harvest-record')
router.register(r'transactions', CropTransactionViewSet, basename='crop-transaction')
router.register(r'predictions', CropPredictionViewSet, basename='crop-prediction')

urlpatterns = [
    path('', include(router.urls)),
]