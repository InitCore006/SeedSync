from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework import generics


from .models import Farmer, FarmPlot, CropPlanning, FPOMembership
from .serializers import (
    FarmerSerializer, FarmerListSerializer, FarmerRegistrationSerializer,
    FarmerDashboardSerializer, FarmPlotSerializer, FarmPlotListSerializer,
    CropPlanningSerializer, CropPlanningListSerializer,
    FPOMembershipSerializer, FarmerLocationSerializer
)
from apps.users.permissions import IsOwnerOrAdmin, IsAdmin


class FarmerViewSet(viewsets.ModelViewSet):
    """
    Farmer Profile Management
    Mobile App Primary Endpoint
    """
    queryset = Farmer.objects.select_related('user', 'primary_fpo').all()
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        
        # Farmers can only see their own profile
        if user.role == 'farmer':
            return self.queryset.filter(user=user)
        
        # Admin/FPO can see all
        if user.role in ['admin', 'fpo_admin', 'govt_official']:
            queryset = self.queryset
            
            # Filters
            district = self.request.query_params.get('district')
            state = self.request.query_params.get('state')
            is_fpo_member = self.request.query_params.get('is_fpo_member')
            category = self.request.query_params.get('category')
            search = self.request.query_params.get('search')
            
            if district:
                queryset = queryset.filter(user__profile__district__iexact=district)
            if state:
                queryset = queryset.filter(user__profile__state__iexact=state)
            if is_fpo_member is not None:
                queryset = queryset.filter(is_fpo_member=is_fpo_member.lower() == 'true')
            if category:
                queryset = queryset.filter(farmer_category=category)
            if search:
                queryset = queryset.filter(
                    Q(user__full_name__icontains=search) |
                    Q(farmer_id__icontains=search) |
                    Q(user__phone_number__icontains=search)
                )
            
            return queryset
        
        return self.queryset.none()
    
    def get_serializer_class(self):
        """Use appropriate serializer"""
        if self.action == 'list':
            return FarmerListSerializer
        if self.action == 'register':
            return FarmerRegistrationSerializer
        return FarmerSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        Get current farmer profile
        GET /api/v1/farmers/me/
        Mobile App: First screen after login
        """
        try:
            farmer = Farmer.objects.select_related('user', 'primary_fpo').get(user=request.user)
            serializer = self.get_serializer(farmer)
            return Response(serializer.data)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found',
                'user_role': request.user.role
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request):
        """
        Farmer dashboard data for mobile app
        GET /api/v1/farmers/dashboard/
        
        Returns:
        - Total land, plots, active crops
        - Production & revenue stats
        - Recent harvests
        - Upcoming sowings
        """
        try:
            farmer = Farmer.objects.get(user=request.user)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate statistics
        total_plots = farmer.farm_plots.filter(is_active=True).count()
        
        active_crops = CropPlanning.objects.filter(
            farm_plot__farmer=farmer,
            status__in=['sowing', 'growing', 'harvesting']
        ).count()
        
        total_revenue = CropPlanning.objects.filter(
            farm_plot__farmer=farmer,
            status='sold'
        ).aggregate(Sum('revenue'))['revenue__sum'] or 0
        
        # Recent harvests (last 3 months)
        three_months_ago = timezone.now().date() - timedelta(days=90)
        recent_harvests = CropPlanning.objects.filter(
            farm_plot__farmer=farmer,
            status='harvested',
            actual_harvest_date__gte=three_months_ago
        ).order_by('-actual_harvest_date')[:5]
        
        # Upcoming sowings (next 30 days)
        thirty_days_later = timezone.now().date() + timedelta(days=30)
        upcoming_sowings = CropPlanning.objects.filter(
            farm_plot__farmer=farmer,
            status='planned',
            planned_sowing_date__lte=thirty_days_later
        ).order_by('planned_sowing_date')[:5]
        
        dashboard_data = {
            'total_land': farmer.total_land_area,
            'total_plots': total_plots,
            'active_crops': active_crops,
            'total_production': farmer.total_production,
            'total_revenue': total_revenue,
            'credit_score': farmer.credit_score,
            'fpo_membership_status': farmer.is_fpo_member,
            'recent_harvests': CropPlanningListSerializer(recent_harvests, many=True).data,
            'upcoming_sowings': CropPlanningListSerializer(upcoming_sowings, many=True).data,
        }
        
        serializer = FarmerDashboardSerializer(dashboard_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def verify(self, request, pk=None):
        """
        Verify farmer profile
        POST /api/v1/farmers/{id}/verify/
        """
        farmer = self.get_object()
        farmer.is_verified = True
        farmer.save()
        
        return Response({
            'message': f'Farmer {farmer.user.full_name} verified successfully'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def statistics(self, request):
        """
        Farmer statistics for admin dashboard
        GET /api/v1/farmers/statistics/
        """
        total_farmers = Farmer.objects.count()
        verified_farmers = Farmer.objects.filter(is_verified=True).count()
        fpo_members = Farmer.objects.filter(is_fpo_member=True).count()
        
        # By category
        by_category = dict(
            Farmer.objects.values_list('farmer_category').annotate(count=Count('id'))
        )
        
        # By state
        by_state = dict(
            Farmer.objects.values('user__profile__state').annotate(
                count=Count('id')
            ).values_list('user__profile__state', 'count')
        )
        
        # Total land
        total_land = Farmer.objects.aggregate(Sum('total_land_area'))['total_land_area__sum'] or 0
        
        # Average credit score
        avg_credit_score = Farmer.objects.aggregate(Avg('credit_score'))['credit_score__avg'] or 0
        
        return Response({
            'total_farmers': total_farmers,
            'verified_farmers': verified_farmers,
            'fpo_members': fpo_members,
            'non_fpo_members': total_farmers - fpo_members,
            'by_category': by_category,
            'by_state': by_state,
            'total_land_acres': float(total_land),
            'average_credit_score': float(avg_credit_score),
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def map_data(self, request):
        """
        Get farmer locations for map visualization
        GET /api/v1/farmers/map-data/
        """
        farmers = Farmer.objects.select_related('user__profile').filter(
            is_active=True
        )
        
        locations = []
        for farmer in farmers:
            # Get first plot with coordinates
            plot = farmer.farm_plots.filter(
                latitude__isnull=False,
                longitude__isnull=False
            ).first()
            
            if plot:
                locations.append({
                    'farmer_id': farmer.farmer_id,
                    'farmer_name': farmer.user.full_name,
                    'latitude': plot.latitude,
                    'longitude': plot.longitude,
                    'total_land': float(farmer.total_land_area),
                    'district': farmer.user.profile.district,
                    'state': farmer.user.profile.state,
                })
        
        return Response(locations)

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

class FarmPlotViewSet(viewsets.ModelViewSet):
    """
    Farm Plot Management
    Mobile App: Manage individual plots
    """
    queryset = FarmPlot.objects.select_related('farmer').all()
    serializer_class = FarmPlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter plots by farmer"""
        user = self.request.user
        
        if user.role == 'farmer':
            try:
                farmer = Farmer.objects.get(user=user)
                return self.queryset.filter(farmer=farmer)
            except Farmer.DoesNotExist:
                return self.queryset.none()
        
        if user.role in ['admin', 'fpo_admin', 'govt_official']:
            return self.queryset
        
        return self.queryset.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FarmPlotListSerializer
        return FarmPlotSerializer
    
    def perform_create(self, serializer):
        """Set farmer when creating plot"""
        farmer = Farmer.objects.get(user=self.request.user)
        serializer.save(farmer=farmer)
    
    @action(detail=False, methods=['get'])
    def my_plots(self, request):
        """
        Get all plots of current farmer
        GET /api/v1/farm-plots/my-plots/
        Mobile App: Plot list screen
        """
        try:
            farmer = Farmer.objects.get(user=request.user)
            plots = self.queryset.filter(farmer=farmer, is_active=True)
            serializer = self.get_serializer(plots, many=True)
            return Response(serializer.data)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        """
        Update plot GPS coordinates
        POST /api/v1/farm-plots/{id}/update-location/
        Body: { "latitude": 18.5204, "longitude": 73.8567 }
        """
        plot = self.get_object()
        
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        boundary = request.data.get('boundary')  # GeoJSON polygon
        
        if latitude and longitude:
            plot.latitude = latitude
            plot.longitude = longitude
        
        if boundary:
            plot.boundary = boundary
        
        plot.save()
        
        return Response({
            'message': 'Location updated successfully',
            'plot': FarmPlotSerializer(plot).data
        })


