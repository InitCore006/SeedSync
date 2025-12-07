"""
Market Insights and Demand Forecasting
Provides data analysis for different market roles (FPO, Retailer, Processor)
Uses CSV file for data loading with role-based filtering
"""
import pandas as pd
import numpy as np
import os


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
        if role_lower in ['fpo', 'processor', 'retailer', 'trader', 'exporter']:
            df = df[df['buyer_type'] == role_lower]
    
    return df


def calculate_demand_supply(df):
    """Calculate demand and supply metrics from dataframe"""
    if df.empty:
        return pd.DataFrame()
    
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
    
    return demand_supply


def calculate_price_trends(df):
    """Calculate price trends by crop and month"""
    if df.empty:
        return pd.DataFrame()
    
    price_trends = (
        df.groupby(['year', 'month', 'crop_type'])['price_per_quintal_inr']
        .mean()
        .reset_index()
        .rename(columns={'price_per_quintal_inr': 'avg_price'})
    )
    
    return price_trends


def get_market_summary(df):
    """Get complete market summary with demand, supply, and price data"""
    if df.empty:
        return pd.DataFrame()
    
    demand_supply = calculate_demand_supply(df)
    price_trends = calculate_price_trends(df)
    
    market_summary = demand_supply.merge(
        price_trends, on=['year', 'month', 'crop_type'], how='left'
    )
    
    return market_summary.sort_values(['crop_type', 'year', 'month']).reset_index(drop=True)


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
    """
    if df.empty:
        return {
            "market_shortages": {},
            "best_price_crops": {}
        }
    
    market_summary = get_market_summary(df)
    
    if market_summary.empty:
        return {
            "market_shortages": {},
            "best_price_crops": {}
        }
    
    # Calculate demand-supply gap
    farmer_df = market_summary.copy()
    farmer_df['demand_supply_gap'] = farmer_df['demand_quintals'] - farmer_df['supply_quintals']
    
    # Top shortages (demand exceeds supply)
    shortages = farmer_df.sort_values('demand_supply_gap', ascending=False)[
        ['crop_type', 'year', 'month', 'demand_supply_gap']
    ].head(10).reset_index(drop=True)
    
    # Best price crops
    best_prices = farmer_df.sort_values('avg_price', ascending=False)[
        ['crop_type', 'year', 'month', 'avg_price']
    ].head(10).reset_index(drop=True)
    
    return {
        "market_shortages": dataframe_to_columnar_json(shortages),
        "best_price_crops": dataframe_to_columnar_json(best_prices)
    }


def get_all_market_insights(role=None):
    """
    Main function to get all market insights for a given role
    Returns data in columnar JSON format (columns as arrays)
    
    Args:
        role (str): 'fpo', 'retailer', 'processor', 'trader', 'exporter', or None
    
    Returns:
        dict: Market insights with columnar JSON data
    """
    df = get_market_data_for_role(role)
    
    # Get market summary as columnar JSON
    market_summary_df = get_market_summary(df)
    market_summary = dataframe_to_columnar_json(market_summary_df) if not market_summary_df.empty else {}
    
    insights = {
        "data_available": not df.empty,
        "total_orders": len(df),
        "date_range": {
            "start": df['order_date'].min().isoformat() if not df.empty else None,
            "end": df['order_date'].max().isoformat() if not df.empty else None,
        },
        "market_summary": market_summary,
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
        elif role_lower in ['trader', 'exporter']:
            # For trader and exporter, show general market summary
            insights["role_insights"] = {
                "market_summary": market_summary
            }
    
    # Always include farmer insights
    insights["farmer_insights"] = get_farmer_insights(df)
    
    return insights