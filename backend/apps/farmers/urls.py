from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FarmerViewSet,
    FarmPlotViewSet,
    CropPlanningViewSet,
    FPOMembershipViewSet,
    FarmerRegistrationView
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'', FarmerViewSet, basename='farmer')
router.register(r'plots', FarmPlotViewSet, basename='farm-plot')
router.register(r'crop-planning', CropPlanningViewSet, basename='crop-planning')
router.register(r'fpo-memberships', FPOMembershipViewSet, basename='fpo-membership')

urlpatterns = [
    # All routes from router
    path('register/', FarmerRegistrationView.as_view(), name='farmer-register'),
    path('', include(router.urls)),
]

# Available Endpoints:
# 
# FARMERS:
# GET    /api/v1/farmers/                      - List farmers (admin)
# POST   /api/v1/farmers/                      - Create farmer (admin)
# GET    /api/v1/farmers/me/                   - Get current farmer profile ✨
# GET    /api/v1/farmers/dashboard/            - Farmer dashboard ✨
# GET    /api/v1/farmers/statistics/           - Statistics (admin)
# GET    /api/v1/farmers/map-data/             - Map locations (admin)
# GET    /api/v1/farmers/{id}/                 - Get farmer details
# PUT    /api/v1/farmers/{id}/                 - Update farmer
# PATCH  /api/v1/farmers/{id}/                 - Partial update
# DELETE /api/v1/farmers/{id}/                 - Delete farmer (admin)
# POST   /api/v1/farmers/{id}/verify/          - Verify farmer (admin)
#
# FARM PLOTS:
# GET    /api/v1/farmers/plots/                - List plots
# POST   /api/v1/farmers/plots/                - Create plot ✨
# GET    /api/v1/farmers/plots/my-plots/       - Get farmer's plots ✨
# GET    /api/v1/farmers/plots/{id}/           - Get plot details
# PUT    /api/v1/farmers/plots/{id}/           - Update plot ✨
# DELETE /api/v1/farmers/plots/{id}/           - Delete plot ✨
# POST   /api/v1/farmers/plots/{id}/update-location/ - Update GPS ✨
#
# CROP PLANNING:
# GET    /api/v1/farmers/crop-planning/        - List crop plans
# POST   /api/v1/farmers/crop-planning/        - Create crop plan ✨
# GET    /api/v1/farmers/crop-planning/active/ - Active crops ✨
# GET    /api/v1/farmers/crop-planning/calendar/ - Crop calendar ✨
# GET    /api/v1/farmers/crop-planning/{id}/   - Get plan details
# PUT    /api/v1/farmers/crop-planning/{id}/   - Update plan ✨
# POST   /api/v1/farmers/crop-planning/{id}/update-status/ - Update status ✨
# POST   /api/v1/farmers/crop-planning/{id}/record-harvest/ - Record harvest ✨
#
# FPO MEMBERSHIPS:
# GET    /api/v1/farmers/fpo-memberships/      - List memberships
# GET    /api/v1/farmers/fpo-memberships/my-memberships/ - Farmer's memberships ✨
# GET    /api/v1/farmers/fpo-memberships/{id}/ - Membership details
#
# ✨ = Mobile App Priority Endpoints