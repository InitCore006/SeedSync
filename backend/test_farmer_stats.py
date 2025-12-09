"""
Test script for Farmer Statistics API
Run this script to verify the updated statistics calculations

Usage:
    python test_farmer_stats.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.farmers.models import FarmerProfile
from apps.lots.models import ProcurementLot
from apps.bids.models import Bid
from apps.payments.models import Payment
from django.db.models import Sum, Count


def test_farmer_statistics(farmer_id=None):
    """Test statistics calculation for a farmer"""
    
    if farmer_id:
        try:
            farmer = FarmerProfile.objects.get(id=farmer_id)
        except FarmerProfile.DoesNotExist:
            print(f"❌ Farmer with ID {farmer_id} not found")
            return
    else:
        # Get first farmer
        farmer = FarmerProfile.objects.first()
        if not farmer:
            print("❌ No farmers found in database")
            return
    
    print(f"\n{'='*60}")
    print(f"Testing Farmer Statistics for: {farmer.user.get_full_name()}")
    print(f"Farmer ID: {farmer.id}")
    print(f"Phone: {farmer.user.phone_number}")
    print(f"{'='*60}\n")
    
    # Test 1: Total Lots Created
    total_lots = ProcurementLot.objects.filter(farmer=farmer).count()
    print(f"✓ Total Lots Created: {total_lots}")
    
    # Test 2: Active Lots
    active_lots = ProcurementLot.objects.filter(
        farmer=farmer,
        status__in=['available', 'bidding']
    ).count()
    print(f"✓ Active Lots (available/bidding): {active_lots}")
    
    # Test 3: Sold Lots
    sold_lots = ProcurementLot.objects.filter(
        farmer=farmer,
        status__in=['sold', 'delivered']
    ).count()
    print(f"✓ Sold Lots: {sold_lots}")
    
    # Test 4: Pending Bids
    pending_bids = Bid.objects.filter(
        lot__farmer=farmer,
        status='pending'
    ).count()
    print(f"✓ Pending Bids: {pending_bids}")
    
    # Test 5: Accepted Bids
    accepted_bids = Bid.objects.filter(
        lot__farmer=farmer,
        status='accepted'
    ).count()
    print(f"✓ Accepted Bids: {accepted_bids}")
    
    # Test 6: Total Quantity Sold
    sold_aggregate = ProcurementLot.objects.filter(
        farmer=farmer,
        status__in=['sold', 'delivered']
    ).aggregate(
        total_sold=Sum('quantity_quintals')
    )
    total_quantity_sold = sold_aggregate['total_sold'] or 0
    print(f"✓ Total Quantity Sold: {total_quantity_sold} quintals")
    
    # Test 7: Total Earnings
    earnings_aggregate = Payment.objects.filter(
        lot__farmer=farmer,
        status='completed'
    ).aggregate(
        total_earnings=Sum('amount')
    )
    total_earnings = earnings_aggregate['total_earnings'] or 0
    print(f"✓ Total Earnings: ₹{total_earnings}")
    
    # Test 8: Payment Statistics
    payment_stats = Payment.objects.filter(
        lot__farmer=farmer
    ).values('status').annotate(count=Count('id'))
    
    print(f"\n📊 Payment Status Breakdown:")
    for stat in payment_stats:
        print(f"   - {stat['status']}: {stat['count']}")
    
    # Test 9: Lot Status Breakdown
    lot_stats = ProcurementLot.objects.filter(
        farmer=farmer
    ).values('status').annotate(count=Count('id'))
    
    print(f"\n📦 Lot Status Breakdown:")
    for stat in lot_stats:
        print(f"   - {stat['status']}: {stat['count']}")
    
    # Test 10: Farm Lands
    farmland_count = farmer.farm_lands.count()
    print(f"\n🌾 Farm Lands: {farmland_count}")
    print(f"🌾 Total Land Area: {farmer.total_land_acres} acres")
    
    # Test 11: Active Crops
    active_crops = farmer.crop_plans.filter(
        status__in=['sowed', 'growing']
    ).count()
    print(f"🌱 Active Crops: {active_crops}")
    
    print(f"\n{'='*60}")
    print("✅ All statistics calculated successfully!")
    print(f"{'='*60}\n")
    
    # Return formatted stats
    return {
        'total_lots_created': total_lots,
        'total_quantity_sold_quintals': float(total_quantity_sold),
        'total_earnings': float(total_earnings),
        'total_farmland_acres': float(farmer.total_land_acres),
        'farmland_count': farmland_count,
        'active_crops': active_crops,
        'active_lots': active_lots,
        'pending_bids': pending_bids,
    }


def list_all_farmers():
    """List all farmers in the system"""
    farmers = FarmerProfile.objects.select_related('user').all()
    
    if not farmers:
        print("❌ No farmers found in database")
        return
    
    print(f"\n{'='*60}")
    print(f"Total Farmers: {farmers.count()}")
    print(f"{'='*60}\n")
    
    for farmer in farmers:
        lots_count = ProcurementLot.objects.filter(farmer=farmer).count()
        print(f"ID: {farmer.id}")
        print(f"Name: {farmer.user.get_full_name()}")
        print(f"Phone: {farmer.user.phone_number}")
        print(f"District: {farmer.district}, {farmer.state}")
        print(f"Lots Created: {lots_count}")
        print(f"{'-'*60}\n")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Farmer Statistics API')
    parser.add_argument('--farmer-id', type=str, help='Farmer ID to test (UUID)')
    parser.add_argument('--list', action='store_true', help='List all farmers')
    
    args = parser.parse_args()
    
    if args.list:
        list_all_farmers()
    else:
        stats = test_farmer_statistics(args.farmer_id)
        if stats:
            print("\n📱 Mobile App Response Format:")
            print("-" * 60)
            import json
            print(json.dumps({
                'success': True,
                'message': 'Statistics retrieved successfully',
                'data': stats
            }, indent=2))
