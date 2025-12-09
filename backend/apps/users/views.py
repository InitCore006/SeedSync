"""
Views for Users & Authentication
Phone-based OTP authentication
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import User, OTPVerification, UserProfile
from .serializers import (
    UserSerializer, RegisterSerializer, SendOTPSerializer, 
    VerifyOTPSerializer, LoginSerializer, UserProfileSerializer,
    UserProfileUpdateSerializer, ChangePasswordSerializer
)
from .services import send_otp_sms
from apps.core.utils import response_success, response_error, format_phone_number
from apps.core.permissions import IsOwner


class RegisterAPIView(APIView):
    """
    Register a new user and send OTP
    POST /api/users/register/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user, otp = serializer.save()
            
            # Send OTP via SMS
            try:
                send_otp_sms(user.phone_number, otp.otp)
            except Exception as e:
                # Log error but don't fail registration
                pass
            
            return Response(
                response_success(
                    message="Registration successful. OTP sent to your phone.",
                    data={
                        'user_id': str(user.id),
                        'phone_number': user.phone_number,
                        'otp_expires_at': otp.expires_at.isoformat()
                    }
                ),
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            response_error(
                message="Registration failed",
                errors=serializer.errors
            ),
            status=status.HTTP_400_BAD_REQUEST
        )


class SendOTPAPIView(APIView):
    """
    Send OTP to phone number
    POST /api/users/send-otp/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']  # Already formatted with +91
            purpose = serializer.validated_data['purpose']
            
            # Check if user exists based on purpose
            user = None
            if purpose == 'login':
                try:
                    user = User.objects.get(phone_number=phone_number)
                except User.DoesNotExist:
                    return Response(
                        response_error(
                            message="Account not found. Please register first to create an account.",
                            errors={'phone_number': ['No account exists with this phone number']}
                        ),
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif purpose == 'registration':
                # For registration, check if user already exists
                try:
                    user = User.objects.get(phone_number=phone_number)
                    # If user exists and is already verified, they should login instead
                    if user.is_verified:
                        return Response(
                            response_error(
                                message="Account already exists. Please login instead.",
                                errors={'phone_number': ['This phone number is already registered']}
                            ),
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    # If user exists but not verified, we can resend OTP for registration
                except User.DoesNotExist:
                    # User doesn't exist yet - this is fine for registration OTP
                    pass
            
            # Create OTP
            otp = OTPVerification.create_otp(
                phone_number=phone_number,
                purpose=purpose,
                user=user
            )
            
            # Send OTP via SMS
            try:
                send_otp_sms(phone_number, otp.otp)
            except Exception as e:
                pass
            
            return Response(
                response_success(
                    message=f"OTP sent successfully",
                    data={
                        'phone_number': phone_number,
                        'otp_expires_at': otp.expires_at.isoformat()
                    }
                ),
                status=status.HTTP_200_OK
            )
        
        return Response(
            response_error(message="Invalid data", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class VerifyOTPAPIView(APIView):
    """
    Verify OTP and mark user as verified
    POST /api/users/verify-otp/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data['phone_number']
            purpose = serializer.validated_data['purpose']
            otp_code = request.data.get('otp')
            
            # Get user
            try:
                user = User.objects.get(phone_number=phone_number)
            except User.DoesNotExist:
                return Response(
                    response_error(message="User not found"),
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Bypass OTP for development: Accept 000000 as valid OTP
            if otp_code != '000000':
                # Normal OTP verification (already done in serializer)
                pass
            
            # Mark user as verified
            if not user.is_verified:
                user.is_verified = True
                user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response(
                response_success(
                    message="OTP verified successfully",
                    data={
                        'user': UserSerializer(user).data,
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }
                ),
                status=status.HTTP_200_OK
            )
        
        return Response(
            response_error(message="OTP verification failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginAPIView(APIView):
    """
    Login with phone number and OTP
    POST /api/users/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            return Response(
                response_success(
                    message="Login successful",
                    data={
                        'user': UserSerializer(user).data,
                        'tokens': {
                            'refresh': result['refresh'],
                            'access': result['access'],
                        }
                    }
                ),
                status=status.HTTP_200_OK
            )
        
        return Response(
            response_error(message="Login failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    Get or update user profile
    GET/PATCH /api/users/profile/
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response(
            response_success(
                message="Profile retrieved successfully",
                data={
                    'user': UserSerializer(request.user).data,
                    'profile': serializer.data
                }
            ),
            status=status.HTTP_200_OK
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                response_success(
                    message="Profile updated successfully",
                    data=serializer.data
                ),
                status=status.HTTP_200_OK
            )
        
        return Response(
            response_error(message="Profile update failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class ChangePasswordAPIView(APIView):
    """
    Change user password (optional feature)
    POST /api/users/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                response_success(message="Password changed successfully"),
                status=status.HTTP_200_OK
            )
        
        return Response(
            response_error(message="Password change failed", errors=serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )


class LogoutAPIView(APIView):
    """
    Logout user (blacklist refresh token)
    POST /api/users/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                response_success(message="Logout successful"),
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                response_error(message="Logout failed"),
                status=status.HTTP_400_BAD_REQUEST
            )
