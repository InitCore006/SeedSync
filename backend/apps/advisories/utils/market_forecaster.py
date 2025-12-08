"""
Market Forecasting Engine
ARIMA-based forecasting with 6 key analyses for role-based decision making
"""
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings
warnings.filterwarnings('ignore')


class MarketForecaster:
    """
    Provides 6 key analyses:
    1. Quantity Forecasting
    2. Price Forecasting
    3. Seasonal Analysis
    4. Crop-wise Analysis
    5. State-wise Analysis
    6. Buyer Behavior Analysis
    """
    
    def __init__(self, df):
        """
        Initialize with market data DataFrame
        
        Args:
            df: pandas DataFrame from MarketDataExtractor
        """
        self.df = df.copy()
        self.daily_data = None
        if not df.empty:
            self._prepare_time_series()
    
    def _prepare_time_series(self):
        """Prepare daily aggregated time series"""
        # Ensure order_date is datetime
        self.df['order_date'] = pd.to_datetime(self.df['order_date'])
        self.df = self.df.sort_values('order_date')
        
        # Create daily aggregates
        self.daily_data = self.df.groupby('order_date').agg({
            'quantity_quintals': 'sum',
            'total_value_inr': 'sum',
            'price_per_quintal_inr': 'mean',
            'order_id': 'count'
        }).rename(columns={'order_id': 'transaction_count'})
        
        # Fill missing dates with forward fill for prices, 0 for quantities
        date_range = pd.date_range(
            start=self.daily_data.index.min(),
            end=self.daily_data.index.max(),
            freq='D'
        )
        self.daily_data = self.daily_data.reindex(date_range)
        
        # Forward fill prices, fill quantities with 0
        self.daily_data['price_per_quintal_inr'] = self.daily_data['price_per_quintal_inr'].fillna(method='ffill')
        self.daily_data['quantity_quintals'] = self.daily_data['quantity_quintals'].fillna(0)
        self.daily_data['total_value_inr'] = self.daily_data['total_value_inr'].fillna(0)
        self.daily_data['transaction_count'] = self.daily_data['transaction_count'].fillna(0)
    
    # ==================== 1. QUANTITY FORECASTING ====================
    
    def forecast_demand_quantity(self, days_ahead=30):
        """
        Forecast future demand quantity
        
        Returns:
            dict: {
                'forecast_values': [list of quantities],
                'forecast_dates': [list of dates],
                'confidence_lower': [lower bound],
                'confidence_upper': [upper bound],
                'current_trend': 'increasing/decreasing/stable',
                'total_forecast_demand': total quantity,
                'avg_daily_demand': average per day
            }
        """
        if self.daily_data is None or len(self.daily_data) < 30:
            return {'error': 'Insufficient data for forecasting. Need at least 30 days.'}
        
        # Use quantity series
        series = self.daily_data['quantity_quintals']
        
        # Remove zeros for better model fit
        series_clean = series.replace(0, np.nan).fillna(method='ffill').fillna(method='bfill')
        
        try:
            # Fit ARIMA model with optimized parameters
            model = ARIMA(series_clean, order=(5, 1, 2))
            fitted_model = model.fit()
            
            # Forecast
            forecast_result = fitted_model.get_forecast(steps=days_ahead)
            forecast = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int()
            
            # Generate future dates
            forecast_dates = pd.date_range(
                start=series.index[-1] + pd.Timedelta(days=1),
                periods=days_ahead,
                freq='D'
            )
            
            # Determine trend
            recent_avg = series_clean[-7:].mean()
            forecast_avg = forecast.mean()
            
            if forecast_avg > recent_avg * 1.05:
                trend = 'increasing'
            elif forecast_avg < recent_avg * 0.95:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            return {
                'forecast_values': [max(0, round(v, 2)) for v in forecast.tolist()],
                'forecast_dates': forecast_dates.strftime('%Y-%m-%d').tolist(),
                'confidence_lower': [max(0, round(v, 2)) for v in conf_int.iloc[:, 0].tolist()],
                'confidence_upper': [max(0, round(v, 2)) for v in conf_int.iloc[:, 1].tolist()],
                'current_trend': trend,
                'total_forecast_demand': round(forecast.sum(), 2),
                'avg_daily_demand': round(forecast.mean(), 2),
                'current_avg_demand': round(recent_avg, 2)
            }
        except Exception as e:
            return {'error': f'Forecasting failed: {str(e)}'}
    
    # ==================== 2. PRICE FORECASTING ====================
    
    def forecast_price_trend(self, days_ahead=30):
        """
        Forecast price trends
        
        Returns:
            dict: {
                'forecast_values': [list of prices],
                'forecast_dates': [list of dates],
                'current_price': current average,
                'forecast_avg_price': predicted average,
                'price_change_percent': percentage change,
                'trend': 'bullish/bearish/stable',
                'recommendation': action recommendation
            }
        """
        if self.daily_data is None or len(self.daily_data) < 30:
            return {'error': 'Insufficient data for price forecasting.'}
        
        # Use price series
        series = self.daily_data['price_per_quintal_inr'].fillna(method='ffill')
        
        try:
            # Fit ARIMA model
            model = ARIMA(series, order=(3, 1, 2))
            fitted_model = model.fit()
            
            # Forecast
            forecast_result = fitted_model.get_forecast(steps=days_ahead)
            forecast = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int()
            
            # Generate dates
            forecast_dates = pd.date_range(
                start=series.index[-1] + pd.Timedelta(days=1),
                periods=days_ahead,
                freq='D'
            )
            
            # Calculate metrics
            current_price = series[-7:].mean()  # Last 7 days average
            forecast_avg = forecast.mean()
            price_change_pct = ((forecast_avg - current_price) / current_price) * 100
            
            # Determine trend
            if price_change_pct > 2:
                trend = 'bullish'
                recommendation = 'HOLD - Prices expected to rise'
            elif price_change_pct < -2:
                trend = 'bearish'
                recommendation = 'SELL NOW - Prices may decline'
            else:
                trend = 'stable'
                recommendation = 'NEUTRAL - Stable prices expected'
            
            return {
                'forecast_values': [round(v, 2) for v in forecast.tolist()],
                'forecast_dates': forecast_dates.strftime('%Y-%m-%d').tolist(),
                'confidence_lower': [round(v, 2) for v in conf_int.iloc[:, 0].tolist()],
                'confidence_upper': [round(v, 2) for v in conf_int.iloc[:, 1].tolist()],
                'current_price': round(current_price, 2),
                'forecast_avg_price': round(forecast_avg, 2),
                'price_change_percent': round(price_change_pct, 2),
                'trend': trend,
                'recommendation': recommendation,
                'volatility': round(series.std(), 2)
            }
        except Exception as e:
            return {'error': f'Price forecasting failed: {str(e)}'}
    
    # ==================== 3. SEASONAL ANALYSIS ====================
    
    def seasonal_analysis(self):
        """
        Analyze demand and prices by season (Rabi vs Kharif)
        
        Returns:
            dict: {
                'rabi': {stats},
                'kharif': {stats},
                'peak_season': 'rabi/kharif',
                'seasonal_insights': recommendations
            }
        """
        if self.df.empty:
            return {'error': 'No data available'}
        
        # Group by season
        seasonal_data = self.df.groupby('season').agg({
            'quantity_quintals': ['sum', 'mean', 'count'],
            'price_per_quintal_inr': ['mean', 'min', 'max'],
            'total_value_inr': 'sum'
        })
        
        result = {}
        
        for season in ['rabi', 'kharif']:
            if season in seasonal_data.index:
                data = seasonal_data.loc[season]
                result[season] = {
                    'total_quantity': round(data[('quantity_quintals', 'sum')], 2),
                    'avg_quantity_per_transaction': round(data[('quantity_quintals', 'mean')], 2),
                    'transaction_count': int(data[('quantity_quintals', 'count')]),
                    'avg_price': round(data[('price_per_quintal_inr', 'mean')], 2),
                    'min_price': round(data[('price_per_quintal_inr', 'min')], 2),
                    'max_price': round(data[('price_per_quintal_inr', 'max')], 2),
                    'total_value': round(data[('total_value_inr', 'sum')], 2)
                }
            else:
                result[season] = {
                    'total_quantity': 0,
                    'avg_quantity_per_transaction': 0,
                    'transaction_count': 0,
                    'avg_price': 0,
                    'min_price': 0,
                    'max_price': 0,
                    'total_value': 0
                }
        
        # Determine peak season
        rabi_qty = result['rabi']['total_quantity']
        kharif_qty = result['kharif']['total_quantity']
        peak_season = 'rabi' if rabi_qty > kharif_qty else 'kharif'
        
        # Price comparison
        rabi_price = result['rabi']['avg_price']
        kharif_price = result['kharif']['avg_price']
        
        if rabi_price > kharif_price:
            price_insight = f"Rabi season offers {round(((rabi_price - kharif_price) / kharif_price) * 100, 1)}% higher prices"
        else:
            price_insight = f"Kharif season offers {round(((kharif_price - rabi_price) / rabi_price) * 100, 1)}% higher prices"
        
        return {
            'rabi': result['rabi'],
            'kharif': result['kharif'],
            'peak_season': peak_season,
            'peak_season_quantity': round(max(rabi_qty, kharif_qty), 2),
            'price_comparison': price_insight,
            'recommendation': f"Peak demand in {peak_season} season. {price_insight}."
        }
    
    # ==================== 4. CROP-WISE ANALYSIS ====================
    
    def crop_wise_analysis(self, top_n=5):
        """
        Analyze top crops by demand and price
        
        Returns:
            dict: {
                'top_crops': [list of crops with stats],
                'highest_demand_crop': crop name,
                'highest_price_crop': crop name
            }
        """
        if self.df.empty:
            return {'error': 'No data available'}
        
        # Group by crop type
        crop_data = self.df.groupby('crop_type').agg({
            'quantity_quintals': 'sum',
            'price_per_quintal_inr': 'mean',
            'total_value_inr': 'sum',
            'order_id': 'count'
        }).rename(columns={'order_id': 'transaction_count'})
        
        # Sort by quantity
        crop_data = crop_data.sort_values('quantity_quintals', ascending=False)
        
        # Get top N crops
        top_crops = []
        for crop, data in crop_data.head(top_n).iterrows():
            top_crops.append({
                'crop_type': crop,
                'total_quantity': round(data['quantity_quintals'], 2),
                'avg_price': round(data['price_per_quintal_inr'], 2),
                'total_value': round(data['total_value_inr'], 2),
                'transaction_count': int(data['transaction_count']),
                'market_share_percent': round((data['quantity_quintals'] / crop_data['quantity_quintals'].sum()) * 100, 1)
            })
        
        highest_demand = crop_data['quantity_quintals'].idxmax()
        highest_price = crop_data['price_per_quintal_inr'].idxmax()
        
        return {
            'top_crops': top_crops,
            'highest_demand_crop': highest_demand,
            'highest_price_crop': highest_price,
            'total_crops': len(crop_data),
            'recommendation': f"{highest_demand} has highest demand. {highest_price} fetches best prices."
        }
    
    def crop_specific_forecast(self, crop_type, days_ahead=30):
        """
        Forecast demand for specific crop
        
        Args:
            crop_type: Crop name (e.g., 'soybean')
            days_ahead: Days to forecast
        
        Returns:
            dict: Crop-specific forecast
        """
        crop_df = self.df[self.df['crop_type'] == crop_type]
        
        if len(crop_df) < 20:
            return {'error': f'Insufficient data for {crop_type}. Need at least 20 transactions.'}
        
        # Create daily series for this crop
        crop_daily = crop_df.groupby('order_date')['quantity_quintals'].sum()
        
        # Fill missing dates
        date_range = pd.date_range(
            start=crop_daily.index.min(),
            end=crop_daily.index.max(),
            freq='D'
        )
        crop_daily = crop_daily.reindex(date_range).fillna(0)
        
        try:
            # Fit model
            model = ARIMA(crop_daily.replace(0, np.nan).fillna(method='ffill'), order=(3, 1, 2))
            fitted_model = model.fit()
            
            # Forecast
            forecast = fitted_model.forecast(steps=days_ahead)
            
            current_demand = crop_daily[-7:].mean()
            forecast_demand = forecast.mean()
            
            return {
                'crop_type': crop_type,
                'forecast_values': [max(0, round(v, 2)) for v in forecast.tolist()],
                'current_avg_demand': round(current_demand, 2),
                'forecast_avg_demand': round(forecast_demand, 2),
                'demand_trend': 'increasing' if forecast_demand > current_demand else 'decreasing',
                'total_forecast': round(forecast.sum(), 2)
            }
        except Exception as e:
            return {'error': f'Forecast failed for {crop_type}: {str(e)}'}
    
    # ==================== 5. STATE-WISE ANALYSIS ====================
    
    def state_wise_analysis(self, top_n=5):
        """
        Analyze supply and demand by state
        
        Returns:
            dict: {
                'top_states': [list of states with stats],
                'supply_concentration': distribution
            }
        """
        if self.df.empty:
            return {'error': 'No data available'}
        
        # Group by state
        state_data = self.df.groupby('state').agg({
            'quantity_quintals': 'sum',
            'price_per_quintal_inr': 'mean',
            'total_value_inr': 'sum',
            'order_id': 'count'
        }).rename(columns={'order_id': 'transaction_count'})
        
        # Sort by quantity
        state_data = state_data.sort_values('quantity_quintals', ascending=False)
        
        total_quantity = state_data['quantity_quintals'].sum()
        
        # Get top N states
        top_states = []
        for state, data in state_data.head(top_n).iterrows():
            market_share = (data['quantity_quintals'] / total_quantity) * 100
            top_states.append({
                'state': state,
                'total_quantity': round(data['quantity_quintals'], 2),
                'avg_price': round(data['price_per_quintal_inr'], 2),
                'total_value': round(data['total_value_inr'], 2),
                'transaction_count': int(data['transaction_count']),
                'market_share_percent': round(market_share, 1)
            })
        
        # Calculate concentration (top 3 states)
        top_3_concentration = state_data.head(3)['quantity_quintals'].sum() / total_quantity * 100
        
        return {
            'top_states': top_states,
            'total_states': len(state_data),
            'top_3_concentration_percent': round(top_3_concentration, 1),
            'highest_supply_state': state_data['quantity_quintals'].idxmax(),
            'highest_price_state': state_data['price_per_quintal_inr'].idxmax(),
            'recommendation': f"Top supplier: {state_data['quantity_quintals'].idxmax()}. Best prices in: {state_data['price_per_quintal_inr'].idxmax()}"
        }
    
    # ==================== 6. BUYER BEHAVIOR ANALYSIS ====================
    
    def buyer_behavior_analysis(self):
        """
        Analyze demand patterns by buyer type
        
        Returns:
            dict: {
                'buyer_types': [stats by buyer type],
                'dominant_buyer': buyer with most demand
            }
        """
        if self.df.empty:
            return {'error': 'No data available'}
        
        # Group by buyer type
        buyer_data = self.df.groupby('buyer_type').agg({
            'quantity_quintals': 'sum',
            'price_per_quintal_inr': 'mean',
            'total_value_inr': 'sum',
            'order_id': 'count'
        }).rename(columns={'order_id': 'transaction_count'})
        
        total_quantity = buyer_data['quantity_quintals'].sum()
        
        # Build buyer stats
        buyer_stats = []
        for buyer_type, data in buyer_data.iterrows():
            market_share = (data['quantity_quintals'] / total_quantity) * 100
            buyer_stats.append({
                'buyer_type': buyer_type,
                'total_quantity': round(data['quantity_quintals'], 2),
                'avg_price': round(data['price_per_quintal_inr'], 2),
                'total_value': round(data['total_value_inr'], 2),
                'transaction_count': int(data['transaction_count']),
                'market_share_percent': round(market_share, 1),
                'avg_order_size': round(data['quantity_quintals'] / data['transaction_count'], 2)
            })
        
        # Sort by quantity
        buyer_stats = sorted(buyer_stats, key=lambda x: x['total_quantity'], reverse=True)
        
        dominant_buyer = buyer_data['quantity_quintals'].idxmax()
        highest_paying = buyer_data['price_per_quintal_inr'].idxmax()
        
        return {
            'buyer_types': buyer_stats,
            'dominant_buyer': dominant_buyer,
            'highest_paying_buyer': highest_paying,
            'total_buyer_types': len(buyer_data),
            'recommendation': f"{dominant_buyer}s are the largest buyers. {highest_paying}s offer best prices."
        }
    
    # ==================== ROLE-BASED COMPREHENSIVE REPORT ====================
    
    def generate_role_report(self, role, crop_type=None):
        """
        Generate comprehensive report for specific role
        
        Args:
            role: 'farmer', 'fpo', 'processor', 'retailer'
            crop_type: Optional crop filter
        
        Returns:
            dict: Role-specific insights
        """
        if self.df.empty:
            return {'error': 'No market data available for analysis'}
        
        # Base report
        report = {
            'role': role,
            'analysis_period': {
                'start_date': self.df['order_date'].min().strftime('%Y-%m-%d'),
                'end_date': self.df['order_date'].max().strftime('%Y-%m-%d'),
                'total_days': (self.df['order_date'].max() - self.df['order_date'].min()).days
            }
        }
        
        if role == 'farmer':
            # Farmers need: price forecast, seasonal timing, best crops
            report.update({
                'price_forecast': self.forecast_price_trend(days_ahead=30),
                'seasonal_insights': self.seasonal_analysis(),
                'top_crops': self.crop_wise_analysis(top_n=3),
                'buyer_preferences': self.buyer_behavior_analysis(),
                'actionable_recommendation': self._farmer_recommendation()
            })
        
        elif role == 'fpo':
            # FPOs need: demand forecast, procurement planning, state insights
            report.update({
                'demand_forecast': self.forecast_demand_quantity(days_ahead=60),
                'price_forecast': self.forecast_price_trend(days_ahead=60),
                'crop_analysis': self.crop_wise_analysis(top_n=5),
                'state_analysis': self.state_wise_analysis(top_n=5),
                'buyer_behavior': self.buyer_behavior_analysis(),
                'procurement_recommendation': self._fpo_procurement_recommendation()
            })
        
        elif role == 'processor':
            # Processors need: supply forecast, price trends, quality insights
            report.update({
                'supply_forecast': self.forecast_demand_quantity(days_ahead=90),
                'price_forecast': self.forecast_price_trend(days_ahead=60),
                'state_supply': self.state_wise_analysis(top_n=5),
                'crop_availability': self.crop_wise_analysis(top_n=5),
                'seasonal_supply': self.seasonal_analysis(),
                'procurement_strategy': self._processor_procurement_strategy()
            })
        
        elif role == 'retailer':
            # Retailers need: availability forecast, price trends
            report.update({
                'availability_forecast': self.forecast_demand_quantity(days_ahead=30),
                'price_forecast': self.forecast_price_trend(days_ahead=30),
                'crop_analysis': self.crop_wise_analysis(top_n=5),
                'seasonal_insights': self.seasonal_analysis()
            })
        
        return report
    
    # ==================== HELPER METHODS ====================
    
    def _farmer_recommendation(self):
        """Generate actionable recommendation for farmers"""
        price_forecast = self.forecast_price_trend(days_ahead=30)
        
        if 'error' in price_forecast:
            return {'action': 'MONITOR', 'reason': 'Insufficient data for recommendation'}
        
        trend = price_forecast['trend']
        change = price_forecast['price_change_percent']
        
        if trend == 'bullish' and change > 5:
            return {
                'action': 'HOLD',
                'reason': f"Prices expected to increase by {round(change, 1)}% in next 30 days",
                'best_selling_window': '20-30 days from now',
                'expected_price_range': f"₹{price_forecast['forecast_avg_price']:.2f}/quintal"
            }
        elif trend == 'bearish' and change < -5:
            return {
                'action': 'SELL NOW',
                'reason': f"Prices may decline by {abs(round(change, 1))}% in next 30 days",
                'best_selling_window': 'Immediate',
                'current_price': f"₹{price_forecast['current_price']:.2f}/quintal"
            }
        else:
            return {
                'action': 'FLEXIBLE',
                'reason': 'Prices expected to remain stable',
                'best_selling_window': 'Next 15-30 days',
                'price_range': f"₹{price_forecast['current_price']:.2f} - ₹{price_forecast['forecast_avg_price']:.2f}/quintal"
            }
    
    def _fpo_procurement_recommendation(self):
        """Generate procurement strategy for FPOs"""
        demand_forecast = self.forecast_demand_quantity(days_ahead=60)
        
        if 'error' in demand_forecast:
            return {'strategy': 'MONITOR', 'reason': 'Insufficient data'}
        
        total_demand = demand_forecast['total_forecast_demand']
        
        return {
            'recommended_procurement_quintals': round(total_demand * 1.15, 2),  # 15% buffer
            'procurement_schedule': 'Weekly batches',
            'storage_capacity_needed': round(total_demand * 0.25, 2),  # 25% buffer stock
            'forecast_period_days': 60,
            'daily_average_demand': round(demand_forecast['avg_daily_demand'], 2)
        }
    
    def _processor_procurement_strategy(self):
        """Generate procurement strategy for processors"""
        supply_forecast = self.forecast_demand_quantity(days_ahead=90)
        price_forecast = self.forecast_price_trend(days_ahead=60)
        
        if 'error' in supply_forecast or 'error' in price_forecast:
            return {'strategy': 'MONITOR', 'reason': 'Insufficient data'}
        
        price_trend = price_forecast['trend']
        
        if price_trend == 'bearish':
            strategy = 'AGGRESSIVE_PROCUREMENT'
            reason = 'Prices declining - procure now for cost savings'
            timing = 'Immediate - next 2 weeks'
        elif price_trend == 'bullish':
            strategy = 'GRADUAL_PROCUREMENT'
            reason = 'Prices rising - procure in smaller batches to manage costs'
            timing = 'Spread over next 4-6 weeks'
        else:
            strategy = 'STEADY_PROCUREMENT'
            reason = 'Stable prices - maintain regular procurement schedule'
            timing = 'Weekly/bi-weekly batches'
        
        return {
            'strategy': strategy,
            'reason': reason,
            'timing': timing,
            'recommended_quantity': round(supply_forecast['total_forecast_demand'] * 1.2, 2),
            'forecast_horizon_days': 90
        }
