from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework import generics


from .models import Farmer
from .serializers import (
    FarmerRegistrationSerializer,

)
from apps.users.permissions import IsOwnerOrAdmin, IsAdmin


# Add this after FarmerViewSet class

class FarmerRegistrationView(generics.CreateAPIView):
    """
    Complete Farmer Registration
    POST /api/v1/farmers/register/
    
    Request body should include all user, profile, and farmer fields
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
            "farmer_id": farmer.farmer_id,
            "user": {
                "id": str(farmer.user.id),
                "phone_number": farmer.user.phone_number,
                "full_name": farmer.user.full_name,
                "role": farmer.user.role,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

