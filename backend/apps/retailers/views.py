from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Q, Sum, Count
from .models import Retailer
from .serializers import (
    RetailerSerializer, RetailerListSerializer,
    RetailerRegistrationStep1Serializer, RetailerRegistrationStep2Serializer,
    RetailerRegistrationStep3Serializer, RetailerRegistrationCompleteSerializer
)
from apps.users.models import User, UserProfile
from .utils import (
    create_registration_token,
    store_registration_data,
    get_registration_data,
    clear_registration_data
)


class RetailerRegistrationStep1View(APIView):
    """Step 1: Create User Account"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RetailerRegistrationStep1Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create registration token
        token = create_registration_token()
        
        # Store data with token
        registration_data = {
            'phone_number': serializer.validated_data['phone_number'],
            'full_name': serializer.validated_data['full_name'],
            'email': serializer.validated_data.get('email', ''),
            'password': serializer.validated_data['password'],
            'preferred_language': serializer.validated_data.get('preferred_language', 'en'),
        }
        
        store_registration_data(token, 'step1', registration_data)
        
        return Response({
            'message': 'Step 1 completed',
            'next_step': 'step2',
            'registration_token': token,
            'data': {
                'phone_number': serializer.validated_data['phone_number'],
                'full_name': serializer.validated_data['full_name'],
            }
        }, status=status.HTTP_200_OK)


class RetailerRegistrationStep2View(APIView):
    """Step 2: User Profile Details"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Get registration token from request
        token = request.data.get('registration_token')
        
        if not token:
            return Response({
                'error': 'Registration token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if step 1 is completed
        step1_data = get_registration_data(token, 'step1')
        if not step1_data:
            return Response({
                'error': 'Please complete step 1 first or your session has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerRegistrationStep2Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Store in cache with token
        store_registration_data(token, 'step2', serializer.validated_data)
        
        return Response({
            'message': 'Step 2 completed',
            'next_step': 'step3',
            'registration_token': token,
            'data': {
                'district': serializer.validated_data['district'],
                'state': serializer.validated_data['state'],
            }
        }, status=status.HTTP_200_OK)


class RetailerRegistrationStep3View(APIView):
    """Step 3: Retailer Business Details & Complete Registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Get registration token
        token = request.data.get('registration_token')
        
        if not token:
            return Response({
                'error': 'Registration token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check previous steps
        step1_data = get_registration_data(token, 'step1')
        step2_data = get_registration_data(token, 'step2')
        
        if not step1_data or not step2_data:
            return Response({
                'error': 'Please complete all previous steps or your session has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RetailerRegistrationStep3Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create everything in a transaction
        try:
            with transaction.atomic():
                # 1. Create User
                user = User.objects.create_user(
                    phone_number=step1_data['phone_number'],
                    full_name=step1_data['full_name'],
                    email=step1_data.get('email'),
                    password=step1_data['password'],
                    role='retailer',
                    preferred_language=step1_data.get('preferred_language', 'en')
                )
                
                # 2. Create UserProfile (only UserProfile fields!)
                profile = UserProfile.objects.create(
                    user=user,
                    date_of_birth=step2_data.get('date_of_birth'),
                    gender=step2_data.get('gender'),
                    address_line1=step2_data.get('address_line1', ''),
                    address_line2=step2_data.get('address_line2', ''),
                    village=step2_data.get('village', ''),
                    block=step2_data.get('block', ''),
                    district=step2_data['district'],
                    state=step2_data['state'],
                    pincode=step2_data['pincode'],
                    bank_name=step2_data.get('bank_name', ''),
                    account_number=step2_data.get('account_number', ''),
                    ifsc_code=step2_data.get('ifsc_code', ''),
                    account_holder_name=step2_data.get('account_holder_name', ''),
                )
                
                # 3. Create Retailer (city goes here!)
                retailer_data = serializer.validated_data
                retailer = Retailer.objects.create(
                    user=user,
                    business_name=retailer_data['business_name'],
                    retailer_type=retailer_data['retailer_type'],
                    city=retailer_data['city'],  # From step 3
                    state=retailer_data.get('state', step2_data['state']),  # Can override from profile
                    pincode=retailer_data.get('pincode', step2_data['pincode']),
                    gstin=retailer_data['gstin'],
                    fssai_license=retailer_data.get('fssai_license', ''),
                    monthly_requirement=retailer_data['monthly_requirement'],
                    payment_terms=retailer_data['payment_terms'],
                    contact_person=retailer_data['contact_person'],
                    contact_phone=retailer_data['contact_phone'],
                    contact_email=retailer_data['contact_email'],
                )
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                
                # Clear registration data
                clear_registration_data(token)
                
                return Response({
                    'message': 'Retailer registered successfully! Awaiting verification.',
                    'user': {
                        'id': str(user.id),
                        'phone_number': user.phone_number,
                        'full_name': user.full_name,
                        'role': user.role,
                    },
                    'retailer': {
                        'id': str(retailer.id),
                        'business_name': retailer.business_name,
                        'retailer_code': retailer.retailer_code,
                        'is_verified': retailer.is_verified,
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class RetailerRegistrationSingleStepView(APIView):
    """Single-step Retailer Registration (All data at once)"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Complete Retailer registration in one go"""
        serializer = RetailerRegistrationCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            with transaction.atomic():
                # 1. Create User
                user = User.objects.create_user(
                    phone_number=data['phone_number'],
                    full_name=data['full_name'],
                    email=data.get('email', ''),
                    password=data['password'],
                    role='retailer',
                    preferred_language=data.get('preferred_language', 'en')
                )
                
                # 2. Create UserProfile (only profile fields)
                profile_data = data['profile']
                profile = UserProfile.objects.create(
                    user=user,
                    date_of_birth=profile_data.get('date_of_birth'),
                    gender=profile_data.get('gender'),
                    address_line1=profile_data.get('address_line1', ''),
                    address_line2=profile_data.get('address_line2', ''),
                    village=profile_data.get('village', ''),
                    block=profile_data.get('block', ''),
                    district=profile_data['district'],
                    state=profile_data['state'],
                    pincode=profile_data['pincode'],
                    bank_name=profile_data.get('bank_name', ''),
                    account_number=profile_data.get('account_number', ''),
                    ifsc_code=profile_data.get('ifsc_code', ''),
                    account_holder_name=profile_data.get('account_holder_name', ''),
                )
                
                # 3. Create Retailer
                retailer_data = data['retailer']
                retailer = Retailer.objects.create(
                    user=user,
                    business_name=retailer_data['business_name'],
                    retailer_type=retailer_data['retailer_type'],
                    city=retailer_data['city'],
                    state=retailer_data.get('state', profile_data['state']),
                    pincode=retailer_data.get('pincode', profile_data['pincode']),
                    gstin=retailer_data['gstin'],
                    fssai_license=retailer_data.get('fssai_license', ''),
                    monthly_requirement=retailer_data['monthly_requirement'],
                    payment_terms=retailer_data['payment_terms'],
                    contact_person=retailer_data['contact_person'],
                    contact_phone=retailer_data['contact_phone'],
                    contact_email=retailer_data['contact_email'],
                )
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Retailer registered successfully! Awaiting verification.',
                    'user': {
                        'id': str(user.id),
                        'phone_number': user.phone_number,
                        'full_name': user.full_name,
                        'role': user.role,
                    },
                    'retailer': RetailerSerializer(retailer).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


# ...existing RetailerViewSet code...


class RetailerViewSet(viewsets.ModelViewSet):
    """Retailer CRUD Operations"""
    queryset = Retailer.objects.select_related('user').all()
    serializer_class = RetailerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter based on role"""
        user = self.request.user
        queryset = Retailer.objects.select_related('user')
        
        # Retailer sees only their profile
        if user.role == 'retailer':
            return queryset.filter(user=user)
        
        # Filters
        state = self.request.query_params.get('state')
        city = self.request.query_params.get('city')
        retailer_type = self.request.query_params.get('retailer_type')
        is_verified = self.request.query_params.get('is_verified')
        search = self.request.query_params.get('search')
        
        if state:
            queryset = queryset.filter(state__iexact=state)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if retailer_type:
            queryset = queryset.filter(retailer_type=retailer_type)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search) |
                Q(retailer_code__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RetailerListSerializer
        return RetailerSerializer
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current retailer's profile"""
        try:
            retailer = Retailer.objects.get(user=request.user)
            serializer = self.get_serializer(retailer)
            return Response(serializer.data)
        except Retailer.DoesNotExist:
            return Response({
                'error': 'Retailer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify retailer (admin only)"""
        if request.user.role != 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        retailer = self.get_object()
        retailer.is_verified = True
        retailer.save()
        
        return Response({
            'message': f'Retailer {retailer.business_name} verified'
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Retailer statistics"""
        stats = Retailer.objects.aggregate(
            total_retailers=Count('id'),
            verified_retailers=Count('id', filter=Q(is_verified=True)),
            total_requirement=Sum('monthly_requirement')
        )
        return Response(stats)