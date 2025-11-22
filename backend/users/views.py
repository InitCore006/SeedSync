from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
import uuid

from .models import (
    FarmerProfile, FPOProfile, ProcessorProfile,
    RetailerProfile, LogisticsProfile, GovernmentProfile
)
from .serializers import (
    # Auth & Token
    CustomTokenObtainPairSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    
    # User
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    
    # FPO
    FPORegistrationStep1Serializer,
    FPORegistrationStep2Serializer,
    FPORegistrationStep3Serializer,
    FPORegistrationStep4Serializer,
    FPOProfileSerializer,
    
    # Processor
    ProcessorRegistrationStep1Serializer,
    ProcessorRegistrationStep2Serializer,
    ProcessorRegistrationStep3Serializer,
    ProcessorRegistrationStep4Serializer,
    ProcessorRegistrationStep5Serializer,
    ProcessorProfileSerializer,
    
    # Retailer
    RetailerRegistrationStep1Serializer,
    RetailerRegistrationStep2Serializer,
    RetailerRegistrationStep3Serializer,
    RetailerProfileSerializer,
    
    # Logistics
    LogisticsRegistrationStep1Serializer,
    LogisticsRegistrationStep2Serializer,
    LogisticsRegistrationStep3Serializer,
    LogisticsProfileSerializer,
    
    # Government
    GovernmentProfileSerializer,
    ApprovalActionSerializer,
    PendingApprovalSerializer,
    
    # Farmer
    FarmerProfileSerializer,
    FarmerProfileListSerializer,
)
from logistics.models import Warehouse, Vehicle
from logistics.serializers import WarehouseSerializer, VehicleSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

User = get_user_model()


# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT Login with approval check"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Update login stats
            user = User.objects.get(username=request.data.get('username'))
            user.login_count += 1
            user.last_login_ip = self.get_client_ip(request)
            user.save(update_fields=['login_count', 'last_login_ip'])
        
        return response
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'detail': 'Password changed successfully. Please login again.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset via OTP"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        identifier = serializer.validated_data['identifier']
        
        # Find user
        user = User.objects.filter(
            Q(phone_number=identifier) | Q(email=identifier)
        ).first()
        
        if user:
            # TODO: Generate and send OTP via SMS/Email
            # For now, just return success
            return Response({
                'detail': 'OTP sent successfully',
                'identifier': identifier
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """Confirm password reset with OTP"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        identifier = serializer.validated_data['identifier']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        # TODO: Verify OTP (implement OTP verification logic)
        # For now, just reset password
        
        user = User.objects.filter(
            Q(phone_number=identifier) | Q(email=identifier)
        ).first()
        
        if user:
            user.set_password(new_password)
            user.save()
            
            return Response({
                'detail': 'Password reset successfully. You can now login.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'Invalid OTP or user not found'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# OTP VERIFICATION VIEWS
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to phone number"""
    serializer = SendOTPSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        purpose = serializer.validated_data['purpose']
        
        # TODO: Implement actual SMS OTP sending (Twilio, MSG91, etc.)
        # For demo, generate random OTP
        import random
        otp = str(random.randint(100000, 999999))
        
        # Store OTP in cache/database (implement caching)
        # cache.set(f'otp_{phone_number}', otp, timeout=300)  # 5 minutes
        
        return Response({
            'detail': 'OTP sent successfully',
            'phone_number': phone_number,
            'otp': otp  # Remove this in production!
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP"""
    serializer = VerifyOTPSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        otp = serializer.validated_data['otp']
        
        # TODO: Verify OTP from cache/database
        # stored_otp = cache.get(f'otp_{phone_number}')
        
        # For demo, accept any 6-digit OTP
        if len(otp) == 6:
            # Mark phone as verified if user exists
            user = User.objects.filter(phone_number=phone_number).first()
            if user:
                user.phone_verified = True
                user.save(update_fields=['phone_verified'])
            
            return Response({
                'detail': 'OTP verified successfully',
                'verified': True
            }, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'Invalid OTP',
            'verified': False
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# USER PROFILE VIEWS
# ============================================================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get/Update current user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        """Update user basic info only"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only allow updating specific fields
        allowed_fields = ['first_name', 'last_name', 'preferred_language', 'profile_picture']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = UserSerializer(instance, data=filtered_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(UserProfileSerializer(instance).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get role-specific dashboard stats"""
    user = request.user
    
    stats = {
        'user': UserSerializer(user).data,
        'role': user.role,
    }
    
    # Role-specific stats
    if user.role == 'FPO' and hasattr(user, 'fpo_profile'):
        profile = user.fpo_profile
        stats['profile'] = {
            'organization_name': profile.organization_name,
            'total_members': profile.total_members,
            'total_lots_created': profile.total_lots_created,
            'total_revenue': str(profile.total_revenue),
            'approval_status': user.approval_status,
        }
    
    elif user.role == 'PROCESSOR' and hasattr(user, 'processor_profile'):
        profile = user.processor_profile
        stats['profile'] = {
            'company_name': profile.company_name,
            'processor_type': profile.get_processor_type_display(),
            'daily_capacity': str(profile.daily_crushing_capacity),
            'utilization': str(profile.current_utilization),
            'total_procurement': str(profile.total_procurement_volume),
            'approval_status': user.approval_status,
        }
    
    elif user.role == 'RETAILER' and hasattr(user, 'retailer_profile'):
        profile = user.retailer_profile
        stats['profile'] = {
            'business_name': profile.business_name,
            'business_type': profile.get_business_type_display(),
            'total_orders': profile.total_orders,
            'total_purchase_volume': str(profile.total_purchase_volume),
            'approval_status': user.approval_status,
        }
    
    elif user.role == 'LOGISTICS' and hasattr(user, 'logistics_profile'):
        profile = user.logistics_profile
        stats['profile'] = {
            'company_name': profile.company_name,
            'service_type': profile.get_service_type_display(),
            'total_fleet_size': profile.total_fleet_size,
            'completed_deliveries': profile.completed_deliveries,
            'average_rating': str(profile.average_rating),
            'approval_status': user.approval_status,
        }
    
    elif user.role == 'GOVERNMENT' and hasattr(user, 'government_profile'):
        profile = user.government_profile
        
        # Pending approvals count
        pending_approvals = User.objects.filter(
            approval_status='PENDING'
        ).exclude(role='GOVERNMENT')
        
        if profile.designation != 'NATIONAL':
            pending_approvals = pending_approvals.filter(
                Q(fpo_profile__state=profile.state) |
                Q(processor_profile__state=profile.state) |
                Q(retailer_profile__state=profile.state) |
                Q(logistics_profile__coverage_states__contains=[profile.state])
            )
        
        stats['profile'] = {
            'designation': profile.get_designation_display(),
            'department': profile.department,
            'total_approvals': profile.total_approvals,
            'total_rejections': profile.total_rejections,
            'pending_approvals': pending_approvals.count(),
        }
    
    return Response(stats, status=status.HTTP_200_OK)


# ============================================================================
# FPO REGISTRATION VIEWS
# ============================================================================


import uuid
import json
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import User, FPOProfile
from .serializers import (
    FPORegistrationStep1Serializer,
    FPORegistrationStep2Serializer,
    FPORegistrationStep3Serializer,
    FPORegistrationStep4Serializer,
)
from logistics.models import Warehouse, Vehicle


def serialize_for_session(data):
    """
    Convert all Decimal objects to strings for session storage.
    Django sessions can't serialize Decimal objects directly.
    """
    if isinstance(data, dict):
        return {key: serialize_for_session(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_for_session(item) for item in data]
    elif isinstance(data, Decimal):
        return str(data)
    return data


def deserialize_from_session(data, decimal_fields=None):
    """
    Convert string Decimals back to Decimal type.
    
    Args:
        data: The data to deserialize
        decimal_fields: List of field names that should be Decimal
    """
    if decimal_fields is None:
        decimal_fields = []
    
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if key in decimal_fields and value is not None and value != '':
                try:
                    result[key] = Decimal(str(value))
                except (ValueError, TypeError):
                    result[key] = value
            else:
                result[key] = deserialize_from_session(value, decimal_fields)
        return result
    elif isinstance(data, list):
        return [deserialize_from_session(item, decimal_fields) for item in data]
    return data


class FPORegistrationViewSet(viewsets.ViewSet):
    """FPO Multi-Step Registration"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(detail=False, methods=['post'], url_path='step1')
    def step1(self, request):
        """Step 1: Organization Details"""
        serializer = FPORegistrationStep1Serializer(data=request.data)
        
        if serializer.is_valid():
            # Store in session (serialize Decimals to strings)
            validated_data = serialize_for_session(serializer.validated_data)
            validated_data['registration_started'] = str(timezone.now())
            
            request.session['fpo_step1'] = validated_data
            request.session.modified = True  # Force Django to save session
            
            return Response({
                'detail': 'Step 1 completed successfully',
                'next_step': '/api/users/fpo-registration/step2/',
                'data': validated_data  # Return data for frontend state
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step2')
    def step2(self, request):
        """Step 2: Location & Coverage"""
        # Check if Step 1 is completed
        if 'fpo_step1' not in request.session:
            return Response({
                'detail': 'Please complete Step 1 first',
                'error_code': 'STEP1_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FPORegistrationStep2Serializer(data=request.data)
        
        if serializer.is_valid():
            # Store in session (serialize Decimals to strings)
            validated_data = serialize_for_session(serializer.validated_data)
            
            request.session['fpo_step2'] = validated_data
            request.session.modified = True
            
            return Response({
                'detail': 'Step 2 completed successfully',
                'next_step': '/api/users/fpo-registration/step3/',
                'data': validated_data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step3')
    def step3(self, request):
        """Step 3: Infrastructure"""
        # Check if Step 2 is completed
        if 'fpo_step2' not in request.session:
            return Response({
                'detail': 'Please complete Step 2 first',
                'error_code': 'STEP2_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FPORegistrationStep3Serializer(data=request.data)
        
        if serializer.is_valid():
            # Store in session (serialize Decimals to strings)
            validated_data = serialize_for_session(serializer.validated_data)
            
            request.session['fpo_step3'] = validated_data
            request.session.modified = True
            
            return Response({
                'detail': 'Step 3 completed successfully',
                'next_step': '/api/users/fpo-registration/step4/',
                'data': validated_data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step4')
    @transaction.atomic
    def step4(self, request):
        """Step 4: Final Submission with User Creation"""
        # Check if Step 3 is completed
        if 'fpo_step3' not in request.session:
            return Response({
                'detail': 'Please complete Step 3 first',
                'error_code': 'STEP3_REQUIRED'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FPORegistrationStep4Serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Get all step data from session
                step1_data = request.session.get('fpo_step1', {})
                step2_data = request.session.get('fpo_step2', {})
                step3_data = request.session.get('fpo_step3', {})
                step4_data = serializer.validated_data
                
                # Define Decimal fields for each step
                step2_decimal_fields = ['total_land_coverage', 'latitude', 'longitude']
                step3_decimal_fields = ['average_annual_procurement']
                
                # Convert string Decimals back to Decimal type
                step2_data = deserialize_from_session(step2_data, step2_decimal_fields)
                step3_data = deserialize_from_session(step3_data, step3_decimal_fields)
                
                # Extract email and phone from Step 4
                email = request.data.get('email')
                phone_number = request.data.get('phone_number')
                
                # Validate required fields
                if not email:
                    return Response({
                        'email': ['Email is required']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if not phone_number:
                    return Response({
                        'phone_number': ['Phone number is required']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if email/phone already exists
                if User.objects.filter(email=email).exists():
                    return Response({
                        'email': ['This email is already registered']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if User.objects.filter(phone_number=phone_number).exists():
                    return Response({
                        'phone_number': ['This phone number is already registered']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Extract password
                password = step4_data.pop('password')
                step4_data.pop('password_confirm')
                
                # Parse contact person name
                contact_person_name = step1_data.get('contact_person_name', '')
                name_parts = contact_person_name.split()
                first_name = name_parts[0] if name_parts else 'User'
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                
                # Create User
                user = User.objects.create(
                    username=email.split('@')[0] + f"_{uuid.uuid4().hex[:4]}",
                    email=email,
                    phone_number=phone_number,
                    first_name=first_name,
                    last_name=last_name,
                    role='FPO',
                    approval_status='PENDING'
                )
                user.set_password(password)
                user.save()
                
                # Prepare FPO Profile data
                fpo_profile_data = {
                    'user': user,
                    # Step 1 fields
                    'organization_name': step1_data.get('organization_name'),
                    'registration_type': step1_data.get('registration_type'),
                    'registration_number': step1_data.get('registration_number'),
                    'year_of_registration': step1_data.get('year_of_registration'),
                    'total_members': step1_data.get('total_members'),
                    'contact_person_name': step1_data.get('contact_person_name'),
                    'contact_person_designation': step1_data.get('contact_person_designation', ''),
                    # Step 2 fields
                    'office_address': step2_data.get('office_address'),
                    'state': step2_data.get('state'),
                    'district': step2_data.get('district'),
                    'block': step2_data.get('block', ''),
                    'pincode': step2_data.get('pincode'),
                    'latitude': step2_data.get('latitude'),
                    'longitude': step2_data.get('longitude'),
                    'operational_villages': step2_data.get('operational_villages', []),
                    'total_land_coverage': step2_data.get('total_land_coverage'),
                    'primary_oilseeds': step2_data.get('primary_oilseeds', []),
                    # Step 3 fields
                    'has_storage': step3_data.get('has_storage', False),
                    'has_transport': step3_data.get('has_transport', False),
                    'uses_logistics_partners': step3_data.get('uses_logistics_partners', False),
                    'average_annual_procurement': step3_data.get('average_annual_procurement', 0),
                    # Step 4 fields
                    'registration_certificate': step4_data.get('registration_certificate'),
                    'gstin': step4_data.get('gstin', ''),
                    'bank_account_number': step4_data.get('bank_account_number'),
                    'ifsc_code': step4_data.get('ifsc_code'),
                    'bank_name': step4_data.get('bank_name', ''),
                    'branch_name': step4_data.get('branch_name', ''),
                    'cancelled_cheque': step4_data.get('cancelled_cheque'),
                }
                
                # Create FPO Profile
                fpo_profile = FPOProfile.objects.create(**fpo_profile_data)
                
                # Create Warehouses (if any)
                warehouses_data = step3_data.get('warehouses', [])
                warehouse_decimal_fields = ['capacity', 'latitude', 'longitude']
                
                for warehouse_data in warehouses_data:
                    warehouse_data = deserialize_from_session(warehouse_data, warehouse_decimal_fields)
                    Warehouse.objects.create(
                        owner_type='FPO',
                        owner_id=fpo_profile.id,
                        **warehouse_data
                    )
                
                # Create Vehicles (if any)
                vehicles_data = step3_data.get('vehicles', [])
                vehicle_decimal_fields = ['capacity']
                
                for vehicle_data in vehicles_data:
                    vehicle_data = deserialize_from_session(vehicle_data, vehicle_decimal_fields)
                    Vehicle.objects.create(
                        owner_type='FPO',
                        owner_id=fpo_profile.id,
                        **vehicle_data
                    )
                
                # Clear session data
                for key in ['fpo_step1', 'fpo_step2', 'fpo_step3']:
                    request.session.pop(key, None)
                request.session.modified = True
                
                # Generate application ID
                application_id = f'FPO-{user.id.hex[:8].upper()}'
                
                return Response({
                    'detail': 'Registration submitted successfully! Awaiting approval.',
                    'user_id': str(user.id),
                    'application_id': application_id,
                    'approval_status': user.approval_status,
                    'message': 'You will receive notification via SMS/Email once approved.',
                    'redirect_to': '/registration-success'
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Log the error for debugging
                print(f"Registration Error: {str(e)}")
                import traceback
                traceback.print_exc()
                
                return Response({
                    'detail': 'An error occurred during registration. Please try again.',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='progress')
    def progress(self, request):
        """Get current registration progress"""
        progress = {
            'step1_completed': 'fpo_step1' in request.session,
            'step2_completed': 'fpo_step2' in request.session,
            'step3_completed': 'fpo_step3' in request.session,
            'current_step': 1,
            'step1_data': request.session.get('fpo_step1'),
            'step2_data': request.session.get('fpo_step2'),
            'step3_data': request.session.get('fpo_step3'),
        }
        
        if progress['step3_completed']:
            progress['current_step'] = 4
        elif progress['step2_completed']:
            progress['current_step'] = 3
        elif progress['step1_completed']:
            progress['current_step'] = 2
        
        return Response(progress, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='clear-session')
    def clear_session(self, request):
        """Clear registration session (for testing/restart)"""
        for key in ['fpo_step1', 'fpo_step2', 'fpo_step3']:
            request.session.pop(key, None)
        request.session.modified = True
        
        return Response({
            'detail': 'Session cleared successfully'
        }, status=status.HTTP_200_OK)



class FPOProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """FPO Profile CRUD (Read-only for now)"""
    serializer_class = FPOProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'FPO':
            return FPOProfile.objects.filter(user=user)
        elif user.role == 'GOVERNMENT':
            return FPOProfile.objects.all()
        else:
            return FPOProfile.objects.filter(user__approval_status='APPROVED')
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """Get current user's FPO profile"""
        if request.user.role != 'FPO':
            return Response({
                'detail': 'You are not an FPO'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.fpo_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except FPOProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# PROCESSOR REGISTRATION VIEWS
# ============================================================================

class ProcessorRegistrationViewSet(viewsets.ViewSet):
    """Processor Multi-Step Registration"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(detail=False, methods=['post'], url_path='step1')
    def step1(self, request):
        """Step 1: Company Details"""
        serializer = ProcessorRegistrationStep1Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['processor_step1'] = serializer.validated_data
            request.session['processor_step1']['registration_started'] = str(timezone.now())
            
            return Response({
                'detail': 'Step 1 completed',
                'next_step': '/api/users/processor-registration/step2/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step2')
    def step2(self, request):
        """Step 2: Plant Location & Capacity"""
        if 'processor_step1' not in request.session:
            return Response({
                'detail': 'Please complete Step 1 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProcessorRegistrationStep2Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['processor_step2'] = serializer.validated_data
            
            return Response({
                'detail': 'Step 2 completed',
                'next_step': '/api/users/processor-registration/step3/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step3')
    def step3(self, request):
        """Step 3: Storage & Logistics"""
        if 'processor_step2' not in request.session:
            return Response({
                'detail': 'Please complete Step 2 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProcessorRegistrationStep3Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['processor_step3'] = serializer.validated_data
            
            return Response({
                'detail': 'Step 3 completed',
                'next_step': '/api/users/processor-registration/step4/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step4')
    def step4(self, request):
        """Step 4: Licenses & Compliance"""
        if 'processor_step3' not in request.session:
            return Response({
                'detail': 'Please complete Step 3 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProcessorRegistrationStep4Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['processor_step4'] = serializer.validated_data
            
            return Response({
                'detail': 'Step 4 completed',
                'next_step': '/api/users/processor-registration/step5/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step5')
    @transaction.atomic
    def step5(self, request):
        """Step 5: Market Preferences & Final Submission"""
        if 'processor_step4' not in request.session:
            return Response({
                'detail': 'Please complete Step 4 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProcessorRegistrationStep5Serializer(data=request.data)
        
        if serializer.is_valid():
            # Get all step data
            step1_data = request.session.get('processor_step1', {})
            step2_data = request.session.get('processor_step2', {})
            step3_data = request.session.get('processor_step3', {})
            step4_data = request.session.get('processor_step4', {})
            step5_data = serializer.validated_data
            
            # Extract password
            password = step5_data.pop('password')
            step5_data.pop('password_confirm')
            
            # Create User
            user = User.objects.create(
                username=request.data.get('email', f"proc_{uuid.uuid4().hex[:8]}"),
                email=request.data.get('email'),
                phone_number=request.data.get('phone_number'),
                first_name=step1_data.get('contact_person_name', '').split()[0],
                last_name=' '.join(step1_data.get('contact_person_name', '').split()[1:]),
                role='PROCESSOR',
                approval_status='PENDING'
            )
            user.set_password(password)
            user.save()
            
            # Create Processor Profile
            processor_profile_data = {
                **step1_data,
                **step2_data,
                **step3_data,
                **step4_data,
                **step5_data,
                'user': user,
            }
            
            # Remove non-model fields
            processor_profile_data.pop('registration_started', None)
            warehouses_data = processor_profile_data.pop('warehouses', [])
            vehicles_data = processor_profile_data.pop('vehicles', [])
            
            processor_profile = ProcessorProfile.objects.create(**processor_profile_data)
            
            # Create Warehouses
            for warehouse_data in warehouses_data:
                Warehouse.objects.create(
                    owner_type='PROCESSOR',
                    owner_id=processor_profile.id,
                    **warehouse_data
                )
            
            # Create Vehicles
            for vehicle_data in vehicles_data:
                Vehicle.objects.create(
                    owner_type='PROCESSOR',
                    owner_id=processor_profile.id,
                    **vehicle_data
                )
            
            # Clear session
            for key in ['processor_step1', 'processor_step2', 'processor_step3', 'processor_step4']:
                request.session.pop(key, None)
            
            return Response({
                'detail': 'Registration submitted successfully! Awaiting approval.',
                'user_id': str(user.id),
                'application_id': f'PROC-{user.id.hex[:8].upper()}',
                'approval_status': user.approval_status,
                'message': 'You will receive notification via SMS/Email within 72 hours.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProcessorProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Processor Profile ViewSet"""
    serializer_class = ProcessorProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'PROCESSOR':
            return ProcessorProfile.objects.filter(user=user)
        elif user.role == 'GOVERNMENT':
            return ProcessorProfile.objects.all()
        else:
            return ProcessorProfile.objects.filter(user__approval_status='APPROVED')
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's processor profile"""
        if request.user.role != 'PROCESSOR':
            return Response({
                'detail': 'You are not a Processor'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.processor_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ProcessorProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# RETAILER REGISTRATION VIEWS
# ============================================================================

class RetailerRegistrationViewSet(viewsets.ViewSet):
    """Retailer Multi-Step Registration"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(detail=False, methods=['post'], url_path='step1')
    def step1(self, request):
        """Step 1: Business Details"""
        serializer = RetailerRegistrationStep1Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['retailer_step1'] = serializer.validated_data
            request.session['retailer_step1']['registration_started'] = str(timezone.now())
            
            return Response({
                'detail': 'Step 1 completed',
                'next_step': '/api/users/retailer-registration/step2/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step2')
    def step2(self, request):
        """Step 2: Operational Details"""
        if 'retailer_step1' not in request.session:
            return Response({
                'detail': 'Please complete Step 1 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerRegistrationStep2Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['retailer_step2'] = serializer.validated_data
            
            return Response({
                'detail': 'Step 2 completed',
                'next_step': '/api/users/retailer-registration/step3/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step3')
    @transaction.atomic
    def step3(self, request):
        """Step 3: Preferences & Banking - Final Submission"""
        if 'retailer_step2' not in request.session:
            return Response({
                'detail': 'Please complete Step 2 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerRegistrationStep3Serializer(data=request.data)
        
        if serializer.is_valid():
            # Get all step data
            step1_data = request.session.get('retailer_step1', {})
            step2_data = request.session.get('retailer_step2', {})
            step3_data = serializer.validated_data
            
            # Extract password
            password = step3_data.pop('password')
            step3_data.pop('password_confirm')
            
            # Create User
            user = User.objects.create(
                username=request.data.get('email', f"ret_{uuid.uuid4().hex[:8]}"),
                email=request.data.get('email'),
                phone_number=request.data.get('phone_number'),
                first_name=step1_data.get('contact_person_name', '').split()[0],
                last_name=' '.join(step1_data.get('contact_person_name', '').split()[1:]),
                role='RETAILER',
                approval_status='PENDING'
            )
            user.set_password(password)
            user.save()
            
            # Create Retailer Profile
            retailer_profile_data = {
                **step1_data,
                **step2_data,
                **step3_data,
                'user': user,
            }
            
            retailer_profile_data.pop('registration_started', None)
            
            retailer_profile = RetailerProfile.objects.create(**retailer_profile_data)
            
            # Create Warehouse if has_warehouse
            if step2_data.get('has_warehouse'):
                Warehouse.objects.create(
                    owner_type='RETAILER',
                    owner_id=retailer_profile.id,
                    warehouse_name=f"{step1_data['business_name']} Main Warehouse",
                    address=step2_data['warehouse_location'],
                    state=step2_data['state'],
                    district=step2_data['city'],
                    pincode=step2_data['pincode'],
                    warehouse_type='OWNED',
                    storage_type='COVERED',
                    total_capacity=step2_data.get('storage_capacity', 0)
                )
            
            # Clear session
            for key in ['retailer_step1', 'retailer_step2']:
                request.session.pop(key, None)
            
            return Response({
                'detail': 'Registration submitted successfully! Awaiting approval.',
                'user_id': str(user.id),
                'application_id': f'RET-{user.id.hex[:8].upper()}',
                'approval_status': user.approval_status,
                'message': 'You will receive notification via SMS/Email within 48 hours.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetailerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Retailer Profile ViewSet"""
    serializer_class = RetailerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'RETAILER':
            return RetailerProfile.objects.filter(user=user)
        elif user.role == 'GOVERNMENT':
            return RetailerProfile.objects.all()
        else:
            return RetailerProfile.objects.filter(user__approval_status='APPROVED')
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's retailer profile"""
        if request.user.role != 'RETAILER':
            return Response({
                'detail': 'You are not a Retailer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.retailer_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except RetailerProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# LOGISTICS REGISTRATION VIEWS
# ============================================================================

class LogisticsRegistrationViewSet(viewsets.ViewSet):
    """Logistics Partner Multi-Step Registration"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(detail=False, methods=['post'], url_path='step1')
    def step1(self, request):
        """Step 1: Company Details"""
        serializer = LogisticsRegistrationStep1Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['logistics_step1'] = serializer.validated_data
            request.session['logistics_step1']['registration_started'] = str(timezone.now())
            
            return Response({
                'detail': 'Step 1 completed',
                'next_step': '/api/users/logistics-registration/step2/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step2')
    def step2(self, request):
        """Step 2: Fleet & Infrastructure"""
        if 'logistics_step1' not in request.session:
            return Response({
                'detail': 'Please complete Step 1 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LogisticsRegistrationStep2Serializer(data=request.data)
        
        if serializer.is_valid():
            request.session['logistics_step2'] = serializer.validated_data
            
            return Response({
                'detail': 'Step 2 completed',
                'next_step': '/api/users/logistics-registration/step3/'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='step3')
    @transaction.atomic
    def step3(self, request):
        """Step 3: Compliance & Banking - Final Submission"""
        if 'logistics_step2' not in request.session:
            return Response({
                'detail': 'Please complete Step 2 first'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LogisticsRegistrationStep3Serializer(data=request.data)
        
        if serializer.is_valid():
            # Get all step data
            step1_data = request.session.get('logistics_step1', {})
            step2_data = request.session.get('logistics_step2', {})
            step3_data = serializer.validated_data
            
            # Extract password
            password = step3_data.pop('password')
            step3_data.pop('password_confirm')
            
            # Create User
            user = User.objects.create(
                username=request.data.get('email', f"log_{uuid.uuid4().hex[:8]}"),
                email=request.data.get('email'),
                phone_number=request.data.get('phone_number'),
                first_name=step1_data.get('contact_person_name', '').split()[0],
                last_name=' '.join(step1_data.get('contact_person_name', '').split()[1:]),
                role='LOGISTICS',
                approval_status='PENDING'
            )
            user.set_password(password)
            user.save()
            
            # Create Logistics Profile
            logistics_profile_data = {
                **step1_data,
                **step2_data,
                **step3_data,
                'user': user,
            }
            
            logistics_profile_data.pop('registration_started', None)
            warehouses_data = logistics_profile_data.pop('warehouses', [])
            vehicles_data = logistics_profile_data.pop('vehicles', [])
            
            logistics_profile = LogisticsProfile.objects.create(**logistics_profile_data)
            
            # Create Warehouses
            for warehouse_data in warehouses_data:
                Warehouse.objects.create(
                    owner_type='LOGISTICS',
                    owner_id=logistics_profile.id,
                    **warehouse_data
                )
            
            # Create Vehicles
            for vehicle_data in vehicles_data:
                Vehicle.objects.create(
                    owner_type='LOGISTICS',
                    owner_id=logistics_profile.id,
                    **vehicle_data
                )
            
            # Clear session
            for key in ['logistics_step1', 'logistics_step2']:
                request.session.pop(key, None)
            
            return Response({
                'detail': 'Registration submitted successfully! Awaiting approval.',
                'user_id': str(user.id),
                'application_id': f'LOG-{user.id.hex[:8].upper()}',
                'approval_status': user.approval_status,
                'message': 'You will receive notification via SMS/Email within 48 hours.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogisticsProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Logistics Profile ViewSet"""
    serializer_class = LogisticsProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'LOGISTICS':
            return LogisticsProfile.objects.filter(user=user)
        elif user.role == 'GOVERNMENT':
            return LogisticsProfile.objects.all()
        else:
            return LogisticsProfile.objects.filter(user__approval_status='APPROVED')
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's logistics profile"""
        if request.user.role != 'LOGISTICS':
            return Response({
                'detail': 'You are not a Logistics Partner'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.logistics_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except LogisticsProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# GOVERNMENT APPROVAL VIEWS
# ============================================================================

class GovernmentApprovalViewSet(viewsets.ViewSet):
    """Government Approval Management"""
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Only government users can access"""
        if self.action in ['list_pending', 'approve_user', 'reject_user']:
            return [IsAuthenticated()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='pending')
    def list_pending(self, request):
        """List all pending approvals"""
        user = request.user
        
        if user.role != 'GOVERNMENT':
            return Response({
                'detail': 'Only government officials can access this'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get government profile
        try:
            gov_profile = user.government_profile
        except GovernmentProfile.DoesNotExist:
            return Response({
                'detail': 'Government profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Base query
        pending_users = User.objects.filter(
            approval_status='PENDING'
        ).exclude(role='GOVERNMENT')
        
        # Filter by jurisdiction
        if gov_profile.designation != 'NATIONAL':
            # State/District level filtering
            state_filter = Q()
            
            if gov_profile.state:
                state_filter = (
                    Q(fpo_profile__state=gov_profile.state) |
                    Q(processor_profile__state=gov_profile.state) |
                    Q(retailer_profile__state=gov_profile.state) |
                    Q(logistics_profile__coverage_states__contains=[gov_profile.state])
                )
            
            pending_users = pending_users.filter(state_filter)
        
        # Build response
        pending_list = []
        for pending_user in pending_users:
            data = {
                'user_id': str(pending_user.id),
                'applicant_name': pending_user.get_full_name(),
                'role': pending_user.role,
                'email': pending_user.email,
                'phone_number': pending_user.phone_number,
                'applied_date': pending_user.created_at,
            }
            
            # Add role-specific data
            if pending_user.role == 'FPO' and hasattr(pending_user, 'fpo_profile'):
                profile = pending_user.fpo_profile
                data.update({
                    'organization_name': profile.organization_name,
                    'registration_number': profile.registration_number,
                    'location': f"{profile.district}, {profile.state}",
                })
            
            elif pending_user.role == 'PROCESSOR' and hasattr(pending_user, 'processor_profile'):
                profile = pending_user.processor_profile
                data.update({
                    'organization_name': profile.company_name,
                    'gstin': profile.gstin,
                    'location': f"{profile.district}, {profile.state}",
                })
            
            elif pending_user.role == 'RETAILER' and hasattr(pending_user, 'retailer_profile'):
                profile = pending_user.retailer_profile
                data.update({
                    'organization_name': profile.business_name,
                    'gstin': profile.gstin,
                    'location': f"{profile.city}, {profile.state}",
                })
            
            elif pending_user.role == 'LOGISTICS' and hasattr(pending_user, 'logistics_profile'):
                profile = pending_user.logistics_profile
                data.update({
                    'organization_name': profile.company_name,
                    'gstin': profile.gstin,
                    'location': ', '.join(profile.coverage_states[:3]),
                })
            
            pending_list.append(data)
        
        return Response({
            'count': len(pending_list),
            'results': pending_list
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='approve')
    @transaction.atomic
    def approve_user(self, request, pk=None):
        """Approve a pending user"""
        user = request.user
        
        if user.role != 'GOVERNMENT':
            return Response({
                'detail': 'Only government officials can approve'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            gov_profile = user.government_profile
            pending_user = User.objects.get(pk=pk, approval_status='PENDING')
            
            # Update approval status
            pending_user.approval_status = 'APPROVED'
            pending_user.approved_by = user
            pending_user.approved_at = timezone.now()
            pending_user.save()
            
            # Update government profile stats
            gov_profile.total_approvals += 1
            gov_profile.save(update_fields=['total_approvals'])
            
            # TODO: Send approval notification (SMS/Email)
            
            return Response({
                'detail': f'{pending_user.get_role_display()} approved successfully',
                'user_id': str(pending_user.id),
                'approved_at': pending_user.approved_at,
                'approved_by': user.get_full_name()
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({
                'detail': 'User not found or already processed'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='reject')
    @transaction.atomic
    def reject_user(self, request, pk=None):
        """Reject a pending user"""
        user = request.user
        
        if user.role != 'GOVERNMENT':
            return Response({
                'detail': 'Only government officials can reject'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ApprovalActionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                gov_profile = user.government_profile
                pending_user = User.objects.get(pk=pk, approval_status='PENDING')
                
                # Update rejection status
                pending_user.approval_status = 'REJECTED'
                pending_user.rejection_reason = serializer.validated_data['rejection_reason']
                pending_user.approved_by = user
                pending_user.approved_at = timezone.now()
                pending_user.save()
                
                # Update government profile stats
                gov_profile.total_rejections += 1
                gov_profile.save(update_fields=['total_rejections'])
                
                # TODO: Send rejection notification
                
                return Response({
                    'detail': f'{pending_user.get_role_display()} rejected',
                    'user_id': str(pending_user.id),
                    'rejection_reason': pending_user.rejection_reason
                }, status=status.HTTP_200_OK)
            
            except User.DoesNotExist:
                return Response({
                    'detail': 'User not found or already processed'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GovernmentProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """Government Profile ViewSet"""
    serializer_class = GovernmentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'GOVERNMENT':
            return GovernmentProfile.objects.filter(user=self.request.user)
        return GovernmentProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current government official's profile"""
        if request.user.role != 'GOVERNMENT':
            return Response({
                'detail': 'You are not a Government Official'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.government_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except GovernmentProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# FARMER PROFILE VIEWS (Mobile App)
# ============================================================================

class FarmerProfileViewSet(viewsets.ModelViewSet):
    """Farmer Profile ViewSet (Mobile App Only)"""
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'FARMER':
            return FarmerProfile.objects.filter(user=user)
        elif user.role == 'GOVERNMENT':
            return FarmerProfile.objects.all()
        elif user.role == 'FPO':
            # FPOs can see farmers in their area
            try:
                fpo_profile = user.fpo_profile
                return FarmerProfile.objects.filter(
                    state=fpo_profile.state,
                    district=fpo_profile.district
                )
            except FPOProfile.DoesNotExist:
                return FarmerProfile.objects.none()
        
        return FarmerProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current farmer's profile"""
        if request.user.role != 'FARMER':
            return Response({
                'detail': 'You are not a Farmer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.farmer_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except FarmerProfile.DoesNotExist:
            return Response({
                'detail': 'Profile not found. Please complete registration.'
            }, status=status.HTTP_404_NOT_FOUND)
            
            
            
            