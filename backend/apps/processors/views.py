from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.db.models import Q, Sum, Count
from .models import Processor
from .serializers import (
    ProcessorSerializer, ProcessorListSerializer,
    ProcessorRegistrationStep1Serializer, ProcessorRegistrationStep2Serializer,
    ProcessorRegistrationStep3Serializer, ProcessorRegistrationCompleteSerializer
)
from apps.users.models import User, UserProfile
from .utils import (
    create_registration_token,
    store_registration_data,
    get_registration_data,
    clear_registration_data
)


class ProcessorRegistrationStep1View(APIView):
    """Step 1: Create User Account"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ProcessorRegistrationStep1Serializer(data=request.data)
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


class ProcessorRegistrationStep2View(APIView):
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
        
        serializer = ProcessorRegistrationStep2Serializer(data=request.data)
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


class ProcessorRegistrationStep3View(APIView):
    """Step 3: Processor Business Details & Complete Registration"""
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
        
        serializer = ProcessorRegistrationStep3Serializer(data=request.data)
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
                    role='processor',
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
                
                # 3. Create Processor (city goes here!)
                processor_data = serializer.validated_data
                processor = Processor.objects.create(
                    user=user,
                    company_name=processor_data['company_name'],
                    business_scale=processor_data['business_scale'],
                    city=processor_data['city'],  # From step 3
                    state=processor_data.get('state', step2_data['state']),
                    pincode=processor_data.get('pincode', step2_data['pincode']),
                    gstin=processor_data['gstin'],
                    fssai_license=processor_data['fssai_license'],
                    monthly_capacity=processor_data['monthly_capacity'],
                    monthly_requirement=processor_data['monthly_requirement'],
                    contact_person=processor_data['contact_person'],
                    contact_phone=processor_data['contact_phone'],
                    contact_email=processor_data['contact_email'],
                )
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                
                # Clear registration data
                clear_registration_data(token)
                
                return Response({
                    'message': 'Processor registered successfully! Awaiting verification.',
                    'user': {
                        'id': str(user.id),
                        'phone_number': user.phone_number,
                        'full_name': user.full_name,
                        'role': user.role,
                    },
                    'processor': {
                        'id': str(processor.id),
                        'company_name': processor.company_name,
                        'processor_code': processor.processor_code,
                        'is_verified': processor.is_verified,
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


class ProcessorRegistrationSingleStepView(APIView):
    """Single-step Processor Registration (All data at once)"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Complete Processor registration in one go"""
        serializer = ProcessorRegistrationCompleteSerializer(data=request.data)
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
                    role='processor',
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
                
                # 3. Create Processor
                processor_data = data['processor']
                processor = Processor.objects.create(
                    user=user,
                    company_name=processor_data['company_name'],
                    business_scale=processor_data['business_scale'],
                    city=processor_data['city'],
                    state=processor_data.get('state', profile_data['state']),
                    pincode=processor_data.get('pincode', profile_data['pincode']),
                    gstin=processor_data['gstin'],
                    fssai_license=processor_data['fssai_license'],
                    monthly_capacity=processor_data['monthly_capacity'],
                    monthly_requirement=processor_data['monthly_requirement'],
                    contact_person=processor_data['contact_person'],
                    contact_phone=processor_data['contact_phone'],
                    contact_email=processor_data['contact_email'],
                )
                
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Processor registered successfully! Awaiting verification.',
                    'user': {
                        'id': str(user.id),
                        'phone_number': user.phone_number,
                        'full_name': user.full_name,
                        'role': user.role,
                    },
                    'processor': ProcessorSerializer(processor).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProcessorViewSet(viewsets.ModelViewSet):
    """Processor CRUD Operations"""
    queryset = Processor.objects.select_related('user').all()
    serializer_class = ProcessorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter based on role"""
        user = self.request.user
        queryset = Processor.objects.select_related('user')
        
        # Processor sees only their profile
        if user.role == 'processor':
            return queryset.filter(user=user)
        
        # Filters
        state = self.request.query_params.get('state')
        city = self.request.query_params.get('city')
        business_scale = self.request.query_params.get('business_scale')
        is_verified = self.request.query_params.get('is_verified')
        search = self.request.query_params.get('search')
        
        if state:
            queryset = queryset.filter(state__iexact=state)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if business_scale:
            queryset = queryset.filter(business_scale=business_scale)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search) |
                Q(processor_code__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProcessorListSerializer
        return ProcessorSerializer
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current processor's profile"""
        try:
            processor = Processor.objects.get(user=request.user)
            serializer = self.get_serializer(processor)
            return Response(serializer.data)
        except Processor.DoesNotExist:
            return Response({
                'error': 'Processor profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify processor (admin only)"""
        if request.user.role != 'admin':
            return Response({
                'error': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        processor = self.get_object()
        processor.is_verified = True
        processor.save()
        
        return Response({
            'message': f'Processor {processor.company_name} verified'
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Processor statistics"""
        stats = Processor.objects.aggregate(
            total_processors=Count('id'),
            verified_processors=Count('id', filter=Q(is_verified=True)),
            total_capacity=Sum('monthly_capacity'),
            total_requirement=Sum('monthly_requirement')
        )
        return Response(stats)