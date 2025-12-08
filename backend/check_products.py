#!/usr/bin/env python
"""Check ProcessedProduct database records"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.processors.models import ProcessedProduct
from django.utils import timezone

print("=== ProcessedProduct Database Check ===\n")

# Total count
total = ProcessedProduct.objects.count()
print(f"Total ProcessedProduct records: {total}\n")

# Show all products
if total > 0:
    print("All Products:")
    for p in ProcessedProduct.objects.all():
        print(f"  ID: {p.id}")
        print(f"  SKU: {p.sku}")
        print(f"  Product Type: {p.product_type}")
        print(f"  Processing Type: {p.processing_type}")
        print(f"  Quality: {p.quality_grade}")
        print(f"  Available Qty: {p.available_quantity_liters} liters")
        print(f"  Price: ₹{p.selling_price_per_liter}/L")
        print(f"  For Sale: {p.is_available_for_sale}")
        print(f"  Expiry Date: {p.expiry_date}")
        print(f"  Processor: {p.processor.company_name if p.processor else 'N/A'}")
        print(f"  Created: {p.created_at}")
        print()

# Check filtered products (marketplace logic)
print("\n=== Marketplace Filter Check ===")
products = ProcessedProduct.objects.filter(
    is_available_for_sale=True,
    available_quantity_liters__gt=0
).exclude(expiry_date__lt=timezone.now().date())

print(f"Products passing marketplace filters: {products.count()}\n")

if products.count() > 0:
    print("Filtered Products:")
    for p in products:
        print(f"  - {p.sku}: {p.product_type}, {p.available_quantity_liters}L, expires {p.expiry_date}")
else:
    print("No products pass the marketplace filters!")
    print("\nTroubleshooting:")
    print(f"  - Products with is_available_for_sale=False: {ProcessedProduct.objects.filter(is_available_for_sale=False).count()}")
    print(f"  - Products with available_quantity_liters=0: {ProcessedProduct.objects.filter(available_quantity_liters__lte=0).count()}")
    print(f"  - Products with expired dates: {ProcessedProduct.objects.filter(expiry_date__lt=timezone.now().date()).count()}")
