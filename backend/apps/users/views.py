from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
import random
import logging

from .models import User, UserProfile
from .serializers import (
    UserSerializer, UserListSerializer, RegisterSerializer,
    LoginSerializer, ChangePasswordSerializer, UserProfileSerializer,PhoneVerificationSerializer,
    VerifyOTPSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, UserStatsSerializer
)
from .permissions import IsOwnerOrAdmin, IsAdmin, IsKYCVerifier

logger = logging.getLogger(__name__)


# ==================== Authentication Views ====================

class RegisterView(generics.CreateAPIView):
    """
    User Registration
    POST /api/users/register/
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Send OTP for phone verification (implement in production)
        # self.send_verification_otp(user.phone_number)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful. Please verify your phone number.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    User Login
    POST /api/users/login/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    User Logout
    POST /api/users/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.UpdateAPIView):
    """
    Change Password
    POST /api/users/change-password/
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


# ==================== User Management Views ====================

class UserViewSet(viewsets.ModelViewSet):
    """
    User CRUD operations
    GET    /api/users/          - List all users
    POST   /api/users/          - Create user
    GET    /api/users/{id}/     - Get user details
    PUT    /api/users/{id}/     - Update user
    PATCH  /api/users/{id}/     - Partial update
    DELETE /api/users/{id}/     - Delete user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        queryset = User.objects.select_related('profile').all()
        
        # Non-admin users can only see themselves
        if user.role not in ['admin']:
            return queryset.filter(id=user.id)
        
        # Filters
        role = self.request.query_params.get('role')
        state = self.request.query_params.get('state')
        district = self.request.query_params.get('district')
        is_verified = self.request.query_params.get('is_verified')
        search = self.request.query_params.get('search')
        
        if role:
            queryset = queryset.filter(role=role)
        
        if state:
            queryset = queryset.filter(profile__state__iexact=state)
        
        if district:
            queryset = queryset.filter(profile__district__iexact=district)
        
        if is_verified is not None:
            is_verified_bool = is_verified.lower() == 'true'
            queryset = queryset.filter(is_kyc_verified=is_verified_bool)
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        Get current user profile
        GET /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        """
        Update current user profile
        PATCH /api/users/update-profile/
        """
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'user': serializer.data,
            'message': 'Profile updated successfully'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def deactivate(self, request, pk=None):
        """
        Deactivate user
        POST /api/users/{id}/deactivate/
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'User {user.full_name} deactivated successfully'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def activate(self, request, pk=None):
        """
        Activate user
        POST /api/users/{id}/activate/
        """
        user = self.get_object()
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.full_name} activated successfully'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def statistics(self, request):
        """
        User statistics
        GET /api/users/statistics/
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(is_kyc_verified=True).count()
        
        # Users by role
        users_by_role = dict(
            User.objects.values_list('role').annotate(count=Count('role'))
        )
        
        # Users by state
        users_by_state = dict(
            UserProfile.objects.values_list('state').annotate(count=Count('state'))
        )
        
        # Recent registrations (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_registrations = User.objects.filter(
            date_joined__gte=thirty_days_ago
        ).count()
        
        serializer = UserStatsSerializer(data={
            'total_users': total_users,
            'active_users': active_users,
            'verified_users': verified_users,
            'users_by_role': users_by_role,
            'users_by_state': users_by_state,
            'recent_registrations': recent_registrations,
        })
        serializer.is_valid()
        
        return Response(serializer.data)


# ==================== Phone Verification Views ====================


class PhoneVerificationView(APIView):
    """Send OTP for phone verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        from django.core.cache import cache
        import random
        
        serializer = PhoneVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        
        # Check if user exists
        if User.objects.filter(phone_number=phone_number).exists():
            return Response({
                'error': 'Phone number already registered'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Store in cache (10 minutes expiry)
        cache.set(f'registration_otp_{phone_number}', otp, timeout=600)
        
        # TODO: Send via SMS service (Twilio, MSG91, etc.)
        logger.info(f"Registration OTP for {phone_number}: {otp}")
        
        return Response({
            'message': 'OTP sent successfully',
            'otp': otp  # Remove in production
        })


class VerifyRegistrationOTPView(APIView):
    """Verify OTP before farmer registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        from django.core.cache import cache
        
        phone_number = request.data.get('phone_number')
        otp = request.data.get('otp')
        
        if not phone_number or not otp:
            return Response({
                'error': 'Phone number and OTP required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP from cache
        stored_otp = cache.get(f'registration_otp_{phone_number}')
        
        if not stored_otp:
            return Response({
                'error': 'OTP expired or not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if stored_otp != otp:
            return Response({
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified
        cache.set(f'otp_verified_{phone_number}', True, timeout=1800)  # 30 min
        cache.delete(f'registration_otp_{phone_number}')
        
        return Response({
            'message': 'OTP verified successfully',
            'verified': True
        })


# ==================== Password Reset Views ====================

class ForgotPasswordView(APIView):
    """
    Send OTP for password reset
    POST /api/users/forgot-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP
        request.session[f'reset_otp_{phone_number}'] = otp
        request.session[f'reset_otp_{phone_number}_created'] = str(timezone.now())
        
        # Send OTP
        logger.info(f"Password reset OTP for {phone_number}: {otp}")
        
        return Response({
            'message': 'Password reset OTP sent successfully',
            'otp': otp  # Remove in production
        })


class ResetPasswordView(APIView):
    """
    Reset password with OTP
    POST /api/users/reset-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        # Verify OTP
        stored_otp = request.session.get(f'reset_otp_{phone_number}')
        
        if not stored_otp or stored_otp != otp:
            return Response({
                'error': 'Invalid or expired OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset password
        try:
            user = User.objects.get(phone_number=phone_number)
            user.set_password(new_password)
            user.save()
            
            # Clear OTP
            del request.session[f'reset_otp_{phone_number}']
            
            return Response({
                'message': 'Password reset successfully'
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)






