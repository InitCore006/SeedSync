from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta, datetime

from .models import MarketPrice, PriceForecast, MarketListing, Order
from .serializers import (
    MarketPriceSerializer, PriceForecastSerializer,
    MarketListingSerializer, MarketListingListSerializer,
    OrderSerializer, OrderListSerializer
)


class MarketPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Market Price Data (Read-only)
    
    list: Get all market prices
    retrieve: Get specific price record
    
    Custom Actions:
    - latest_prices: Get latest prices by crop
    - price_trend: Get historical price trend
    - compare_markets: Compare prices across markets
    - price_range: Get price range for specific period
    """
    
    queryset = MarketPrice.objects.select_related('crop_type').all()
    serializer_class = MarketPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['crop_type', 'state', 'district', 'source']
    ordering_fields = ['date', 'modal_price']
    ordering = ['-date']
    
    @action(detail=False, methods=['get'])
    def latest_prices(self, request):
        """Get latest prices for each crop type"""
        crop_type_id = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        
        filters = {}
        if crop_type_id:
            filters['crop_type_id'] = crop_type_id
        if state:
            filters['state'] = state
        
        # Get latest price for each crop
        latest_prices = MarketPrice.objects.filter(**filters).order_by(
            'crop_type', '-date'
        ).distinct('crop_type')
        
        serializer = self.get_serializer(latest_prices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def price_trend(self, request):
        """Get historical price trend"""
        crop_type_id = request.query_params.get('crop_type')
        state = request.query_params.get('state', 'All India')
        days = int(request.query_params.get('days', 30))
        
        if not crop_type_id:
            return Response({'error': 'crop_type parameter required'}, status=400)
        
        start_date = timezone.now().date() - timedelta(days=days)
        
        prices = MarketPrice.objects.filter(
            crop_type_id=crop_type_id,
            state=state,
            date__gte=start_date
        ).order_by('date')
        
        trend_data = []
        for price in prices:
            trend_data.append({
                'date': price.date,
                'min_price': float(price.min_price),
                'max_price': float(price.max_price),
                'modal_price': float(price.modal_price),
                'market': price.market_name
            })
        
        return Response({
            'crop_type': crop_type_id,
            'state': state,
            'period': f'{days} days',
            'trend': trend_data
        })
    
    @action(detail=False, methods=['post'])
    def compare_markets(self, request):
        """Compare prices across different markets"""
        crop_type_id = request.data.get('crop_type')
        states = request.data.get('states', [])  # List of states to compare
        
        if not crop_type_id:
            return Response({'error': 'crop_type required'}, status=400)
        
        comparison = []
        for state in states:
            latest = MarketPrice.objects.filter(
                crop_type_id=crop_type_id,
                state=state
            ).order_by('-date').first()
            
            if latest:
                comparison.append({
                    'state': state,
                    'date': latest.date,
                    'modal_price': float(latest.modal_price),
                    'min_price': float(latest.min_price),
                    'max_price': float(latest.max_price),
                    'market': latest.market_name
                })
        
        return Response({
            'crop_type': crop_type_id,
            'comparison': comparison
        })
    
    @action(detail=False, methods=['get'])
    def price_range(self, request):
        """Get price range for specific period"""
        crop_type_id = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        days = int(request.query_params.get('days', 7))
        
        if not crop_type_id:
            return Response({'error': 'crop_type required'}, status=400)
        
        start_date = timezone.now().date() - timedelta(days=days)
        
        filters = {
            'crop_type_id': crop_type_id,
            'date__gte': start_date
        }
        if state:
            filters['state'] = state
        
        prices = MarketPrice.objects.filter(**filters)
        
        if not prices.exists():
            return Response({'error': 'No data available'}, status=404)
        
        agg = prices.aggregate(
            min_price=Avg('min_price'),
            max_price=Avg('max_price'),
            modal_price=Avg('modal_price')
        )
        
        return Response({
            'crop_type': crop_type_id,
            'state': state or 'All',
            'period': f'{days} days',
            'average_min_price': round(float(agg['min_price']), 2),
            'average_max_price': round(float(agg['max_price']), 2),
            'average_modal_price': round(float(agg['modal_price']), 2)
        })


class PriceForecastViewSet(viewsets.ReadOnlyModelViewSet):
    """
    AI Price Forecasting (Read-only)
    
    Custom Actions:
    - upcoming_forecasts: Get forecasts for next N days
    - forecast_accuracy: Get accuracy metrics
    - generate_forecast: Generate new forecast (admin only)
    """
    
    queryset = PriceForecast.objects.select_related('crop_type').all()
    serializer_class = PriceForecastSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['crop_type', 'state']
    ordering_fields = ['forecast_date', 'predicted_price']
    ordering = ['-forecast_date']
    
    @action(detail=False, methods=['get'])
    def upcoming_forecasts(self, request):
        """Get price forecasts for upcoming days"""
        crop_type_id = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        days = int(request.query_params.get('days', 7))
        
        if not crop_type_id:
            return Response({'error': 'crop_type required'}, status=400)
        
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=days)
        
        filters = {
            'crop_type_id': crop_type_id,
            'forecast_date__gte': start_date,
            'forecast_date__lte': end_date
        }
        if state:
            filters['state'] = state
        
        forecasts = PriceForecast.objects.filter(**filters).order_by('forecast_date')
        serializer = self.get_serializer(forecasts, many=True)
        
        return Response({
            'crop_type': crop_type_id,
            'period': f'{days} days',
            'forecasts': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def forecast_accuracy(self, request):
        """Get forecast accuracy metrics"""
        crop_type_id = request.query_params.get('crop_type')
        
        filters = {'accuracy_score__isnull': False}
        if crop_type_id:
            filters['crop_type_id'] = crop_type_id
        
        forecasts = PriceForecast.objects.filter(**filters)
        
        if not forecasts.exists():
            return Response({'error': 'No accuracy data available'}, status=404)
        
        avg_accuracy = forecasts.aggregate(avg=Avg('accuracy_score'))['avg']
        
        return Response({
            'crop_type': crop_type_id or 'All',
            'total_forecasts_validated': forecasts.count(),
            'average_accuracy': round(float(avg_accuracy), 2),
            'high_accuracy_count': forecasts.filter(accuracy_score__gte=80).count(),
            'low_accuracy_count': forecasts.filter(accuracy_score__lt=60).count()
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def generate_forecast(self, request):
        """Generate AI price forecast (admin only)"""
        # Placeholder for ML model integration
        import random
        
        crop_type_id = request.data.get('crop_type')
        state = request.data.get('state', 'All India')
        forecast_days = int(request.data.get('days', 7))
        
        if not crop_type_id:
            return Response({'error': 'crop_type required'}, status=400)
        
        # Simulate AI forecast generation
        forecasts_created = []
        base_price = 5000  # Base price in rupees
        
        for day in range(1, forecast_days + 1):
            forecast_date = timezone.now().date() + timedelta(days=day)
            
            # Simulate price fluctuation
            predicted_price = base_price + random.uniform(-500, 500)
            confidence_low = predicted_price - random.uniform(200, 400)
            confidence_high = predicted_price + random.uniform(200, 400)
            
            forecast = PriceForecast.objects.create(
                crop_type_id=crop_type_id,
                state=state,
                forecast_date=forecast_date,
                predicted_price=predicted_price,
                confidence_interval_low=confidence_low,
                confidence_interval_high=confidence_high
            )
            
            forecasts_created.append({
                'date': forecast_date,
                'predicted_price': round(predicted_price, 2)
            })
        
        return Response({
            'message': f'{len(forecasts_created)} forecasts generated',
            'forecasts': forecasts_created
        }, status=status.HTTP_201_CREATED)


class MarketListingViewSet(viewsets.ModelViewSet):
    """
    Market Listings (Buy/Sell)
    
    Custom Actions:
    - my_listings: Get current user's listings
    - active_listings: Get active listings
    - browse: Browse listings with filters
    - create_bulk: Create multiple listings
    - deactivate: Deactivate listing
    """
    
    queryset = MarketListing.objects.select_related(
        'crop_type', 'farmer__user', 'fpo', 'buyer_processor', 'buyer_fpo'
    ).all()
    serializer_class = MarketListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['listing_type', 'crop_type', 'state', 'district', 'quality_grade', 'is_active']
    search_fields = ['crop_type__name', 'district', 'state']
    ordering_fields = ['asking_price', 'quantity', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MarketListingListSerializer
        return MarketListingSerializer
    
    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        
        if user.role == 'FARMER':
            return MarketListing.objects.filter(farmer__user=user)
        elif user.role == 'FPO':
            return MarketListing.objects.filter(
                Q(fpo__user=user) | Q(buyer_fpo__user=user)
            )
        elif user.role == 'PROCESSOR':
            return MarketListing.objects.filter(buyer_processor__user=user)
        
        # Default: show all active listings
        return MarketListing.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        """Auto-assign seller based on user role"""
        user = self.request.user
        
        if user.role == 'FARMER':
            serializer.save(farmer=user.farmer_profile)
        elif user.role == 'FPO':
            serializer.save(fpo=user.fpo_profile)
        else:
            raise permissions.PermissionDenied("Only farmers and FPOs can create sell listings")
    
    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """Get current user's listings"""
        listings = self.get_queryset()
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_listings(self, request):
        """Get all active listings"""
        active = MarketListing.objects.filter(
            is_active=True,
            is_fulfilled=False
        )
        
        serializer = MarketListingListSerializer(active, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def browse(self, request):
        """Browse listings with advanced filters"""
        crop_type = request.query_params.get('crop_type')
        state = request.query_params.get('state')
        max_price = request.query_params.get('max_price')
        min_quantity = request.query_params.get('min_quantity')
        quality_grade = request.query_params.get('quality_grade')
        
        filters = {'is_active': True, 'is_fulfilled': False}
        
        if crop_type:
            filters['crop_type_id'] = crop_type
        if state:
            filters['state'] = state
        if quality_grade:
            filters['quality_grade'] = quality_grade
        
        listings = MarketListing.objects.filter(**filters)
        
        if max_price:
            listings = listings.filter(asking_price__lte=max_price)
        if min_quantity:
            listings = listings.filter(quantity__gte=min_quantity)
        
        serializer = MarketListingListSerializer(listings, many=True)
        return Response({
            'total_results': listings.count(),
            'listings': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a listing"""
        listing = self.get_object()
        
        # Check ownership
        user = request.user
        if user.role == 'FARMER' and listing.farmer.user != user:
            return Response({'error': 'Not authorized'}, status=403)
        elif user.role == 'FPO' and listing.fpo.user != user:
            return Response({'error': 'Not authorized'}, status=403)
        
        listing.is_active = False
        listing.save()
        
        return Response({'message': 'Listing deactivated'})
    
    @action(detail=True, methods=['post'])
    def mark_fulfilled(self, request, pk=None):
        """Mark listing as fulfilled"""
        listing = self.get_object()
        listing.is_fulfilled = True
        listing.is_active = False
        listing.save()
        
        return Response({'message': 'Listing marked as fulfilled'})


class OrderViewSet(viewsets.ModelViewSet):
    """
    Order Management
    
    Custom Actions:
    - my_orders: Get current user's orders
    - pending_orders: Get pending orders
    - accept_order: Accept order (seller)
    - cancel_order: Cancel order
    - mark_paid: Mark order as paid
    - delivery_confirmation: Confirm delivery
    """
    
    queryset = Order.objects.select_related(
        'listing__crop_type', 'buyer_processor__user', 'buyer_fpo__user'
    ).all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'is_paid', 'listing__crop_type']
    ordering_fields = ['created_at', 'total_amount', 'expected_delivery_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer
    
    def get_queryset(self):
        """Filter orders based on user role"""
        user = self.request.user
        
        if user.role == 'FARMER':
            # Orders for farmer's listings
            return Order.objects.filter(listing__farmer__user=user)
        elif user.role == 'FPO':
            # Orders as buyer or seller
            return Order.objects.filter(
                Q(listing__fpo__user=user) | Q(buyer_fpo__user=user)
            )
        elif user.role == 'PROCESSOR':
            # Orders as buyer
            return Order.objects.filter(buyer_processor__user=user)
        
        return Order.objects.none()
    
    def perform_create(self, serializer):
        """Create order with buyer assignment"""
        user = self.request.user
        
        if user.role == 'PROCESSOR':
            serializer.save(buyer_processor=user.processor_profile)
        elif user.role == 'FPO':
            serializer.save(buyer_fpo=user.fpo_profile)
        else:
            raise permissions.PermissionDenied("Only processors and FPOs can create orders")
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current user's orders"""
        orders = self.get_queryset()
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        """Get pending orders"""
        pending = self.get_queryset().filter(status='PENDING')
        serializer = OrderListSerializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def accept_order(self, request, pk=None):
        """Accept order (seller only)"""
        order = self.get_object()
        
        # Verify seller
        user = request.user
        listing = order.listing
        
        if user.role == 'FARMER' and listing.farmer.user != user:
            return Response({'error': 'Not authorized'}, status=403)
        elif user.role == 'FPO' and listing.fpo.user != user:
            return Response({'error': 'Not authorized'}, status=403)
        
        if order.status != 'PENDING':
            return Response({'error': 'Order is not in pending state'}, status=400)
        
        order.status = 'ACCEPTED'
        order.save()
        
        return Response({'message': 'Order accepted', 'order_id': order.order_id})
    
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Cancel order"""
        order = self.get_object()
        reason = request.data.get('reason', 'No reason provided')
        
        if order.status in ['DELIVERED', 'COMPLETED']:
            return Response({'error': 'Cannot cancel completed orders'}, status=400)
        
        order.status = 'CANCELLED'
        order.save()
        
        return Response({
            'message': 'Order cancelled',
            'order_id': order.order_id,
            'reason': reason
        })
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark order as paid"""
        order = self.get_object()
        
        payment_amount = request.data.get('amount')
        is_full_payment = request.data.get('is_full_payment', False)
        
        if is_full_payment:
            order.is_paid = True
            order.payment_date = timezone.now().date()
        else:
            # Partial payment
            if payment_amount:
                order.advance_payment = float(payment_amount)
        
        order.save()
        
        return Response({
            'message': 'Payment recorded',
            'is_paid': order.is_paid,
            'advance_payment': float(order.advance_payment),
            'balance': float(order.total_amount - order.advance_payment)
        })
    
    @action(detail=True, methods=['post'])
    def delivery_confirmation(self, request, pk=None):
        """Confirm delivery"""
        order = self.get_object()
        
        order.status = 'DELIVERED'
        order.actual_delivery_date = timezone.now().date()
        order.save()
        
        # Mark listing as fulfilled
        if order.listing.quantity == order.quantity_ordered:
            order.listing.is_fulfilled = True
            order.listing.is_active = False
            order.listing.save()
        
        return Response({
            'message': 'Delivery confirmed',
            'order_id': order.order_id,
            'delivered_on': order.actual_delivery_date
        })
    
    @action(detail=False, methods=['get'])
    def order_stats(self, request):
        """Get order statistics"""
        orders = self.get_queryset()
        
        stats = {
            'total_orders': orders.count(),
            'pending': orders.filter(status='PENDING').count(),
            'accepted': orders.filter(status='ACCEPTED').count(),
            'in_transit': orders.filter(status='IN_TRANSIT').count(),
            'delivered': orders.filter(status='DELIVERED').count(),
            'cancelled': orders.filter(status='CANCELLED').count(),
            'total_value': float(orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
            'paid_orders': orders.filter(is_paid=True).count(),
        }
        
        return Response(stats)