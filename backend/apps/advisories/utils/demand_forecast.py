"""
Market Insights and Demand Forecasting
Provides data analysis for different market roles (FPO, Retailer, Processor)
Uses CSV file for data loading with role-based filtering
Includes ARIMA-based forecasting for demand and price predictions
"""
import pandas as pd
import numpy as np
import os
import warnings
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

warnings.filterwarnings('ignore')


def dataframe_to_columnar_json(df):
    """
    Convert DataFrame to columnar JSON format
    Each column becomes a key with array of values
    
    Example:
    Input DataFrame:
        crop_type  year  month  demand_supply_gap
        groundnut  2024  2      5442.15
        mustard    2024  3      5246.00
    
    Output JSON:
    {
        "crop_type": ["groundnut", "mustard"],
        "year": [2024, 2024],
        "month": [2, 3],
        "demand_supply_gap": [5442.15, 5246.00]
    }
    """
    if df.empty:
        return {}
    
    result = {}
    for column in df.columns:
        # Convert to list, handling NaN values
        values = df[column].astype(object).where(pd.notnull(df[column]), None).tolist()
        # Convert numpy types to Python types
        result[column] = [v.item() if hasattr(v, 'item') else v for v in values]
    
    return result


def get_market_data_for_role(role=None):
    """
    Load orders from CSV file and prepare as pandas DataFrame
    Filters by buyer_type/role if provided (fpo, retailer, processor, trader, exporter)
    
    Args:
        role (str): 'fpo', 'retailer', 'processor', 'trader', 'exporter' - filters by buyer_type
    
    Returns:
        pd.DataFrame: Processed market data
    """
    # Get the CSV file path (same directory as this script)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, 'orders.csv')
    
    # Load the CSV file
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"CSV file not found at {csv_path}")
        return pd.DataFrame()
    
    # Basic preprocessing
    df['order_date'] = pd.to_datetime(df['order_date'], dayfirst=True, errors='coerce')
    df['created_timestamp'] = pd.to_datetime(df['created_timestamp'], errors='coerce')
    
    # Extract useful time attributes
    df['year'] = df['order_date'].dt.year
    df['month'] = df['order_date'].dt.month
    df['week'] = df['order_date'].dt.isocalendar().week
    
    # Standardize crop and buyer type
    df['crop_type'] = df['crop_type'].str.lower()
    df['buyer_type'] = df['buyer_type'].str.lower()
    df['state'] = df['state'].str.title()
    
    # Filter by role/buyer_type if provided
    if role:
        role_lower = role.lower()
        if role_lower in ['fpo', 'processor', 'retailer', "farmer"]:
            df = df[df['buyer_type'] == role_lower]
    
    return df


