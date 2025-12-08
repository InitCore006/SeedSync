"""
Market Data Extractor
Extracts real-time order data from models matching CSV format for forecasting
"""
from django.db.models import Q, Sum, Avg, Count, F
from django.utils import timezone
from decimal import Decimal
import pandas as pd
import json
from datetime import datetime, timedelta

from apps.marketplace.models import Order
from apps.lots.models import ProcurementLot
from apps.farmers.models import FarmerProfile
from apps.fpos.models import FPOProfile
from apps.processors.models import ProcessorProfile, ProcessingBatch


class MarketDataExtractor:
    """
    Extract market data matching CSV format:
    order_id, order_date, order_time, crop_type, state, season, 
    quantity_quintals, price_per_quintal_inr, total_value_inr, 
    quality_grade, buyer_type, buyer_id, status, payment_status, created_timestamp
    """
    
    def __init__(self):
        self.columns = [
            'order_id', 'order_date', 'order_time', 'crop_type', 'state',
            'season', 'quantity_quintals', 'price_per_quintal_inr',
            'total_value_inr', 'quality_grade', 'buyer_type',
            'status', 'payment_status', 'created_timestamp'
        ]
    
    def extract_marketplace_orders(self, days_back=365, filters=None):
        """
        Extract data from marketplace orders
        
        Args:
            days_back: Number of days to look back
            filters: Dict with optional keys: crop_type, state, buyer_role
        
        Returns:
            list: Order data in CSV format
        """
        filters = filters or {}
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Query orders
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).select_related(
            'buyer',
            'lot__farmer',
            'lot__fpo'
        ).prefetch_related('lot')
        
        # Apply filters
        if filters.get('crop_type'):
            orders = orders.filter(lot__crop_type=filters['crop_type'])
        
        if filters.get('state'):
            orders = orders.filter(
                Q(lot__farmer__state=filters['state']) | 
                Q(lot__fpo__state=filters['state'])
            )
        
        if filters.get('buyer_role'):
            orders = orders.filter(buyer__role=filters['buyer_role'])
        
        # Extract data
        data = []
        for order in orders:
            lot = order.lot
            
            # Get state from lot owner
            if lot.farmer:
                state = lot.farmer.state
            elif lot.fpo:
                state = lot.fpo.state
            else:
                state = 'Unknown'
            
            # Determine season from harvest date
            season = self._get_season_from_date(lot.harvest_date)
            
            # Calculate price per quintal
            price_per_quintal = float(order.total_amount / order.quantity) if order.quantity > 0 else 0
            
            # Payment status from order status
            payment_status = self._get_payment_status(order.status)
            
            data.append({
                'order_id': order.order_number,
                'order_date': order.created_at.strftime('%d-%m-%Y'),
                'order_time': order.created_at.strftime('%H:%M:%S.%f'),
                'crop_type': lot.crop_type,
                'state': state,
                'season': season,
                'quantity_quintals': float(order.quantity),
                'price_per_quintal_inr': round(price_per_quintal, 2),
                'total_value_inr': float(order.total_amount),
                'quality_grade': lot.quality_grade or 'N/A',
                'buyer_type': order.buyer.role,
                'status': order.status,
                'payment_status': payment_status,
                'created_timestamp': order.created_at.isoformat()
            })
        
        return data
    
    def extract_lots_as_sales(self, days_back=365, filters=None):
        """
        Extract sold lots as transaction records
        Useful when marketplace orders are limited
        """
        filters = filters or {}
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Get sold lots
        lots = ProcurementLot.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            status__in=['sold', 'delivered']
        ).select_related('farmer', 'fpo')
        
        # Apply filters
        if filters.get('crop_type'):
            lots = lots.filter(crop_type=filters['crop_type'])
        
        if filters.get('state'):
            lots = lots.filter(
                Q(farmer__state=filters['state']) | 
                Q(fpo__state=filters['state'])
            )
        
        data = []
        for lot in lots:
            # Get state
            if lot.farmer:
                state = lot.farmer.state
            elif lot.fpo:
                state = lot.fpo.state
            else:
                continue
            
            season = self._get_season_from_date(lot.harvest_date)
            
            # Calculate sold quantity
            quantity_sold = float(lot.quantity_quintals - lot.available_quantity_quintals)
            if quantity_sold <= 0:
                continue
            
            price = float(lot.final_price_per_quintal or lot.expected_price_per_quintal)
            total_value = quantity_sold * price
            
            # Use sold_date or created_at
            transaction_date = lot.sold_date or lot.created_at
            
            data.append({
                'order_id': f"LOT-{lot.lot_number}",
                'order_date': transaction_date.strftime('%d-%m-%Y'),
                'order_time': transaction_date.strftime('%H:%M:%S.%f'),
                'crop_type': lot.crop_type,
                'state': state,
                'season': season,
                'quantity_quintals': quantity_sold,
                'price_per_quintal_inr': round(price, 2),
                'total_value_inr': round(total_value, 2),
                'quality_grade': lot.quality_grade or 'N/A',
                'buyer_type': 'processor' if lot.fpo else 'unknown',
                'status': lot.status,
                'payment_status': 'paid' if lot.status == 'delivered' else 'pending',
                'created_timestamp': transaction_date.isoformat()
            })
        
        return data
    
    def extract_processing_batches(self, days_back=365, filters=None):
        """
        Extract processor procurement data from processing batches
        """
        filters = filters or {}
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        batches = ProcessingBatch.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).select_related('lot', 'plant__processor')
        
        if filters.get('crop_type'):
            batches = batches.filter(lot__crop_type=filters['crop_type'])
        
        data = []
        for batch in batches:
            lot = batch.lot
            processor = batch.plant.processor
            
            season = self._get_season_from_date(lot.harvest_date)
            
            price = float(lot.final_price_per_quintal or lot.expected_price_per_quintal)
            quantity = float(batch.initial_quantity_quintals)
            total_value = quantity * price
            
            transaction_date = batch.start_date or batch.created_at
            
            data.append({
                'order_id': f"BATCH-{batch.batch_number}",
                'order_date': transaction_date.strftime('%d-%m-%Y'),
                'order_time': transaction_date.strftime('%H:%M:%S.%f'),
                'crop_type': lot.crop_type,
                'state': processor.state,
                'season': season,
                'quantity_quintals': quantity,
                'price_per_quintal_inr': round(price, 2),
                'total_value_inr': round(total_value, 2),
                'quality_grade': batch.quality_grade or lot.quality_grade or 'N/A',
                'buyer_type': 'processor',
                'status': batch.status,
                'payment_status': 'paid' if batch.status == 'completed' else 'pending',
                'created_timestamp': transaction_date.isoformat()
            })
        
        return data
    
    def get_combined_data(self, days_back=365, filters=None):
        """
        Combine all data sources
        
        Args:
            days_back: Days to look back (default 365)
            filters: Dict with crop_type, state, buyer_role
        
        Returns:
            list: Combined market data
        """
        all_data = []
        
        # 1. Marketplace orders (primary source)
        orders_data = self.extract_marketplace_orders(days_back, filters)
        all_data.extend(orders_data)
        
        # 2. Sold lots (supplementary)
        lots_data = self.extract_lots_as_sales(days_back, filters)
        all_data.extend(lots_data)
        
        # 3. Processing batches (processor demand)
        if not filters or not filters.get('buyer_role') or filters.get('buyer_role') == 'processor':
            batch_data = self.extract_processing_batches(days_back, filters)
            all_data.extend(batch_data)
        
        # Remove duplicates by order_id
        seen = set()
        unique_data = []
        for item in all_data:
            if item['order_id'] not in seen:
                seen.add(item['order_id'])
                unique_data.append(item)
        
        return unique_data
    
    def to_dataframe(self, data):
        """
        Convert data to pandas DataFrame for analysis
        
        Returns:
            pd.DataFrame: Market data ready for ARIMA
        """
        if not data:
            return pd.DataFrame(columns=self.columns)
        
        df = pd.DataFrame(data)
        
        # Ensure all columns exist
        for col in self.columns:
            if col not in df.columns:
                df[col] = None
        
        # Reorder columns
        df = df[self.columns]
        
        # Convert data types
        df['order_date'] = pd.to_datetime(df['order_date'], format='%d-%m-%Y', errors='coerce')
        df['quantity_quintals'] = pd.to_numeric(df['quantity_quintals'], errors='coerce')
        df['price_per_quintal_inr'] = pd.to_numeric(df['price_per_quintal_inr'], errors='coerce')
        df['total_value_inr'] = pd.to_numeric(df['total_value_inr'], errors='coerce')
        df['created_timestamp'] = pd.to_datetime(df['created_timestamp'], errors='coerce')
        
        # Sort by date
        df = df.sort_values('order_date').reset_index(drop=True)
        
        return df
    
    def get_summary_stats(self, df):
        """Calculate summary statistics"""
        if df.empty:
            return {}
        
        return {
            'total_transactions': len(df),
            'total_quantity_quintals': float(df['quantity_quintals'].sum()),
            'total_value_inr': float(df['total_value_inr'].sum()),
            'avg_price_per_quintal': float(df['price_per_quintal_inr'].mean()),
            'min_price': float(df['price_per_quintal_inr'].min()),
            'max_price': float(df['price_per_quintal_inr'].max()),
            'date_range': {
                'start': df['order_date'].min().strftime('%Y-%m-%d') if not pd.isna(df['order_date'].min()) else None,
                'end': df['order_date'].max().strftime('%Y-%m-%d') if not pd.isna(df['order_date'].max()) else None
            }
        }
    
    # Helper methods
    def _get_season_from_date(self, date):
        """Determine season from date"""
        if not date:
            return 'unknown'
        
        month = date.month
        if month in [10, 11, 12, 1, 2, 3]:
            return 'rabi'
        elif month in [4, 5, 6, 7, 8, 9]:
            return 'kharif'
        return 'unknown'
    
    def _get_payment_status(self, order_status):
        """Derive payment status from order status"""
        status_map = {
            'delivered': 'paid',
            'completed': 'paid',
            'pending': 'pending',
            'processing': 'pending',
            'shipped': 'partial',
            'cancelled': 'refunded'
        }
        return status_map.get(order_status, 'pending')
