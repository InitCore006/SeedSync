"""Retailers Serializers"""
from rest_framework import serializers
from .models import RetailerProfile, Store, RetailerOrder, OrderItem, RetailerInventory

class RetailerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailerProfile
        fields = '__all__'
        read_only_fields = ['user']

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['order', 'subtotal', 'product_name', 'product_type', 'batch_number']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating order items"""
    
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity_liters', 'unit_price']
    
    def validate(self, data):
        """Validate order item"""
        product = data.get('product')
        quantity = data.get('quantity_liters')
        
        if product and quantity:
            # Check if product is available
            if not product.is_available_for_sale:
                raise serializers.ValidationError({
                    'product': 'This product is not available for sale'
                })
            
            # Check if enough stock available
            if quantity > product.available_quantity_liters:
                raise serializers.ValidationError({
                    'quantity_liters': f'Only {product.available_quantity_liters}L available in stock'
                })
            
            # Check if meets minimum order quantity
            if quantity < product.min_order_quantity_liters:
                raise serializers.ValidationError({
                    'quantity_liters': f'Minimum order quantity is {product.min_order_quantity_liters}L'
                })
        
        return data


class RetailerOrderSerializer(serializers.ModelSerializer):
    """Serializer for retailer orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    processor_name = serializers.CharField(source='processor.company_name', read_only=True)
    retailer_name = serializers.CharField(source='retailer.business_name', read_only=True)
    
    class Meta:
        model = RetailerOrder
        fields = '__all__'
        read_only_fields = ['order_number', 'retailer', 'order_date', 'subtotal', 'total_amount']


class RetailerOrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating retailer orders"""
    items = OrderItemCreateSerializer(many=True)
    
    class Meta:
        model = RetailerOrder
        fields = [
            'processor', 'expected_delivery_date', 'delivery_address',
            'delivery_city', 'delivery_state', 'delivery_pincode',
            'notes', 'items'
        ]
    
    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        validated_data['retailer'] = self.context['request'].user.retailer_profile
        
        # Calculate totals
        subtotal = sum(
            item['quantity_liters'] * item['unit_price']
            for item in items_data
        )
        
        # Calculate tax (assuming 5% GST)
        tax_amount = subtotal * 0.05
        
        # For now, no shipping charges (can be calculated based on location)
        shipping_charges = 0
        
        validated_data['subtotal'] = subtotal
        validated_data['tax_amount'] = tax_amount
        validated_data['shipping_charges'] = shipping_charges
        validated_data['total_amount'] = subtotal + tax_amount + shipping_charges
        
        # Create order
        order = RetailerOrder.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            product = item_data['product']
            
            # Reserve product stock
            product.reserved_quantity_liters += item_data['quantity_liters']
            product.save()
            
            # Create order item with product snapshot
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity_liters=item_data['quantity_liters'],
                unit_price=item_data['unit_price'],
                product_name=product.get_product_type_display(),
                product_type=product.product_type,
                batch_number=product.batch_number,
            )
        
        return order


class RetailerInventorySerializer(serializers.ModelSerializer):
    """Serializer for retailer inventory"""
    stock_status = serializers.CharField(read_only=True)
    stock_percentage = serializers.FloatField(read_only=True)
    processor_name = serializers.CharField(source='product.processor.company_name', read_only=True)
    
    class Meta:
        model = RetailerInventory
        fields = '__all__'
        read_only_fields = ['retailer', 'product_name', 'product_type', 'sku']


class RetailerDashboardSerializer(serializers.Serializer):
    """Serializer for retailer dashboard stats"""
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_order_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_suppliers = serializers.IntegerField()
    inventory_items = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    recent_orders = RetailerOrderSerializer(many=True)
    low_stock_alerts = RetailerInventorySerializer(many=True)

