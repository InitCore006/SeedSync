"""Marketplace Views"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from apps.core.utils import response_success, response_error
from .models import Listing, Order, Review
from .serializers import ListingSerializer, OrderSerializer, ReviewSerializer
from apps.processors.models import ProcessedProduct
from apps.processors.serializers import ProcessedProductListSerializer

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(is_active=True)
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_active=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class MarketplaceProductsAPIView(APIView):
    """
    List all available processed products in marketplace for retailers
    GET /api/marketplace/products/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List all available products from all processors"""
        
        # Get available products
        products = ProcessedProduct.objects.filter(
            is_available_for_sale=True,
            available_quantity_liters__gt=0
        ).select_related('processor').order_by('-created_at')
        
        # Filters
        product_type = request.query_params.get('product_type')
        if product_type:
            products = products.filter(product_type=product_type)
        
        processing_type = request.query_params.get('processing_type')
        if processing_type:
            products = products.filter(processing_type=processing_type)
        
        quality_grade = request.query_params.get('quality_grade')
        if quality_grade:
            products = products.filter(quality_grade=quality_grade)
        
        processor_id = request.query_params.get('processor_id')
        if processor_id:
            products = products.filter(processor_id=processor_id)
        
        # Search by product name or SKU
        search = request.query_params.get('search')
        if search:
            products = products.filter(
                Q(sku__icontains=search) |
                Q(batch_number__icontains=search) |
                Q(processor__company_name__icontains=search)
            )
        
        # Price range
        min_price = request.query_params.get('min_price')
        if min_price:
            products = products.filter(selling_price_per_liter__gte=min_price)
        
        max_price = request.query_params.get('max_price')
        if max_price:
            products = products.filter(selling_price_per_liter__lte=max_price)
        
        # Only show non-expired products
        from django.utils import timezone
        products = products.exclude(expiry_date__lt=timezone.now().date())
        
        serializer = ProcessedProductListSerializer(products, many=True)
        
        return Response(
            response_success(
                message="Marketplace products fetched successfully",
                data=serializer.data
            )
        )

