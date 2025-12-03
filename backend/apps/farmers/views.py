from apps.users.serializers import UpdateUserProfileSerializer
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.shortcuts import get_object_or_404

from .models import Farmer
from .serializers import (
    FarmerSerializer,
    FarmerRegistrationSerializer,
    UpdateFarmerSerializer,
)



class FarmerRegistrationView(generics.CreateAPIView):
    """
    Complete Farmer Registration
    POST /api/farmers/register/
    """
    serializer_class = FarmerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create farmer (which creates user and profile)
        farmer = serializer.save()
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(farmer.user)
        
        return Response({
            "message": "Farmer registration successful",
            "farmer": FarmerSerializer(farmer).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class FarmerProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and Update Farmer Profile
    GET   /api/farmers/me/ - Get current farmer profile
    PATCH /api/farmers/me/ - Update current farmer profile
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FarmerSerializer
    
    def get_object(self):
        """Get farmer profile for current user"""
        try:
            return Farmer.objects.select_related('user__profile').get(user=self.request.user)
        except Farmer.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Farmer profile not found")
    
    def patch(self, request, *args, **kwargs):
        """Update farmer profile and related user/profile data"""
        farmer = self.get_object()
        
        # Separate farmer and user/profile data
        farmer_data = {}
        user_profile_data = {}
        
        # Farmer fields
        farmer_fields = [
            'total_land_area', 'irrigated_land', 'rain_fed_land',
            'farmer_category', 'caste_category',
            'has_kisan_credit_card', 'kcc_number',
            'has_pmfby_insurance', 'pmfby_policy_number', 'has_pm_kisan'
        ]
        
        for field in farmer_fields:
            if field in request.data:
                farmer_data[field] = request.data[field]
        
        # User and Profile fields
        user_profile_fields = [
            'full_name', 'email', 'preferred_language',
            'date_of_birth', 'gender', 'address_line1', 'address_line2',
            'village', 'block', 'district', 'state', 'pincode',
            'bank_name', 'account_number', 'ifsc_code', 
            'account_holder_name', 'education_level'
        ]
        
        for field in user_profile_fields:
            if field in request.data:
                user_profile_data[field] = request.data[field]
        
        # Update farmer
        if farmer_data:
            farmer_serializer = UpdateFarmerSerializer(
                instance=farmer,
                data=farmer_data,
                partial=True
            )
            farmer_serializer.is_valid(raise_exception=True)
            farmer_serializer.save()
        
        # Update user and profile
        if user_profile_data:
            user_profile_serializer = UpdateUserProfileSerializer(
                instance=farmer.user,
                data=user_profile_data,
                partial=True
            )
            user_profile_serializer.is_valid(raise_exception=True)
            user_profile_serializer.save()
        
        # Return updated farmer data
        return Response({
            'message': 'Farmer profile updated successfully',
            'data': FarmerSerializer(farmer).data
        })


class FarmerDashboardView(generics.RetrieveAPIView):
    """
    Farmer Dashboard
    GET /api/farmers/dashboard/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farmer = Farmer.objects.get(user=request.user)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get statistics
        from crops.models import Crop, Harvest
        
        total_crops = Crop.objects.filter(farmer=farmer).count()
        active_crops = Crop.objects.filter(
            farmer=farmer,
            status__in=['planted', 'growing', 'flowering', 'matured']
        ).count()
        
        total_harvest = Harvest.objects.filter(
            crop__farmer=farmer
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # Recent crops
        from crops.serializers import CropListSerializer
        recent_crops = Crop.objects.filter(farmer=farmer).order_by('-planting_date')[:5]
        
        return Response({
            'farmer': FarmerSerializer(farmer).data,
            'statistics': {
                'total_crops': total_crops,
                'active_crops': active_crops,
                'total_harvest': float(total_harvest),
                'total_land_area': float(farmer.total_land_area),
                'irrigated_land': float(farmer.irrigated_land),
            },
            'recent_crops': CropListSerializer(recent_crops, many=True).data,
        })