def calculate_demand_supply(df, forecast_periods=3):
    """
    Calculate demand and supply metrics from dataframe with ARIMA forecasting
    
    Args:
        df (pd.DataFrame): Input dataframe with market data
        forecast_periods (int): Number of periods (months) to forecast ahead. Default is 3.
    
    Returns:
        dict: Contains 'actual' (historical data) and 'forecast' (future predictions)
    """
    if df.empty:
        return {'actual': pd.DataFrame(), 'forecast': pd.DataFrame()}
    
    # Demand = Total quantity ordered
    demand = (
        df.groupby(['year', 'month', 'crop_type'])['quantity_quintals']
        .sum()
        .reset_index()
        .rename(columns={'quantity_quintals': 'demand_quintals'})
    )
    
    # Supply = Quantity from completed/delivered orders
    supply = (
        df[df['status'].isin(['completed', 'delivered'])]
        .groupby(['year', 'month', 'crop_type'])['quantity_quintals']
        .sum()
        .reset_index()
        .rename(columns={'quantity_quintals': 'supply_quintals'})
    )
    
    # Merge demand and supply
    demand_supply = demand.merge(
        supply, on=['year', 'month', 'crop_type'], how='left'
    ).fillna(0)
    
    # Generate ARIMA forecasts for each crop
    forecast_data = []
    
    for crop in demand_supply['crop_type'].unique():
        crop_data = demand_supply[demand_supply['crop_type'] == crop].copy()
        
        # Sort by year and month to ensure time series order
        crop_data = crop_data.sort_values(['year', 'month']).reset_index(drop=True)
        
        if len(crop_data) < 3:
            # Not enough data for ARIMA
            continue
        
        # Forecast demand
        try:
            demand_series = crop_data['demand_quintals'].values
            if len(demand_series) >= 3 and np.std(demand_series) > 0:
                demand_model = ARIMA(demand_series, order=(1, 1, 1))
                demand_fitted = demand_model.fit()
                demand_forecast = demand_fitted.forecast(steps=forecast_periods)
            else:
                # Fallback to simple average if series is too small or constant
                demand_forecast = np.full(forecast_periods, crop_data['demand_quintals'].mean())
        except Exception as e:
            # Fallback to simple moving average on error
            demand_forecast = np.full(forecast_periods, crop_data['demand_quintals'].mean())
        
        # Forecast supply
        try:
            supply_series = crop_data['supply_quintals'].values
            if len(supply_series) >= 3 and np.std(supply_series) > 0:
                supply_model = ARIMA(supply_series, order=(1, 1, 1))
                supply_fitted = supply_model.fit()
                supply_forecast = supply_fitted.forecast(steps=forecast_periods)
            else:
                supply_forecast = np.full(forecast_periods, crop_data['supply_quintals'].mean())
        except Exception as e:
            supply_forecast = np.full(forecast_periods, crop_data['supply_quintals'].mean())
        
        # Create forecast dataframe for this crop
        last_year = crop_data['year'].iloc[-1]
        last_month = crop_data['month'].iloc[-1]
        
        for i, (demand_val, supply_val) in enumerate(zip(demand_forecast, supply_forecast)):
            # Calculate next month/year
            next_month = last_month + i + 1
            next_year = last_year
            
            if next_month > 12:
                next_year += next_month // 12
                next_month = next_month % 12
                if next_month == 0:
                    next_month = 12
                    next_year -= 1
            
            forecast_data.append({
                'year': next_year,
                'month': next_month,
                'crop_type': crop,
                'demand_quintals': max(0, demand_val),  # Ensure non-negative
                'supply_quintals': max(0, supply_val),
                'is_forecast': True
            })
    
    forecast_df = pd.DataFrame(forecast_data) if forecast_data else pd.DataFrame()
    
    # Add is_forecast flag to actual data
    demand_supply['is_forecast'] = False
    
    return {
        'actual': demand_supply,
        'forecast': forecast_df
    }


def calculate_price_trends(df, forecast_periods=3):
    """
    Calculate price trends by crop and month with ARIMA forecasting
    
    Args:
        df (pd.DataFrame): Input dataframe with market data
        forecast_periods (int): Number of periods (months) to forecast ahead. Default is 3.
    
    Returns:
        dict: Contains 'actual' (historical data) and 'forecast' (future predictions)
    """
    if df.empty:
        return {'actual': pd.DataFrame(), 'forecast': pd.DataFrame()}
    
    price_trends = (
        df.groupby(['year', 'month', 'crop_type'])['price_per_quintal_inr']
        .mean()
        .reset_index()
        .rename(columns={'price_per_quintal_inr': 'avg_price'})
    )
    
    # Generate ARIMA forecasts for each crop
    forecast_data = []
    
    for crop in price_trends['crop_type'].unique():
        crop_prices = price_trends[price_trends['crop_type'] == crop].copy()
        
        # Sort by year and month to ensure time series order
        crop_prices = crop_prices.sort_values(['year', 'month']).reset_index(drop=True)
        
        if len(crop_prices) < 3:
            # Not enough data for ARIMA
            continue
        
        try:
            price_series = crop_prices['avg_price'].values
            
            # Check if series has sufficient variance and data points
            if len(price_series) >= 3 and np.std(price_series) > 0:
                price_model = ARIMA(price_series, order=(1, 1, 1))
                price_fitted = price_model.fit()
                price_forecast = price_fitted.forecast(steps=forecast_periods)
            else:
                # Fallback to mean price if series is too small or constant
                price_forecast = np.full(forecast_periods, crop_prices['avg_price'].mean())
        except Exception as e:
            # Fallback to simple moving average on error
            price_forecast = np.full(forecast_periods, crop_prices['avg_price'].mean())
        
        # Create forecast dataframe for this crop
        last_year = crop_prices['year'].iloc[-1]
        last_month = crop_prices['month'].iloc[-1]
        
        for i, price_val in enumerate(price_forecast):
            # Calculate next month/year
            next_month = last_month + i + 1
            next_year = last_year
            
            if next_month > 12:
                next_year += next_month // 12
                next_month = next_month % 12
                if next_month == 0:
                    next_month = 12
                    next_year -= 1
            
            forecast_data.append({
                'year': next_year,
                'month': next_month,
                'crop_type': crop,
                'avg_price': max(0, price_val)  # Ensure non-negative
            })
    
    forecast_df = pd.DataFrame(forecast_data) if forecast_data else pd.DataFrame()
    
    # Add is_forecast flag to actual data
    price_trends['is_forecast'] = False
    
    return {
        'actual': price_trends,
        'forecast': forecast_df
    }


