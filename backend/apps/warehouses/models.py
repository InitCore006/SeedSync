"""
Warehouses Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class Warehouse(TimeStampedModel):
    """Warehouse details"""
    name = models.CharField(max_length=200)
    fpo = models.ForeignKey('fpos.FPOProfile', on_delete=models.CASCADE, related_name='fpo_warehouses', null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    capacity_quintals = models.DecimalField(max_digits=10, decimal_places=2)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'warehouses'
    
    def __str__(self):
        return self.name
    
    def get_available_capacity(self):
        """Calculate available storage capacity"""
        return float(self.capacity_quintals - self.current_stock)
    
    def get_capacity_utilization_percentage(self):
        """Calculate capacity utilization percentage"""
        if self.capacity_quintals > 0:
            return round((float(self.current_stock) / float(self.capacity_quintals)) * 100, 2)
        return 0
    
    def can_accommodate(self, quantity):
        """Check if warehouse can accommodate given quantity"""
        return self.get_available_capacity() >= float(quantity)


class Inventory(TimeStampedModel):
    """Inventory tracking"""
    warehouse = models.ForeignKey('fpos.FPOWarehouse', on_delete=models.CASCADE, related_name='inventory')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='inventory_records')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    entry_date = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'inventory'
    
    def __str__(self):
        return f"{self.lot.lot_number} in {self.warehouse.warehouse_name}"


class StockMovement(TimeStampedModel):
    """Stock movement tracking"""
    warehouse = models.ForeignKey('fpos.FPOWarehouse', on_delete=models.CASCADE, related_name='movements')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=[('in', 'Stock In'), ('out', 'Stock Out')])
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    movement_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, help_text="Reason for stock movement")
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-movement_date']
    
    def __str__(self):
        return f"{self.movement_type.upper()} - {self.quantity}Q in {self.warehouse.warehouse_name}"


class QualityCheck(TimeStampedModel):
    """Quality check records"""
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='quality_checks')
    warehouse = models.ForeignKey('fpos.FPOWarehouse', on_delete=models.CASCADE, related_name='quality_checks')
    checked_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    moisture_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    oil_content = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pass_status = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    
    class Meta:
        db_table = 'quality_checks'
    
    def __str__(self):
        return f"QC for {self.lot.lot_number}"