class CropPlanningViewSet(viewsets.ModelViewSet):
    """
    Crop Planning & Tracking
    Mobile App: Crop calendar and management
    """
    queryset = CropPlanning.objects.select_related(
        'farm_plot', 'crop', 'variety', 'fpo_commitment'
    ).all()
    serializer_class = CropPlanningSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter crop plans by farmer"""
        user = self.request.user
        
        if user.role == 'farmer':
            try:
                farmer = Farmer.objects.get(user=user)
                return self.queryset.filter(farm_plot__farmer=farmer)
            except Farmer.DoesNotExist:
                return self.queryset.none()
        
        if user.role in ['admin', 'fpo_admin', 'govt_official']:
            queryset = self.queryset
            
            # Filters
            season = self.request.query_params.get('season')
            year = self.request.query_params.get('year')
            status_filter = self.request.query_params.get('status')
            crop_id = self.request.query_params.get('crop')
            
            if season:
                queryset = queryset.filter(season=season)
            if year:
                queryset = queryset.filter(year=year)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if crop_id:
                queryset = queryset.filter(crop_id=crop_id)
            
            return queryset
        
        return self.queryset.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CropPlanningListSerializer
        return CropPlanningSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get active crop plans
        GET /api/v1/crop-planning/active/
        Mobile App: Current crops screen
        """
        try:
            farmer = Farmer.objects.get(user=request.user)
            active_plans = self.queryset.filter(
                farm_plot__farmer=farmer,
                status__in=['sowing', 'growing', 'harvesting']
            )
            serializer = self.get_serializer(active_plans, many=True)
            return Response(serializer.data)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """
        Get crop calendar for current year
        GET /api/v1/crop-planning/calendar/?year=2024
        Mobile App: Calendar view
        """
        try:
            farmer = Farmer.objects.get(user=request.user)
            year = request.query_params.get('year', datetime.now().year)
            
            calendar_data = {
                'kharif': [],
                'rabi': [],
                'zaid': []
            }
            
            plans = self.queryset.filter(
                farm_plot__farmer=farmer,
                year=year
            ).order_by('planned_sowing_date')
            
            for plan in plans:
                calendar_data[plan.season].append(
                    CropPlanningListSerializer(plan).data
                )
            
            return Response(calendar_data)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update crop status
        POST /api/v1/crop-planning/{id}/update-status/
        Body: { "status": "harvesting", "actual_harvest_date": "2024-03-15" }
        """
        crop_plan = self.get_object()
        
        new_status = request.data.get('status')
        if new_status:
            crop_plan.status = new_status
        
        if new_status == 'sowing' and request.data.get('actual_sowing_date'):
            crop_plan.actual_sowing_date = request.data['actual_sowing_date']
        
        if new_status == 'harvested':
            crop_plan.actual_harvest_date = request.data.get('actual_harvest_date', timezone.now().date())
            crop_plan.actual_yield = request.data.get('actual_yield', 0)
        
        crop_plan.save()
        
        return Response({
            'message': 'Status updated successfully',
            'crop_plan': CropPlanningSerializer(crop_plan).data
        })
    
    @action(detail=True, methods=['post'])
    def record_harvest(self, request, pk=None):
        """
        Record harvest details
        POST /api/v1/crop-planning/{id}/record-harvest/
        Body: {
            "actual_yield": 45.5,
            "actual_harvest_date": "2024-03-20",
            "revenue": 85000
        }
        """
        crop_plan = self.get_object()
        
        crop_plan.actual_yield = request.data.get('actual_yield')
        crop_plan.actual_harvest_date = request.data.get('actual_harvest_date')
        crop_plan.revenue = request.data.get('revenue', 0)
        crop_plan.status = 'harvested'
        crop_plan.save()
        
        # Update farmer's total production
        farmer = crop_plan.farm_plot.farmer
        farmer.total_production = CropPlanning.objects.filter(
            farm_plot__farmer=farmer,
            status='harvested'
        ).aggregate(Sum('actual_yield'))['actual_yield__sum'] or 0
        farmer.save()
        
        return Response({
            'message': 'Harvest recorded successfully',
            'crop_plan': CropPlanningSerializer(crop_plan).data
        })


class FPOMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    FPO Membership Details (Read-only for farmers)
    """
    queryset = FPOMembership.objects.select_related('farmer', 'fpo').all()
    serializer_class = FPOMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter by farmer"""
        user = self.request.user
        
        if user.role == 'farmer':
            try:
                farmer = Farmer.objects.get(user=user)
                return self.queryset.filter(farmer=farmer)
            except Farmer.DoesNotExist:
                return self.queryset.none()
        
        if user.role in ['admin', 'fpo_admin']:
            return self.queryset
        
        return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def my_memberships(self, request):
        """
        Get all FPO memberships of current farmer
        GET /api/v1/fpo-memberships/my-memberships/
        """
        try:
            farmer = Farmer.objects.get(user=request.user)
            memberships = self.queryset.filter(farmer=farmer, status='active')
            serializer = self.get_serializer(memberships, many=True)
            return Response(serializer.data)
        except Farmer.DoesNotExist:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)