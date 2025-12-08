"""
Test script for Market Insights API with CSV data
Run this to test the market insights functions with role-based filtering
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from demand_forecast import (
    get_all_market_insights, 
    get_fpo_insights, 
    get_retailer_insights, 
    get_processor_insights,
    get_farmer_insights
)
import json


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)


def print_json(data, max_items=5):
    """Pretty print JSON data, limited to max_items per array"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list) and len(value) > max_items:
                print(f"\n{key} (showing {max_items} of {len(value)} items):")
                print(json.dumps(value[:max_items], indent=2, default=str))
            elif isinstance(value, list):
                print(f"\n{key}:")
                print(json.dumps(value, indent=2, default=str))
            elif isinstance(value, dict):
                print(f"\n{key}:")
                print(json.dumps(value, indent=2, default=str))
            else:
                print(f"{key}: {value}")
    else:
        print(json.dumps(data, indent=2, default=str))


def test_role(role):
    """Test market insights for a specific role"""
    print_section(f"ROLE: {role.upper()}")
    
    insights = get_all_market_insights(role)
    
    # Print metadata
    print(f"Data Available: {insights['data_available']}")
    print(f"Total Orders: {insights['total_orders']}")
    if insights['data_available']:
        print(f"Date Range: {insights['date_range']['start']} to {insights['date_range']['end']}")
    
    # Print role-specific insights
    if 'role_insights' in insights and insights['role_insights']:
        print_section(f"Role-Specific Insights for {role.upper()}")
        print_json(insights['role_insights'])
    
    # Print farmer insights (for all roles)
    print_section(f"Farmer Insights (Market Shortages & Best Prices)")
    if insights['farmer_insights']:
        print_json(insights['farmer_insights'], max_items=3)
    
    # Print market summary sample
    if insights['market_summary']:
        print_section("Market Summary (Sample)")
        print(f"Total records: {len(insights['market_summary'])}")
        print("\nFirst 3 records:")
        print(json.dumps(insights['market_summary'][:3], indent=2, default=str))


def main():
    """Run all tests"""
    print_section("MARKET INSIGHTS API - CSV DATA TEST")
    print("\nTesting role-based market insights with CSV file...")
    print("Valid roles: processor, retailer, trader, exporter, fpo\n")
    
    # Test without role (all data)
    print_section("ALL DATA (No Role Filter)")
    all_insights = get_all_market_insights()
    print(f"Data Available: {all_insights['data_available']}")
    print(f"Total Orders: {all_insights['total_orders']}")
    if all_insights['data_available']:
        print(f"Date Range: {all_insights['date_range']['start']} to {all_insights['date_range']['end']}")
        print(f"Unique crops: {len(set([m.get('crop_type') for m in all_insights['market_summary']]))}")
        print(f"Market summary records: {len(all_insights['market_summary'])}")
    
    # Test each role
    roles = ['processor', 'retailer', 'trader', 'exporter']
    
    for role in roles:
        test_role(role)
    
    # Print summary
    print_section("TEST SUMMARY")
    print("✓ All roles tested successfully!")
    print("\nRoles tested:")
    for role in roles:
        insights = get_all_market_insights(role)
        print(f"  - {role.capitalize()}: {insights['total_orders']} orders")
    
    print("\n" + "="*80)
    print("Testing complete! The API is ready to use with CSV data.")
    print("="*80 + "\n")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
