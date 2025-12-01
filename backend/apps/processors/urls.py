from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProcessorViewSet,
    ProcessorRegistrationStep1View, ProcessorRegistrationStep2View, ProcessorRegistrationStep3View,
    ProcessorRegistrationSingleStepView
)

router = DefaultRouter()
router.register(r'processors', ProcessorViewSet, basename='processor')

urlpatterns = [
    # Multi-step registration
    path('register/step1/', ProcessorRegistrationStep1View.as_view(), name='processor_register_step1'),
    path('register/step2/', ProcessorRegistrationStep2View.as_view(), name='processor_register_step2'),
    path('register/step3/', ProcessorRegistrationStep3View.as_view(), name='processor_register_step3'),
    
    # Single-step registration
    path('register/', ProcessorRegistrationSingleStepView.as_view(), name='processor_register'),
    
    # ViewSet routes
    path('', include(router.urls)),
]