def get_market_summary(df):
    """Get complete market summary with demand, supply, and price data including forecasts"""
    if df.empty:
        return {'actual': pd.DataFrame(), 'forecast': pd.DataFrame()}
    
    demand_supply_result = calculate_demand_supply(df)
    price_trends_result = calculate_price_trends(df)
    
    # Merge actual data
    demand_supply = demand_supply_result['actual']
    price_trends = price_trends_result['actual']
    
    actual_summary = demand_supply.merge(
        price_trends, on=['year', 'month', 'crop_type'], how='left'
    )
    actual_summary = actual_summary.sort_values(['crop_type', 'year', 'month']).reset_index(drop=True)
    
    # Merge forecast data
    forecast_demand = demand_supply_result['forecast']
    forecast_price = price_trends_result['forecast']
    
    if not forecast_demand.empty and not forecast_price.empty:
        forecast_summary = forecast_demand.merge(
            forecast_price, on=['year', 'month', 'crop_type'], how='left'
        )
    elif not forecast_demand.empty:
        forecast_summary = forecast_demand.copy()
    elif not forecast_price.empty:
        forecast_summary = forecast_price.copy()
    else:
        forecast_summary = pd.DataFrame()
    
    return {
        'actual': actual_summary,
        'forecast': forecast_summary
    }


# ============================
# ROLE-SPECIFIC INSIGHTS
# ============================

def get_fpo_insights(df):
    """
    FPO Insights in columnar JSON format
    Returns columns as arrays for easy graphing
    """
    if df.empty:
        return {
            "buyer_demand_by_crop": {},
            "state_crop_demand": {}
        }
    
    # Buyer demand by crop
    buyer_demand = (
        df.groupby('crop_type')['quantity_quintals']
        .sum()
        .reset_index()
        .sort_values('quantity_quintals', ascending=False)
    )
    buyer_demand.columns = ['crop_type', 'total_quantity']
    
    # State-wise crop demand
    state_demand = (
        df.groupby(['state', 'crop_type'])['quantity_quintals']
        .sum()
        .reset_index()
        .sort_values('quantity_quintals', ascending=False)
    )
    state_demand.columns = ['state', 'crop_type', 'total_quantity']
    
    return {
        "buyer_demand_by_crop": dataframe_to_columnar_json(buyer_demand),
        "state_crop_demand": dataframe_to_columnar_json(state_demand)
    }


def get_retailer_insights(df):
    """
    Retailer Insights in columnar JSON format
    Returns columns as arrays for easy graphing
    """
    if df.empty:
        return {
            "price_trends": {},
            "monthly_demand": {}
        }
    
    # Price trends by crop and month
    price_trends = (
        df.groupby(['crop_type', 'month'])['price_per_quintal_inr']
        .mean()
        .reset_index()
    )
    price_trends.columns = ['crop_type', 'month', 'avg_price']
    
    # Monthly demand by crop
    monthly_demand = (
        df.groupby(['crop_type', 'month'])['quantity_quintals']
        .sum()
        .reset_index()
    )
    monthly_demand.columns = ['crop_type', 'month', 'total_quantity']
    
    return {
        "price_trends": dataframe_to_columnar_json(price_trends),
        "monthly_demand": dataframe_to_columnar_json(monthly_demand)
    }


def get_processor_insights(df):
    """
    Processor Insights in columnar JSON format
    Returns columns as arrays for easy graphing
    """
    if df.empty:
        return {
            "procurement_by_state": {},
            "completion_rates": {}
        }
    
    # Procurement by state and crop
    procurement = (
        df.groupby(['state', 'crop_type'])['quantity_quintals']
        .sum()
        .reset_index()
        .sort_values('quantity_quintals', ascending=False)
    )
    procurement.columns = ['state', 'crop_type', 'procurement_volume']
    
    # Completion rates by status
    completion_counts = df['status'].value_counts(normalize=True).reset_index()
    completion_counts.columns = ['status', 'percentage']
    completion_counts['percentage'] = (completion_counts['percentage'] * 100).round(2)
    
    return {
        "procurement_by_state": dataframe_to_columnar_json(procurement),
        "completion_rates": dataframe_to_columnar_json(completion_counts)
    }


