"""Retailers Views"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO

from apps.core.utils import response_success, response_error
from apps.core.permissions import IsRetailer
from .models import RetailerProfile, Store, RetailerOrder, OrderItem, RetailerInventory
from .serializers import (
    RetailerProfileSerializer, 
    StoreSerializer,
    RetailerOrderSerializer,
    RetailerOrderCreateSerializer,
    RetailerInventorySerializer,
    RetailerDashboardSerializer
)
from apps.processors.models import ProcessedProduct
from django.db import transaction
from apps.processors.models import ProcessedProduct

class RetailerProfileAPIView(APIView):
    """
    Get, create or update Retailer profile
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get retailer profile"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
            serializer = RetailerProfileSerializer(retailer)
            return Response(
                response_success(
                    message="Profile fetched successfully",
                    data=serializer.data
                )
            )
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """Create retailer profile"""
        try:
            # Check if profile already exists
            existing_profile = RetailerProfile.objects.filter(user=request.user).first()
            if existing_profile:
                return Response(
                    response_error(message="Profile already exists. Use PATCH to update."),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = RetailerProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(
                    response_success(
                        message="Profile created successfully",
                        data=serializer.data
                    ),
                    status=status.HTTP_201_CREATED
                )
            return Response(
                response_error(message="Validation failed", errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to create profile: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Update retailer profile"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
            serializer = RetailerProfileSerializer(retailer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    response_success(
                        message="Profile updated successfully",
                        data=serializer.data
                    )
                )
            return Response(
                response_error(message="Validation failed", errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST
            )
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )

class RetailerProfileViewSet(viewsets.ModelViewSet):
    queryset = RetailerProfile.objects.filter(is_active=True)
    serializer_class = RetailerProfileSerializer
    permission_classes = [IsAuthenticated]

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]


class RetailerDashboardAPIView(APIView):
    """
    Retailer dashboard with stats and recent data
    GET /api/retailers/dashboard/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get retailer dashboard stats"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Order statistics
        orders = RetailerOrder.objects.filter(retailer=retailer)
        total_orders = orders.count()
        pending_orders = orders.filter(status__in=['pending', 'processing']).count()
        completed_orders = orders.filter(status='delivered').count()
        cancelled_orders = orders.filter(status='cancelled').count()
        
        # Revenue statistics
        completed_order_stats = orders.filter(status='delivered').aggregate(
            total_revenue=Sum('total_amount'),
            avg_order_value=Avg('total_amount')
        )
        
        total_revenue = completed_order_stats['total_revenue'] or Decimal('0')
        avg_order_value = completed_order_stats['avg_order_value'] or Decimal('0')
        
        # Supplier statistics
        active_suppliers = orders.values('processor').distinct().count()
        
        # Inventory statistics
        inventory = RetailerInventory.objects.filter(retailer=retailer)
        inventory_items = inventory.count()
        low_stock_items = inventory.filter(
            current_stock_liters__lte=F('reorder_point')
        ).count()
        
        # Recent orders
        recent_orders = orders.order_by('-order_date')[:5]
        recent_orders_serializer = RetailerOrderSerializer(recent_orders, many=True)
        
        # Low stock alerts
        low_stock_alerts = inventory.filter(
            current_stock_liters__lte=F('reorder_point')
        ).order_by('current_stock_liters')[:5]
        low_stock_serializer = RetailerInventorySerializer(low_stock_alerts, many=True)
        
        # Compile dashboard data
        dashboard_data = {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': total_revenue,
            'avg_order_value': avg_order_value,
            'active_suppliers': active_suppliers,
            'inventory_items': inventory_items,
            'low_stock_items': low_stock_items,
            'recent_orders': recent_orders_serializer.data,
            'low_stock_alerts': low_stock_serializer.data,
        }
        
        return Response(
            response_success(
                message="Dashboard data fetched successfully",
                data=dashboard_data
            )
        )


class RetailerOrderListCreateAPIView(APIView):
    """
    List and create retailer orders
    GET /api/retailers/orders/
    POST /api/retailers/orders/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """List retailer orders"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        orders = RetailerOrder.objects.filter(
            retailer=retailer
        ).select_related('processor').prefetch_related('items').order_by('-order_date')
        
        # Filters
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        serializer = RetailerOrderSerializer(orders, many=True)
        
        return Response(
            response_success(
                message="Orders fetched successfully",
                data=serializer.data
            )
        )
    
    def post(self, request):
        """Create new order"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RetailerOrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            order = serializer.save()
            response_serializer = RetailerOrderSerializer(order)
            return Response(
                response_success(
                    message="Order created successfully",
                    data=response_serializer.data
                ),
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            response_error(
                message="Failed to create order",
                errors=serializer.errors
            ),
            status=status.HTTP_400_BAD_REQUEST
        )


class RetailerOrderDetailAPIView(APIView):
    """
    Get specific order details
    GET /api/retailers/orders/<id>/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request, pk):
        """Get order details"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            order = RetailerOrder.objects.get(pk=pk, retailer=retailer)
        except RetailerOrder.DoesNotExist:
            return Response(
                response_error(message="Order not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = RetailerOrderSerializer(order)
        return Response(
            response_success(
                message="Order fetched successfully",
                data=serializer.data
            )
        )


class RetailerInventoryAPIView(APIView):
    """
    Get retailer inventory
    GET /api/retailers/inventory/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get retailer inventory"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        inventory = RetailerInventory.objects.filter(
            retailer=retailer
        ).select_related('product').order_by('-last_restocked')
        
        # Filters
        stock_status = request.query_params.get('stock_status')
        if stock_status:
            if stock_status == 'low_stock':
                inventory = inventory.filter(
                    current_stock_liters__lte=F('min_stock_level')
                )
            elif stock_status == 'out_of_stock':
                inventory = inventory.filter(current_stock_liters=0)
        
        serializer = RetailerInventorySerializer(inventory, many=True)
        
        return Response(
            response_success(
                message="Inventory fetched successfully",
                data=serializer.data
            )
        )


class RetailerSuppliersAPIView(APIView):
    """
    Get retailer suppliers (processors they've ordered from)
    GET /api/retailers/suppliers/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request):
        """Get list of suppliers"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get processors this retailer has ordered from
        orders = RetailerOrder.objects.filter(retailer=retailer)
        
        # Get unique processors with order statistics
        from apps.processors.models import ProcessorProfile
        from apps.processors.serializers import ProcessorProfileSerializer
        
        processor_ids = orders.values_list('processor_id', flat=True).distinct()
        processors = ProcessorProfile.objects.filter(id__in=processor_ids)
        
        # Add order statistics for each processor
        suppliers_data = []
        for processor in processors:
            processor_orders = orders.filter(processor=processor)
            
            suppliers_data.append({
                'id': str(processor.id),
                'company_name': processor.company_name,
                'contact_person': processor.contact_person,
                'phone': processor.phone,
                'email': processor.email,
                'city': processor.city,
                'state': processor.state,
                'is_verified': processor.is_verified,
                'total_orders': processor_orders.count(),
                'completed_orders': processor_orders.filter(status='delivered').count(),
                'total_spent': processor_orders.filter(
                    status='delivered'
                ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0'),
                'last_order_date': processor_orders.order_by('-order_date').first().order_date if processor_orders.exists() else None,
            })
        
        return Response(
            response_success(
                message="Suppliers fetched successfully",
                data=suppliers_data
            )
        )


class RetailerQuickOrderAPIView(APIView):
    """
    Simplified quick order endpoint - just product_id and quantity
    POST /api/retailers/orders/quick/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    @transaction.atomic
    def post(self, request):
        """Create quick order with auto-filled delivery details"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get input data
        product_id = request.data.get('product_id')
        quantity_liters = request.data.get('quantity_liters')
        
        if not product_id or not quantity_liters:
            return Response(
                response_error(message="product_id and quantity_liters are required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity_liters = Decimal(str(quantity_liters))
        except (ValueError, TypeError):
            return Response(
                response_error(message="Invalid quantity_liters value"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get product
        try:
            product = ProcessedProduct.objects.select_related('processor').get(id=product_id)
        except ProcessedProduct.DoesNotExist:
            return Response(
                response_error(message="Product not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate product availability
        if not product.is_available_for_sale:
            return Response(
                response_error(message="Product is not available for sale"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity_liters > product.available_quantity_liters:
            return Response(
                response_error(
                    message=f"Insufficient stock. Only {product.available_quantity_liters}L available"
                ),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity_liters <= 0:
            return Response(
                response_error(message="Quantity must be greater than 0"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate pricing
        unit_price = product.selling_price_per_liter
        subtotal = quantity_liters * unit_price
        tax_amount = subtotal * Decimal('0.05')  # 5% GST
        shipping_charges = Decimal('0')  # Free shipping for now
        total_amount = subtotal + tax_amount + shipping_charges
        
        # Create order using retailer's profile address
        order = RetailerOrder.objects.create(
            retailer=retailer,
            processor=product.processor,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_charges=shipping_charges,
            total_amount=total_amount,
            status='pending',
            payment_status='pending',
            delivery_address=retailer.address,
            delivery_city=retailer.city,
            delivery_state=retailer.state,
            delivery_pincode=getattr(retailer, 'pincode', '000000'),
            notes=f"Quick order from marketplace"
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity_liters=quantity_liters,
            unit_price=unit_price,
            product_name=product.get_product_type_display(),
            product_type=product.product_type,
            batch_number=product.batch_number or 'N/A',
        )
        
        # Update product stock - deduct from available and add to reserved
        product.available_quantity_liters -= quantity_liters
        product.reserved_quantity_liters += quantity_liters
        product.save(update_fields=['available_quantity_liters', 'reserved_quantity_liters'])
        
        # Return order details
        serializer = RetailerOrderSerializer(order)
        
        return Response(
            response_success(
                message="Order placed successfully",
                data=serializer.data
            ),
            status=status.HTTP_201_CREATED
        )


class RetailerInvoiceDownloadAPIView(APIView):
    """
    Generate and download invoice PDF for an order
    GET /api/retailers/orders/<uuid:pk>/invoice/
    """
    permission_classes = [IsAuthenticated, IsRetailer]
    
    def get(self, request, pk):
        """Generate invoice PDF"""
        try:
            retailer = RetailerProfile.objects.get(user=request.user)
        except RetailerProfile.DoesNotExist:
            return Response(
                response_error(message="Retailer profile not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            order = RetailerOrder.objects.select_related(
                'retailer', 'processor'
            ).prefetch_related('items__product').get(
                pk=pk, retailer=retailer
            )
        except RetailerOrder.DoesNotExist:
            return Response(
                response_error(message="Order not found"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Container for PDF elements
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1976D2'),
            spaceAfter=12
        )
        
        # Title
        elements.append(Paragraph("INVOICE", title_style))
        elements.append(Spacer(1, 12))
        
        # Invoice details table
        invoice_data = [
            ['Invoice Number:', order.order_number],
            ['Invoice Date:', order.order_date.strftime('%B %d, %Y')],
            ['Payment Status:', order.get_payment_status_display().upper()],
            ['Order Status:', order.get_status_display().upper()],
        ]
        
        invoice_table = Table(invoice_data, colWidths=[2*inch, 3.5*inch])
        invoice_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(invoice_table)
        elements.append(Spacer(1, 20))
        
        # From and To sections
        elements.append(Paragraph("FROM (SUPPLIER):", heading_style))
        from_text = f"""
        <b>{order.processor.company_name}</b><br/>
        {order.processor.address or 'N/A'}<br/>
        {order.processor.city}, {order.processor.state}<br/>
        Phone: {order.processor.phone}<br/>
        Email: {order.processor.email}
        """
        elements.append(Paragraph(from_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        elements.append(Paragraph("TO (BUYER):", heading_style))
        to_text = f"""
        <b>{order.retailer.business_name}</b><br/>
        {order.delivery_address}<br/>
        {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}<br/>
        Phone: {order.retailer.phone}<br/>
        Email: {order.retailer.email}
        """
        elements.append(Paragraph(to_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Order items table
        elements.append(Paragraph("ORDER ITEMS:", heading_style))
        
        # Table header
        items_data = [
            ['#', 'Product', 'Batch', 'Quantity (L)', 'Unit Price', 'Subtotal']
        ]
        
        # Table rows
        for idx, item in enumerate(order.items.all(), 1):
            items_data.append([
                str(idx),
                item.product_name,
                item.batch_number,
                f"{item.quantity_liters:.2f}",
                f"₹{item.unit_price:.2f}",
                f"₹{item.subtotal:.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[0.5*inch, 2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 20))
        
        # Totals table
        totals_data = [
            ['Subtotal:', f"₹{order.subtotal:.2f}"],
            ['Tax (GST 5%):', f"₹{order.tax_amount:.2f}"],
            ['Shipping:', f"₹{order.shipping_charges:.2f}"],
            ['TOTAL:', f"₹{order.total_amount:.2f}"],
        ]
        
        totals_table = Table(totals_data, colWidths=[4.5*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#2E7D32')),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 30))
        
        # Footer
        footer_text = """
        <b>Terms & Conditions:</b><br/>
        1. Payment is due within 30 days of invoice date.<br/>
        2. Please include the invoice number with your payment.<br/>
        3. For any queries, please contact the supplier.<br/><br/>
        <i>Thank you for your business!</i>
        """
        elements.append(Paragraph(footer_text, styles['Normal']))
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF value
        pdf = buffer.getvalue()
        buffer.close()
        
        # Create HTTP response
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{order.order_number}.pdf"'
        response.write(pdf)
        
        return response


