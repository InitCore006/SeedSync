"""
Enhanced Government Dashboard Views
National analytics, monitoring, approvals
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from apps.core.utils import response_success, response_error
from apps.core.permissions import IsGovernment
from apps.farmers.models import FarmerProfile
from apps.fpos.models import FPOProfile, FPOMembership
from apps.lots.models import ProcurementLot
from apps.bids.models import Bid
from apps.payments.models import Payment
from apps.users.models import User
from apps.processors.models import ProcessorProfile
from apps.retailers.models import RetailerProfile

# Import extended views
from .views_extended import (
    FarmerRegistryAPIView,
    ProcessorMonitoringAPIView,
    RetailerAnalyticsAPIView,
    SupplyChainTrackingAPIView,
    ProcurementAnalyticsAPIView,
    MarketPricesAnalyticsAPIView
)


class NationalDashboardAPIView(APIView):
    """
    National dashboard with key metrics for government officials
    Shows overall platform statistics and trends
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # User statistics
        total_farmers = FarmerProfile.objects.filter(is_active=True).count()
        verified_farmers = FarmerProfile.objects.filter(is_active=True, kyc_status='verified').count()
        total_fpos = FPOProfile.objects.filter(is_active=True).count()
        verified_fpos = FPOProfile.objects.filter(is_active=True, is_verified=True).count()
        
        # Procurement statistics
        total_lots = ProcurementLot.objects.filter(is_active=True).count()
        total_procurement_volume = ProcurementLot.objects.filter(is_active=True).aggregate(
            total=Sum('quantity_quintals')
        )['total'] or 0
        
        # Transaction value
        total_transaction_value = Payment.objects.filter(status='completed').aggregate(
            total=Sum('net_amount')
        )['total'] or 0
        
        # Active marketplace
        active_listings = ProcurementLot.objects.filter(status='available', is_active=True).count()
        active_bids = Bid.objects.filter(status='pending', is_active=True).count()
        
        # Crop-wise production
        crop_wise_data = ProcurementLot.objects.values('crop_type').annotate(
            total_quantity=Sum('quantity_quintals'),
            total_lots=Count('id'),
            avg_price=Avg('expected_price_per_quintal')
        ).order_by('-total_quantity')
        
        # State-wise distribution
        state_wise_data = FarmerProfile.objects.values('state').annotate(
            total_farmers=Count('id'),
            total_land_acres=Sum('total_land_acres')
        ).order_by('-total_farmers')
        
        # Monthly trends (last 6 months)
        monthly_trends = []
        for i in range(6):
            month_start = (timezone.now().date().replace(day=1) - timedelta(days=30*i))
            month_end = month_start + timedelta(days=30)
            
            month_stats = {
                'month': month_start.strftime('%B %Y'),
                'new_farmers': FarmerProfile.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).count(),
                'new_lots': ProcurementLot.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).count(),
                'procurement_volume': ProcurementLot.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).aggregate(total=Sum('quantity_quintals'))['total'] or 0
            }
            monthly_trends.append(month_stats)
        
        monthly_trends.reverse()
        
        # Platform health metrics
        total_fpo_members = FPOMembership.objects.filter(is_active=True).count()
        fpo_coverage_percentage = (total_fpo_members / total_farmers * 100) if total_farmers > 0 else 0
        
        # Calculate growth percentages (comparing to previous month)
        prev_month_start = (timezone.now().date().replace(day=1) - timedelta(days=30))
        current_month_start = timezone.now().date().replace(day=1)
        
        prev_month_fpos = FPOProfile.objects.filter(
            created_at__lt=current_month_start,
            is_active=True
        ).count()
        fpo_growth_percent = ((total_fpos - prev_month_fpos) / prev_month_fpos * 100) if prev_month_fpos > 0 else 0
        
        prev_month_production = ProcurementLot.objects.filter(
            created_at__year=prev_month_start.year,
            created_at__month=prev_month_start.month
        ).aggregate(total=Sum('quantity_quintals'))['total'] or 0
        
        current_month_production = ProcurementLot.objects.filter(
            created_at__year=current_month_start.year,
            created_at__month=current_month_start.month
        ).aggregate(total=Sum('quantity_quintals'))['total'] or 0
        
        production_growth_percent = ((current_month_production - prev_month_production) / prev_month_production * 100) if prev_month_production > 0 else 0
        
        # Count active states
        active_states = FarmerProfile.objects.filter(is_active=True).values('state').distinct().count()
        
        # Crop distribution data
        crop_distribution = []
        for item in crop_wise_data[:10]:  # Top 10 crops
            total_production = float(item['total_quantity']) / 10  # Convert to MT
            percentage = (total_production / (float(total_procurement_volume) / 10) * 100) if total_procurement_volume > 0 else 0
            crop_distribution.append({
                'crop_name': item['crop_type'],
                'production_mt': total_production,
                'percentage': round(percentage, 2)
            })
        
        dashboard_data = {
            'total_fpos': total_fpos,
            'fpo_growth_percent': round(fpo_growth_percent, 1),
            'total_production_mt': float(total_procurement_volume) / 10,  # Convert to MT
            'production_growth_percent': round(production_growth_percent, 1),
            'total_market_value': float(total_transaction_value),
            'avg_price_per_quintal': float(crop_wise_data[0]['avg_price']) if crop_wise_data and crop_wise_data[0]['avg_price'] else 0,
            'active_states': active_states,
            'crop_distribution': crop_distribution,
        }
        
        return Response(
            response_success(
                message="National dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class StateHeatmapAPIView(APIView):
    """
    State-wise production heatmap data
    Returns GeoJSON format for map visualization
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        crop_type = request.query_params.get('crop_type')
        
        # Get state-wise data
        filters = {'is_active': True}
        if crop_type:
            filters['crop_type'] = crop_type
        
        state_data = ProcurementLot.objects.filter(**filters).values('farmer__state').annotate(
            total_production=Sum('quantity_quintals'),
            total_lots=Count('id'),
            avg_price=Avg('expected_price_per_quintal'),
            farmer_count=Count('farmer', distinct=True)
        ).order_by('-total_production')
        
        # Format as array for frontend
        heatmap_array = []
        for item in state_data:
            if not item['farmer__state']:
                continue
                
            production_mt = float(item['total_production']) / 10
            
            heatmap_array.append({
                'state_code': item['farmer__state'][:2].upper(),  # Simple state code
                'state_name': item['farmer__state'],
                'total_production_mt': production_mt,
                'total_lots': item['total_lots'],
                'farmer_count': item['farmer_count'],
                'avg_price': float(item['avg_price']) if item['avg_price'] else 0
            })
        
        return Response(
            response_success(
                message="State heatmap data generated successfully",
                data=heatmap_array
            )
        )


class FPOMonitoringAPIView(APIView):
    """
    FPO monitoring and health scoring
    Shows FPO performance metrics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        
        filters = {'is_active': True}
        if state:
            filters['state'] = state
        if district:
            filters['district__icontains'] = district
        
        fpos = FPOProfile.objects.filter(**filters)
        
        fpo_data = []
        for fpo in fpos:
            # Calculate health score
            member_count = FPOMembership.objects.filter(fpo=fpo, is_active=True).count()
            procurement_volume = ProcurementLot.objects.filter(fpo=fpo).aggregate(
                total=Sum('quantity_quintals')
            )['total'] or 0
            
            # Simple health score calculation
            health_score = 0
            if member_count > 100:
                health_score += 30
            elif member_count > 50:
                health_score += 20
            elif member_count > 20:
                health_score += 10
            
            if procurement_volume > 1000:
                health_score += 30
            elif procurement_volume > 500:
                health_score += 20
            elif procurement_volume > 100:
                health_score += 10
            
            if fpo.is_verified:
                health_score += 20
            
            if fpo.verified_by_government:
                health_score += 20
            
            fpo_data.append({
                'id': str(fpo.id),
                'organization_name': fpo.organization_name,
                'district': fpo.district,
                'state': fpo.state,
                'total_members': member_count,
                'year_of_registration': fpo.year_of_registration,
                'is_verified': fpo.is_verified,
                'verified_by_government': fpo.verified_by_government,
                'total_procurement_quintals': float(procurement_volume),
                'health_score': health_score,
                'health_status': 'Excellent' if health_score >= 80 else 'Good' if health_score >= 60 else 'Average' if health_score >= 40 else 'Poor',
                'primary_crops': fpo.primary_crops,
                'latitude': float(fpo.latitude) if fpo.latitude else None,
                'longitude': float(fpo.longitude) if fpo.longitude else None
            })
        
        # Sort by health score
        fpo_data.sort(key=lambda x: x['health_score'], reverse=True)
        
        return Response(
            response_success(
                message="FPO monitoring data fetched successfully",
                data={
                    'fpos': fpo_data,
                    'total': len(fpo_data),
                    'excellent_count': len([f for f in fpo_data if f['health_score'] >= 80]),
                    'good_count': len([f for f in fpo_data if 60 <= f['health_score'] < 80]),
                    'needs_attention_count': len([f for f in fpo_data if f['health_score'] < 60])
                }
            )
        )


class ApprovalQueueAPIView(APIView):
    """
    Pending registrations and verifications
    For government approval workflow
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Pending farmer verifications
        pending_farmers = FarmerProfile.objects.filter(
            is_active=True,
            kyc_status='pending'
        ).select_related('user')[:50]
        
        farmer_queue = []
        for farmer in pending_farmers:
            farmer_queue.append({
                'id': str(farmer.id),
                'type': 'farmer',
                'name': farmer.full_name,
                'phone_number': farmer.user.phone_number,
                'district': farmer.district,
                'state': farmer.state,
                'total_land_acres': float(farmer.total_land_acres),
                'submitted_date': farmer.created_at.isoformat(),
                'aadhaar_provided': bool(farmer.aadhaar_number),
                'pan_provided': bool(farmer.pan_number)
            })
        
        # Pending FPO verifications
        pending_fpos = FPOProfile.objects.filter(
            is_active=True,
            is_verified=False
        ).select_related('user')[:50]
        
        fpo_queue = []
        for fpo in pending_fpos:
            fpo_queue.append({
                'id': str(fpo.id),
                'type': 'fpo',
                'name': fpo.organization_name,
                'registration_number': fpo.registration_number,
                'district': fpo.district,
                'state': fpo.state,
                'total_members': fpo.total_members,
                'submitted_date': fpo.created_at.isoformat(),
                'gstin_provided': bool(fpo.gstin),
                'pan_provided': bool(fpo.pan_number)
            })
        
        return Response(
            response_success(
                message="Approval queue fetched successfully",
                data={
                    'pending_farmers': farmer_queue,
                    'pending_fpos': fpo_queue,
                    'total_pending': len(farmer_queue) + len(fpo_queue)
                }
            )
        )


class ApproveRegistrationAPIView(APIView):
    """
    Approve farmer or FPO registration
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        entity_type = request.data.get('type')  # 'farmer' or 'fpo'
        remarks = request.data.get('remarks', '')
        
        if entity_type == 'farmer':
            try:
                farmer = FarmerProfile.objects.get(id=user_id)
                farmer.kyc_status = 'verified'
                farmer.save()
                
                return Response(
                    response_success(
                        message=f"Farmer {farmer.full_name} approved successfully",
                        data={'id': str(farmer.id), 'status': 'verified'}
                    )
                )
            except FarmerProfile.DoesNotExist:
                return Response(
                    response_error(message="Farmer not found"),
                    status=404
                )
        
        elif entity_type == 'fpo':
            try:
                fpo = FPOProfile.objects.get(id=user_id)
                fpo.is_verified = True
                fpo.verified_by_government = True
                fpo.save()
                
                return Response(
                    response_success(
                        message=f"FPO {fpo.organization_name} approved successfully",
                        data={'id': str(fpo.id), 'status': 'verified'}
                    )
                )
            except FPOProfile.DoesNotExist:
                return Response(
                    response_error(message="FPO not found"),
                    status=404
                )
        
        return Response(
            response_error(message="Invalid entity type"),
            status=400
        )


class RejectRegistrationAPIView(APIView):
    """
    Reject farmer or FPO registration
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        entity_type = request.data.get('type')
        reason = request.data.get('reason', 'No reason provided')
        
        if entity_type == 'farmer':
            try:
                farmer = FarmerProfile.objects.get(id=user_id)
                farmer.kyc_status = 'rejected'
                farmer.save()
                
                # TODO: Send notification with reason
                
                return Response(
                    response_success(
                        message="Farmer registration rejected",
                        data={'id': str(farmer.id), 'status': 'rejected'}
                    )
                )
            except FarmerProfile.DoesNotExist:
                return Response(
                    response_error(message="Farmer not found"),
                    status=404
                )
        
        elif entity_type == 'fpo':
            try:
                fpo = FPOProfile.objects.get(id=user_id)
                fpo.kyc_status = 'rejected'
                fpo.save()
                
                return Response(
                    response_success(
                        message="FPO registration rejected",
                        data={'id': str(fpo.id), 'status': 'rejected'}
                    )
                )
            except FPOProfile.DoesNotExist:
                return Response(
                    response_error(message="FPO not found"),
                    status=404
                )
        
        return Response(
            response_error(message="Invalid entity type"),
            status=400
        )


class EntityLocationsAPIView(APIView):
    """
    Get all entity locations (FPOs, Processors, Farmers) with lat/long coordinates
    Returns color-coded markers for map visualization
    """
    permission_classes = [IsAuthenticated, IsGovernment]
    
    def get(self, request):
        """
        Fetch all locations from FPO, Processor, and Farmer profiles
        Returns: List of locations with entity_type, name, coordinates, and metadata
        """
        try:
            locations = []
            
            # Fetch FPO locations (all FPOs with coordinates)
            try:
                fpo_profiles = FPOProfile.objects.filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                ).exclude(
                    latitude=0,
                    longitude=0
                ).select_related('user')
                
                for fpo in fpo_profiles:
                    locations.append({
                        'id': str(fpo.id),
                        'entity_type': 'fpo',
                        'name': fpo.organization_name,
                        'latitude': float(fpo.latitude),
                        'longitude': float(fpo.longitude),
                        'city': fpo.city or '',
                        'state': fpo.state or '',
                        'district': fpo.district or '',
                        'is_verified': fpo.is_verified if hasattr(fpo, 'is_verified') else False,
                        'total_members': fpo.total_members if hasattr(fpo, 'total_members') else 0,
                        'contact_person': fpo.contact_person_name if hasattr(fpo, 'contact_person_name') else '',
                        'phone': fpo.contact_person_phone if hasattr(fpo, 'contact_person_phone') else '',
                    })
            except Exception as e:
                print(f"Error fetching FPO locations: {str(e)}")
            
            # Fetch Processor locations (all processors with coordinates)
            try:
                processor_profiles = ProcessorProfile.objects.filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                ).exclude(
                    latitude=0,
                    longitude=0
                ).select_related('user')
                
                for processor in processor_profiles:
                    locations.append({
                        'id': str(processor.id),
                        'entity_type': 'processor',
                        'name': processor.company_name,
                        'latitude': float(processor.latitude),
                        'longitude': float(processor.longitude),
                        'city': processor.city or '',
                        'state': processor.state or '',
                        'is_verified': processor.is_verified,
                        'processing_capacity': float(processor.processing_capacity_quintals_per_day) if processor.processing_capacity_quintals_per_day else None,
                        'contact_person': processor.contact_person or '',
                        'phone': processor.phone or '',
                    })
            except Exception as e:
                print(f"Error fetching Processor locations: {str(e)}")
            
            # Fetch Farmer locations (all farmers with coordinates)
            try:
                farmer_profiles = FarmerProfile.objects.filter(
                    latitude__isnull=False,
                    longitude__isnull=False
                ).exclude(
                    latitude=0,
                    longitude=0
                ).select_related('user')
                
                for farmer in farmer_profiles:
                    locations.append({
                        'id': str(farmer.id),
                        'entity_type': 'farmer',
                        'name': farmer.user.full_name or farmer.user.phone_number,
                        'latitude': float(farmer.latitude),
                        'longitude': float(farmer.longitude),
                        'village': farmer.village or '',
                        'district': farmer.district or '',
                        'state': farmer.state or '',
                        'total_land': float(farmer.total_land_acres) if farmer.total_land_acres else None,
                        'kyc_status': farmer.kyc_status or 'pending',
                    })
            except Exception as e:
                print(f"Error fetching Farmer locations: {str(e)}")
            
            # Summary statistics
            summary = {
                'total_locations': len(locations),
                'fpo_count': len([l for l in locations if l['entity_type'] == 'fpo']),
                'processor_count': len([l for l in locations if l['entity_type'] == 'processor']),
                'farmer_count': len([l for l in locations if l['entity_type'] == 'farmer']),
            }
            
            return Response(
                response_success(
                    message="Entity locations fetched successfully",
                    data={
                        'locations': locations,
                        'summary': summary
                    }
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Error fetching entity locations: {str(e)}"),
                status=500
            )
