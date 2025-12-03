from django.urls import path
from .views import (
    FarmerRegistrationView,
    FarmerProfileView,
    FarmerDashboardView,
)

urlpatterns = [
    path('register/', FarmerRegistrationView.as_view(), name='farmer-register'),
    path('me/', FarmerProfileView.as_view(), name='farmer-profile'),
    path('dashboard/', FarmerDashboardView.as_view(), name='farmer-dashboard'),
]