def get_farmer_insights(df):
    """
    Farmer Insights in columnar JSON format
    Returns columns as arrays for easy graphing
    Includes forecasted market shortages and best price crops
    """
    if df.empty:
        return {
            "market_shortages": {},
            "best_price_crops": {},
            "forecast_shortages": {},
            "forecast_best_prices": {}
        }
    
    market_summary = get_market_summary(df)
    
    if market_summary['actual'].empty:
        return {
            "market_shortages": {},
            "best_price_crops": {},
            "forecast_shortages": {},
            "forecast_best_prices": {}
        }
    
    # Calculate demand-supply gap for actual data
    actual_df = market_summary['actual'].copy()
    actual_df['demand_supply_gap'] = actual_df['demand_quintals'] - actual_df['supply_quintals']
    
    # Top shortages (demand exceeds supply) - actual
    shortages = actual_df.sort_values('demand_supply_gap', ascending=False)[
        ['crop_type', 'year', 'month', 'demand_supply_gap']
    ].head(10).reset_index(drop=True)
    
    # Best price crops - actual
    best_prices = actual_df.sort_values('avg_price', ascending=False)[
        ['crop_type', 'year', 'month', 'avg_price']
    ].head(10).reset_index(drop=True)
    
    # Process forecast data if available
    forecast_df = market_summary['forecast'].copy()
    forecast_shortages = pd.DataFrame()
    forecast_best_prices = pd.DataFrame()
    
    if not forecast_df.empty:
        forecast_df['demand_supply_gap'] = forecast_df['demand_quintals'] - forecast_df['supply_quintals']
        
        # Top forecasted shortages
        forecast_shortages = forecast_df.sort_values('demand_supply_gap', ascending=False)[
            ['crop_type', 'year', 'month', 'demand_supply_gap']
        ].head(10).reset_index(drop=True)
        
        # Best forecasted price crops
        forecast_best_prices = forecast_df.sort_values('avg_price', ascending=False)[
            ['crop_type', 'year', 'month', 'avg_price']
        ].head(10).reset_index(drop=True)
    
    return {
        "market_shortages": dataframe_to_columnar_json(shortages),
        "best_price_crops": dataframe_to_columnar_json(best_prices),
        "forecast_shortages": dataframe_to_columnar_json(forecast_shortages),
        "forecast_best_prices": dataframe_to_columnar_json(forecast_best_prices)
    }


def get_all_market_insights(role=None):
    """
    Main function to get all market insights for a given role
    Returns data in columnar JSON format (columns as arrays) with historical and forecasted data
    
    Args:
        role (str): 'fpo', 'retailer', 'processor', 'trader', 'exporter', or None
    
    Returns:
        dict: Market insights with columnar JSON data including forecasts
    """
    df = get_market_data_for_role(role)
    
    # Get market summary with both actual and forecast data
    market_summary_result = get_market_summary(df)
    
    actual_data = dataframe_to_columnar_json(market_summary_result['actual']) if not market_summary_result['actual'].empty else {}
    forecast_data = dataframe_to_columnar_json(market_summary_result['forecast']) if not market_summary_result['forecast'].empty else {}
    
    insights = {
        "data_available": not df.empty,
        "total_orders": len(df),
        "date_range": {
            "start": df['order_date'].min().isoformat() if not df.empty else None,
            "end": df['order_date'].max().isoformat() if not df.empty else None,
        },
        "market_summary": {
            "actual": actual_data,
            "forecast": forecast_data
        },
    }
    
    # Add role-specific insights
    if role:
        role_lower = role.lower()
        if role_lower == 'fpo':
            insights["role_insights"] = get_fpo_insights(df)
        elif role_lower == 'retailer':
            insights["role_insights"] = get_retailer_insights(df)
        elif role_lower == 'processor':
            insights["role_insights"] = get_processor_insights(df)
        elif role_lower in ['farmer']:
            # For trader and exporter, show general market summary
            insights["role_insights"] = {
                "market_summary_actual": actual_data,
                "market_summary_forecast": forecast_data
            }
    
    # Always include farmer insights
    insights["farmer_insights"] = get_farmer_insights(df)
    
    return insights