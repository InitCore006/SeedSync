from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RetailerViewSet,
    RetailerRegistrationStep1View, RetailerRegistrationStep2View, RetailerRegistrationStep3View,
    RetailerRegistrationSingleStepView
)

router = DefaultRouter()
router.register(r'retailers', RetailerViewSet, basename='retailer')

urlpatterns = [
    # Multi-step registration
    path('register/step1/', RetailerRegistrationStep1View.as_view(), name='retailer_register_step1'),
    path('register/step2/', RetailerRegistrationStep2View.as_view(), name='retailer_register_step2'),
    path('register/step3/', RetailerRegistrationStep3View.as_view(), name='retailer_register_step3'),
    
    # Single-step registration
    path('register/', RetailerRegistrationSingleStepView.as_view(), name='retailer_register'),
    
    # ViewSet routes
    path('', include(router.urls)),
]