from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FPOViewSet, FPOMembershipViewSet,
    FPORegistrationStep1View, FPORegistrationStep2View, FPORegistrationStep3View,
    FPORegistrationSingleStepView
)

router = DefaultRouter()
router.register(r'fpos', FPOViewSet, basename='fpo')
router.register(r'memberships', FPOMembershipViewSet, basename='membership')

urlpatterns = [
    # Multi-step registration
    path('register/step1/', FPORegistrationStep1View.as_view(), name='fpo_register_step1'),
    path('register/step2/', FPORegistrationStep2View.as_view(), name='fpo_register_step2'),
    path('register/step3/', FPORegistrationStep3View.as_view(), name='fpo_register_step3'),
    
    # Single-step registration
    path('register/', FPORegistrationSingleStepView.as_view(), name='fpo_register'),
    
    # ViewSet routes
    path('', include(router.urls)),
]