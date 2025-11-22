from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, F
from .models import (
    Warehouse, WarehouseSensorData, Shipment, 
    GPSTrackingLog, RouteOptimization
)


from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Q, Sum, Count
from django.urls import reverse
from .models import Warehouse, Vehicle

# ============================================================================
# CUSTOM FILTERS
# ============================================================================

class WarehouseTypeFilter(admin.SimpleListFilter):
    """Filter by warehouse type"""
    title = 'Warehouse Type'
    parameter_name = 'warehouse_type'
    
    def lookups(self, request, model_admin):
        return Warehouse.WAREHOUSE_TYPE
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(warehouse_type=self.value())
        return queryset


class StorageTypeFilter(admin.SimpleListFilter):
    """Filter by storage type"""
    title = 'Storage Type'
    parameter_name = 'storage_type'
    
    def lookups(self, request, model_admin):
        return Warehouse.STORAGE_TYPE
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(storage_type=self.value())
        return queryset


class OwnerTypeFilter(admin.SimpleListFilter):
    """Filter by owner type"""
    title = 'Owner Type'
    parameter_name = 'owner_type'
    
    def lookups(self, request, model_admin):
        return [
            ('FPO', 'FPO'),
            ('PROCESSOR', 'Processor'),
            ('RETAILER', 'Retailer'),
            ('LOGISTICS', 'Logistics Partner'),
        ]
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(owner_type=self.value())
        return queryset


class UtilizationFilter(admin.SimpleListFilter):
    """Filter by warehouse utilization"""
    title = 'Capacity Utilization'
    parameter_name = 'utilization'
    
    def lookups(self, request, model_admin):
        return (
            ('high', 'High (>80%)'),
            ('medium', 'Medium (50-80%)'),
            ('low', 'Low (<50%)'),
            ('empty', 'Empty'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'high':
            return queryset.filter(current_occupancy__gt=0.8 * F('total_capacity'))
        elif self.value() == 'medium':
            return queryset.filter(
                current_occupancy__gte=0.5 * F('total_capacity'),
                current_occupancy__lte=0.8 * F('total_capacity')
            )
        elif self.value() == 'low':
            return queryset.filter(
                current_occupancy__lt=0.5 * F('total_capacity'),
                current_occupancy__gt=0
            )
        elif self.value() == 'empty':
            return queryset.filter(current_occupancy=0)
        return queryset


class StateFilter(admin.SimpleListFilter):
    """Dynamic state filter"""
    title = 'State'
    parameter_name = 'state'
    
    def lookups(self, request, model_admin):
        states = Warehouse.objects.values_list('state', flat=True).distinct()
        return sorted([(s, s) for s in states if s])
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(state=self.value())
        return queryset


class FacilitiesFilter(admin.SimpleListFilter):
    """Filter by available facilities"""
    title = 'Facilities'
    parameter_name = 'facilities'
    
    def lookups(self, request, model_admin):
        return (
            ('weighbridge', 'Has Weighbridge'),
            ('quality_testing', 'Has Quality Testing'),
            ('security', 'Has Security'),
            ('all', 'All Facilities'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'weighbridge':
            return queryset.filter(has_weighbridge=True)
        elif self.value() == 'quality_testing':
            return queryset.filter(has_quality_testing=True)
        elif self.value() == 'security':
            return queryset.filter(has_security=True)
        elif self.value() == 'all':
            return queryset.filter(
                has_weighbridge=True,
                has_quality_testing=True,
                has_security=True
            )
        return queryset


# ============================================================================
# WAREHOUSE ADMIN
# ============================================================================

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    """Enhanced Warehouse Management with Visual Analytics"""
    
    # List Display
    list_display = [
        'warehouse_id_display',
        'warehouse_name_display',
        'owner_badge',
        'location_display',
        'warehouse_type_badge',
        'storage_type_badge',
        'capacity_display',
        'utilization_bar',
        'facilities_badges',
        'status_display',
    ]
    
    list_filter = [
        OwnerTypeFilter,
        WarehouseTypeFilter,
        StorageTypeFilter,
        StateFilter,
        UtilizationFilter,
        FacilitiesFilter,
        'has_weighbridge',
        'has_quality_testing',
        'has_security',
    ]
    
    search_fields = [
        'warehouse_name',
        'state',
        'district',
        'pincode',
        'address',
    ]
    
    ordering = ['-created_at']
    
    list_per_page = 25
    
    # Fieldsets
    fieldsets = (
        ('Ownership Information', {
            'fields': (
                ('owner_type', 'owner_id'),
                'owner_details_link'
            ),
            'classes': ('wide',)
        }),
        ('Basic Information', {
            'fields': (
                'warehouse_name',
                ('warehouse_type', 'storage_type'),
            )
        }),
        ('Location Details', {
            'fields': (
                'address',
                ('state', 'district', 'pincode'),
                ('latitude', 'longitude'),
                'map_link'
            )
        }),
        ('Capacity & Occupancy', {
            'fields': (
                ('total_capacity', 'current_occupancy'),
                'capacity_stats',
                'occupancy_chart'
            ),
            'description': 'Capacity in Metric Tonnes (MT)'
        }),
        ('Facilities & Features', {
            'fields': (
                ('has_weighbridge', 'has_quality_testing', 'has_security'),
                'facilities_summary'
            )
        }),
        ('Timestamps', {
            'fields': (
                ('created_at', 'updated_at'),
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'owner_details_link',
        'map_link',
        'capacity_stats',
        'occupancy_chart',
        'facilities_summary',
        'created_at',
        'updated_at'
    ]
    
    # Actions
    actions = [
        'mark_full',
        'mark_empty',
        'enable_all_facilities',
        'export_warehouse_report',
        'calculate_total_capacity',
    ]
    
    # Custom Display Methods
    def warehouse_id_display(self, obj):
        """Display warehouse ID with icon"""
        return format_html(
            '<span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">📦 {}</span>',
            obj.id
        )
    warehouse_id_display.short_description = 'ID'
    warehouse_id_display.admin_order_field = 'id'
    
    def warehouse_name_display(self, obj):
        """Display warehouse name with edit link"""
        url = reverse('admin:logistics_warehouse_change', args=[obj.pk])
        return format_html(
            '<a href="{}" style="font-weight: bold; color: #007bff;">{}</a>',
            url,
            obj.warehouse_name
        )
    warehouse_name_display.short_description = 'Warehouse Name'
    warehouse_name_display.admin_order_field = 'warehouse_name'
    
    def owner_badge(self, obj):
        """Colored owner type badge"""
        colors = {
            'FPO': '#17a2b8',
            'PROCESSOR': '#ffc107',
            'RETAILER': '#fd7e14',
            'LOGISTICS': '#6f42c1',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.owner_type, '#6c757d'),
            obj.owner_type
        )
    owner_badge.short_description = 'Owner'
    owner_badge.admin_order_field = 'owner_type'
    
    def location_display(self, obj):
        """Display location with pin icon"""
        return format_html(
            '<span title="{}"">📍 {}, {}</span><br/><small style="color: #6c757d;">{}</small>',
            obj.address,
            obj.district,
            obj.state,
            obj.pincode
        )
    location_display.short_description = 'Location'
    location_display.admin_order_field = 'state'
    
    def warehouse_type_badge(self, obj):
        """Warehouse type badge"""
        colors = {
            'OWNED': '#28a745',
            'RENTED': '#fd7e14',
            'SHARED': '#17a2b8',
        }
        icons = {
            'OWNED': '🏠',
            'RENTED': '🏢',
            'SHARED': '🤝',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{} {}</span>',
            colors.get(obj.warehouse_type, '#6c757d'),
            icons.get(obj.warehouse_type, ''),
            obj.get_warehouse_type_display()
        )
    warehouse_type_badge.short_description = 'Type'
    warehouse_type_badge.admin_order_field = 'warehouse_type'
    
    def storage_type_badge(self, obj):
        """Storage type badge"""
        colors = {
            'OPEN': '#6c757d',
            'COVERED': '#007bff',
            'COLD': '#17a2b8',
            'SCIENTIFIC': '#6610f2',
        }
        icons = {
            'OPEN': '🌤',
            'COVERED': '🏗',
            'COLD': '❄',
            'SCIENTIFIC': '🔬',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{} {}</span>',
            colors.get(obj.storage_type, '#6c757d'),
            icons.get(obj.storage_type, ''),
            obj.get_storage_type_display()
        )
    storage_type_badge.short_description = 'Storage'
    storage_type_badge.admin_order_field = 'storage_type'
    
    def capacity_display(self, obj):
        """Display capacity with visual indicator"""
        return format_html(
            '<div style="text-align: right;">'
            '<strong>{:,.2f}</strong> MT<br/>'
            '<small style="color: #6c757d;">Current: {:,.2f} MT</small><br/>'
            '<small style="color: #28a745;">Available: {:,.2f} MT</small>'
            '</div>',
            obj.total_capacity,
            obj.current_occupancy,
            obj.available_capacity
        )
    capacity_display.short_description = 'Capacity'
    
    def utilization_bar(self, obj):
        """Visual utilization bar with percentage"""
        utilization = obj.occupancy_percentage
        
        # Determine color based on utilization
        if utilization >= 90:
            color = '#dc3545'  # Red
            status = 'Critical'
        elif utilization >= 75:
            color = '#ffc107'  # Yellow
            status = 'High'
        elif utilization >= 50:
            color = '#17a2b8'  # Cyan
            status = 'Medium'
        elif utilization > 0:
            color = '#28a745'  # Green
            status = 'Low'
        else:
            color = '#e9ecef'  # Gray
            status = 'Empty'
        
        return format_html(
            '<div style="width: 120px;">'
            '<div style="width: 100%; background: #e9ecef; border-radius: 4px; overflow: hidden; height: 20px;">'
            '<div style="width: {:.1f}%; background: {}; color: white; text-align: center; font-size: 10px; line-height: 20px; font-weight: bold;">'
            '{:.1f}%'
            '</div>'
            '</div>'
            '<small style="color: {};">{}</small>'
            '</div>',
            utilization,
            color,
            utilization,
            color,
            status
        )
    utilization_bar.short_description = 'Utilization'
    
    def facilities_badges(self, obj):
        """Display available facilities as badges"""
        badges = []
        
        if obj.has_weighbridge:
            badges.append(
                '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">⚖ Weighbridge</span>'
            )
        
        if obj.has_quality_testing:
            badges.append(
                '<span style="background: #6610f2; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">✓ QC Lab</span>'
            )
        
        if obj.has_security:
            badges.append(
                '<span style="background: #fd7e14; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">🛡 Security</span>'
            )
        
        if not badges:
            return format_html('<span style="color: #6c757d;">No facilities</span>')
        
        return format_html('<br/>'.join(badges))
    facilities_badges.short_description = 'Facilities'
    
    def status_display(self, obj):
        """Display overall warehouse status"""
        # Calculate status based on utilization and facilities
        utilization = obj.occupancy_percentage
        facilities_count = sum([obj.has_weighbridge, obj.has_quality_testing, obj.has_security])
        
        if utilization >= 90:
            status = 'Near Full'
            color = '#dc3545'
            icon = '🔴'
        elif utilization >= 50:
            status = 'Active'
            color = '#28a745'
            icon = '🟢'
        elif utilization > 0:
            status = 'Available'
            color = '#17a2b8'
            icon = '🔵'
        else:
            status = 'Empty'
            color = '#ffc107'
            icon = '⚪'
        
        return format_html(
            '<div style="text-align: center;">'
            '<span style="font-size: 16px;">{}</span><br/>'
            '<small style="color: {}; font-weight: bold;">{}</small><br/>'
            '<small style="color: #6c757d;">{}/3 Facilities</small>'
            '</div>',
            icon,
            color,
            status,
            facilities_count
        )
    status_display.short_description = 'Status'
    
    # Readonly Field Methods
    def owner_details_link(self, obj):
        """Link to owner profile"""
        if obj.owner_type == 'FPO':
            from users.models import FPOProfile
            try:
                profile = FPOProfile.objects.get(id=obj.owner_id)
                url = reverse('admin:users_fpoprofile_change', args=[profile.pk])
                return format_html(
                    '<a href="{}" target="_blank" style="color: #007bff;">📋 View FPO Profile: {}</a>',
                    url,
                    profile.organization_name
                )
            except FPOProfile.DoesNotExist:
                return format_html('<span style="color: #dc3545;">Profile not found</span>')
        
        elif obj.owner_type == 'PROCESSOR':
            from users.models import ProcessorProfile
            try:
                profile = ProcessorProfile.objects.get(id=obj.owner_id)
                url = reverse('admin:users_processorprofile_change', args=[profile.pk])
                return format_html(
                    '<a href="{}" target="_blank" style="color: #007bff;">📋 View Processor Profile: {}</a>',
                    url,
                    profile.company_name
                )
            except ProcessorProfile.DoesNotExist:
                return format_html('<span style="color: #dc3545;">Profile not found</span>')
        
        elif obj.owner_type == 'RETAILER':
            from users.models import RetailerProfile
            try:
                profile = RetailerProfile.objects.get(id=obj.owner_id)
                url = reverse('admin:users_retailerprofile_change', args=[profile.pk])
                return format_html(
                    '<a href="{}" target="_blank" style="color: #007bff;">📋 View Retailer Profile: {}</a>',
                    url,
                    profile.business_name
                )
            except RetailerProfile.DoesNotExist:
                return format_html('<span style="color: #dc3545;">Profile not found</span>')
        
        elif obj.owner_type == 'LOGISTICS':
            from users.models import LogisticsProfile
            try:
                profile = LogisticsProfile.objects.get(id=obj.owner_id)
                url = reverse('admin:users_logisticsprofile_change', args=[profile.pk])
                return format_html(
                    '<a href="{}" target="_blank" style="color: #007bff;">📋 View Logistics Profile: {}</a>',
                    url,
                    profile.company_name
                )
            except LogisticsProfile.DoesNotExist:
                return format_html('<span style="color: #dc3545;">Profile not found</span>')
        
        return '-'
    owner_details_link.short_description = 'Owner Details'
    
    def map_link(self, obj):
        """Google Maps link if coordinates available"""
        if obj.latitude and obj.longitude:
            maps_url = f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
            return format_html(
                '<a href="{}" target="_blank" style="color: #007bff;">🗺 View on Google Maps</a><br/>'
                '<small style="color: #6c757d;">Lat: {} | Lng: {}</small>',
                maps_url,
                obj.latitude,
                obj.longitude
            )
        return format_html('<span style="color: #6c757d;">Coordinates not available</span>')
    map_link.short_description = 'Map Location'
    
    def capacity_stats(self, obj):
        """Detailed capacity statistics"""
        return format_html(
            '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
            '<table style="width: 100%;">'
            '<tr><td><strong>Total Capacity:</strong></td><td style="text-align: right;">{:,.2f} MT</td></tr>'
            '<tr><td><strong>Current Occupancy:</strong></td><td style="text-align: right;">{:,.2f} MT</td></tr>'
            '<tr><td><strong>Available Space:</strong></td><td style="text-align: right; color: #28a745;">{:,.2f} MT</td></tr>'
            '<tr><td><strong>Utilization:</strong></td><td style="text-align: right; color: #007bff;">{:.1f}%</td></tr>'
            '</table>'
            '</div>',
            obj.total_capacity,
            obj.current_occupancy,
            obj.available_capacity,
            obj.occupancy_percentage
        )
    capacity_stats.short_description = 'Capacity Statistics'
    
    def occupancy_chart(self, obj):
        """Visual occupancy chart"""
        utilization = obj.occupancy_percentage
        available = 100 - utilization
        
        return format_html(
            '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
            '<h4 style="margin: 0 0 10px 0;">Occupancy Breakdown</h4>'
            '<div style="display: flex; height: 30px; border-radius: 5px; overflow: hidden;">'
            '<div style="background: #007bff; width: {:.1f}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">'
            'Occupied {:.1f}%'
            '</div>'
            '<div style="background: #28a745; width: {:.1f}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">'
            'Available {:.1f}%'
            '</div>'
            '</div>'
            '</div>',
            utilization,
            utilization,
            available,
            available
        )
    occupancy_chart.short_description = 'Occupancy Chart'
    
    def facilities_summary(self, obj):
        """Summary of all facilities"""
        return format_html(
            '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">'
            '<table style="width: 100%;">'
            '<tr><td>⚖ Weighbridge:</td><td>{}</td></tr>'
            '<tr><td>✓ Quality Testing Lab:</td><td>{}</td></tr>'
            '<tr><td>🛡 Security:</td><td>{}</td></tr>'
            '</table>'
            '</div>',
            '✅ Available' if obj.has_weighbridge else '❌ Not Available',
            '✅ Available' if obj.has_quality_testing else '❌ Not Available',
            '✅ Available' if obj.has_security else '❌ Not Available'
        )
    facilities_summary.short_description = 'Facilities Summary'
    
    # Admin Actions
    @admin.action(description='🔴 Mark selected warehouses as FULL')
    def mark_full(self, request, queryset):
        """Mark warehouses as full capacity"""
        count = 0
        for warehouse in queryset:
            warehouse.current_occupancy = warehouse.total_capacity
            warehouse.save()
            count += 1
        self.message_user(request, f'{count} warehouse(s) marked as full.')
    
    @admin.action(description='🟢 Mark selected warehouses as EMPTY')
    def mark_empty(self, request, queryset):
        """Empty selected warehouses"""
        updated = queryset.update(current_occupancy=0)
        self.message_user(request, f'{updated} warehouse(s) marked as empty.')
    
    @admin.action(description='✅ Enable all facilities for selected warehouses')
    def enable_all_facilities(self, request, queryset):
        """Enable all facilities"""
        updated = queryset.update(
            has_weighbridge=True,
            has_quality_testing=True,
            has_security=True
        )
        self.message_user(request, f'All facilities enabled for {updated} warehouse(s).')
    
    @admin.action(description='📊 Export Warehouse Report (CSV)')
    def export_warehouse_report(self, request, queryset):
        """Export selected warehouses to CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="warehouse_report.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Warehouse Name', 'Owner Type', 'Location', 
            'Warehouse Type', 'Storage Type', 'Total Capacity (MT)',
            'Current Occupancy (MT)', 'Available (MT)', 'Utilization (%)',
            'Weighbridge', 'Quality Testing', 'Security'
        ])
        
        for warehouse in queryset:
            writer.writerow([
                warehouse.id,
                warehouse.warehouse_name,
                warehouse.owner_type,
                f"{warehouse.district}, {warehouse.state}",
                warehouse.get_warehouse_type_display(),
                warehouse.get_storage_type_display(),
                warehouse.total_capacity,
                warehouse.current_occupancy,
                warehouse.available_capacity,
                f"{warehouse.occupancy_percentage:.2f}",
                'Yes' if warehouse.has_weighbridge else 'No',
                'Yes' if warehouse.has_quality_testing else 'No',
                'Yes' if warehouse.has_security else 'No',
            ])
        
        return response
    
    @admin.action(description='📈 Calculate Total Capacity Summary')
    def calculate_total_capacity(self, request, queryset):
        """Calculate and display total capacity statistics"""
        stats = queryset.aggregate(
            total_capacity=Sum('total_capacity'),
            total_occupied=Sum('current_occupancy'),
            warehouse_count=Count('id')
        )
        
        total_capacity = stats['total_capacity'] or 0
        total_occupied = stats['total_occupied'] or 0
        total_available = total_capacity - total_occupied
        overall_utilization = (total_occupied / total_capacity * 100) if total_capacity > 0 else 0
        
        message = (
            f"📊 Warehouse Summary:\n"
            f"Total Warehouses: {stats['warehouse_count']}\n"
            f"Total Capacity: {total_capacity:,.2f} MT\n"
            f"Total Occupied: {total_occupied:,.2f} MT\n"
            f"Total Available: {total_available:,.2f} MT\n"
            f"Overall Utilization: {overall_utilization:.2f}%"
        )
        
        self.message_user(request, message)
    
    # Custom Changelist View
    def changelist_view(self, request, extra_context=None):
        """Add summary statistics to changelist"""
        response = super().changelist_view(request, extra_context)
        
        try:
            qs = response.context_data['cl'].queryset
            
            # Calculate summary stats
            summary_stats = qs.aggregate(
                total_warehouses=Count('id'),
                total_capacity=Sum('total_capacity'),
                total_occupied=Sum('current_occupancy'),
                avg_utilization=Sum('current_occupancy') / Sum('total_capacity') * 100 if Sum('total_capacity') else 0
            )
            
            # Count by type
            by_owner = qs.values('owner_type').annotate(count=Count('id'))
            by_warehouse_type = qs.values('warehouse_type').annotate(count=Count('id'))
            by_storage_type = qs.values('storage_type').annotate(count=Count('id'))
            
            extra_context = extra_context or {}
            extra_context['summary_stats'] = summary_stats
            extra_context['by_owner'] = by_owner
            extra_context['by_warehouse_type'] = by_warehouse_type
            extra_context['by_storage_type'] = by_storage_type
            
            response.context_data.update(extra_context)
        except (AttributeError, KeyError):
            pass
        
        return response


# ============================================================================
# VEHICLE ADMIN (Bonus)
# ============================================================================

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Vehicle Management Admin"""
    
    list_display = [
        'vehicle_number_display',
        'owner_badge',
        'vehicle_type_badge',
        'capacity_display',
        'driver_info',
        'insurance_status',
        'fitness_status',
        'status_badge'
    ]
    
    list_filter = [
        'owner_type',
        'vehicle_type',
        'is_active',
        'has_gps',
    ]
    
    search_fields = ['vehicle_number', 'driver_name', 'driver_phone']
    
    fieldsets = (
        ('Ownership', {
            'fields': (('owner_type', 'owner_id'),)
        }),
        ('Vehicle Details', {
            'fields': (
                'vehicle_number',
                ('vehicle_type', 'capacity'),
                ('model', 'year_of_manufacture'),
                ('has_gps', 'is_active')
            )
        }),
        ('Driver Information', {
            'fields': (
                'driver_name',
                ('driver_phone', 'driver_license')
            )
        }),
        ('Compliance Documents', {
            'fields': (
                ('insurance_valid_till', 'insurance_document'),
                ('fitness_valid_till', 'fitness_certificate'),
                'puc_certificate'
            )
        }),
    )
    
    def vehicle_number_display(self, obj):
        return format_html(
            '<span style="font-family: monospace; background: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">🚛 {}</span>',
            obj.vehicle_number
        )
    vehicle_number_display.short_description = 'Vehicle Number'
    
    def owner_badge(self, obj):
        colors = {
            'FPO': '#17a2b8',
            'PROCESSOR': '#ffc107',
            'LOGISTICS': '#6f42c1',
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            colors.get(obj.owner_type, '#6c757d'),
            obj.owner_type
        )
    owner_badge.short_description = 'Owner'
    
    def vehicle_type_badge(self, obj):
        icons = {
            'SMALL_TRUCK': '🚐',
            'MEDIUM_TRUCK': '🚚',
            'LARGE_TRUCK': '🚛',
            'TANKER': '🛢',
            'REFRIGERATED': '❄🚛',
        }
        return format_html(
            '{} {}',
            icons.get(obj.vehicle_type, '🚗'),
            obj.get_vehicle_type_display()
        )
    vehicle_type_badge.short_description = 'Type'
    
    def capacity_display(self, obj):
        return format_html('{:,.2f} MT', obj.capacity)
    capacity_display.short_description = 'Capacity'
    
    def driver_info(self, obj):
        return format_html(
            '<strong>{}</strong><br/><small>📱 {}</small>',
            obj.driver_name or 'Not Assigned',
            obj.driver_phone or '-'
        )
    driver_info.short_description = 'Driver'
    
    def insurance_status(self, obj):
        if obj.insurance_valid_till:
            from django.utils import timezone
            if obj.insurance_valid_till > timezone.now().date():
                days_left = (obj.insurance_valid_till - timezone.now().date()).days
                color = 'green' if days_left > 30 else 'orange'
                return format_html(
                    '<span style="color: {};">✓ Valid till {}<br/>{} days left</span>',
                    color,
                    obj.insurance_valid_till.strftime('%Y-%m-%d'),
                    days_left
                )
            return format_html('<span style="color: red;">✗ Expired</span>')
        return '-'
    insurance_status.short_description = 'Insurance'
    
    def fitness_status(self, obj):
        if obj.fitness_valid_till:
            from django.utils import timezone
            if obj.fitness_valid_till > timezone.now().date():
                days_left = (obj.fitness_valid_till - timezone.now().date()).days
                color = 'green' if days_left > 30 else 'orange'
                return format_html(
                    '<span style="color: {};">✓ Valid till {}<br/>{} days left</span>',
                    color,
                    obj.fitness_valid_till.strftime('%Y-%m-%d'),
                    days_left
                )
            return format_html('<span style="color: red;">✗ Expired</span>')
        return '-'
    fitness_status.short_description = 'Fitness'
    
    def status_badge(self, obj):
        if obj.is_active:
            icon = '🟢'
            status = 'Active'
            color = '#28a745'
        else:
            icon = '🔴'
            status = 'Inactive'
            color = '#dc3545'
        
        gps = '📡 GPS' if obj.has_gps else ''
        
        return format_html(
            '<div style="text-align: center;">'
            '<span style="font-size: 16px;">{}</span><br/>'
            '<small style="color: {}; font-weight: bold;">{}</small><br/>'
            '<small>{}</small>'
            '</div>',
            icon,
            color,
            status,
            gps
        )
    status_badge.short_description = 'Status'

@admin.register(WarehouseSensorData)
class WarehouseSensorDataAdmin(admin.ModelAdmin):
    """Sensor Data Monitoring"""
    
    list_display = [
        'warehouse', 'created_at', 'temperature', 
        'humidity', 'alert_status'
    ]
    list_filter = [
        'is_temperature_alert', 'is_humidity_alert', 
        'is_pest_detected', 'created_at'
    ]
    search_fields = ['warehouse__warehouse_id', 'warehouse__name']
    date_hierarchy = 'created_at'
    
    def alert_status(self, obj):
        alerts = []
        if obj.is_temperature_alert:
            alerts.append('🌡️ Temp')
        if obj.is_humidity_alert:
            alerts.append('💧 Humidity')
        if obj.is_pest_detected:
            alerts.append('🐛 Pest')
        
        if alerts:
            return format_html(
                '<span style="color: red;">{}</span>',
                ' | '.join(alerts)
            )
        return format_html('<span style="color: green;">✓ Normal</span>')
    alert_status.short_description = 'Alerts'


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    """Shipment Tracking"""
    
    list_display = [
        'shipment_id', 'get_crop', 'logistics_partner', 
        'status_badge', 'route_info', 'delivery_performance', 
        'freight_charges'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['shipment_id', 'vehicle_number', 'driver_name']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Shipment Info', {
            'fields': ('shipment_id', 'order', 'logistics_partner', 'status')
        }),
        ('Origin', {
            'fields': (
                'origin_address',
                ('origin_lat', 'origin_lng')
            )
        }),
        ('Destination', {
            'fields': (
                'destination_address',
                ('destination_lat', 'destination_lng')
            )
        }),
        ('Vehicle', {
            'fields': ('vehicle_number', 'driver_name', 'driver_phone')
        }),
        ('Schedule', {
            'fields': (
                ('scheduled_pickup', 'actual_pickup'),
                ('scheduled_delivery', 'actual_delivery')
            )
        }),
        ('Costs', {
            'fields': ('estimated_distance', 'freight_charges')
        }),
        ('Proof of Delivery', {
            'fields': ('pod_signature', 'pod_photo'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['shipment_id']
    
    def get_crop(self, obj):
        return obj.order.listing.crop_type.name
    get_crop.short_description = 'Crop'
    
    def status_badge(self, obj):
        colors = {
            'ASSIGNED': '#6c757d',
            'PICKED_UP': '#17a2b8',
            'IN_TRANSIT': '#007bff',
            'DELIVERED': '#28a745',
            'CANCELLED': '#dc3545'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            colors.get(obj.status, '#6c757d'), obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def route_info(self, obj):
        if obj.estimated_distance:
            return f"{obj.estimated_distance} km"
        return '-'
    route_info.short_description = 'Distance'
    
    def delivery_performance(self, obj):
        if obj.actual_delivery and obj.scheduled_delivery:
            delay = (obj.actual_delivery.date() - obj.scheduled_delivery.date()).days
            if delay <= 0:
                return format_html('<span style="color: green;">✓ On Time</span>')
            else:
                return format_html(
                    '<span style="color: red;">⚠ {} days late</span>',
                    delay
                )
        return '-'
    delivery_performance.short_description = 'Performance'


@admin.register(GPSTrackingLog)
class GPSTrackingLogAdmin(admin.ModelAdmin):
    """GPS Tracking Logs"""
    
    list_display = [
        'shipment', 'created_at', 'coordinates', 
        'speed', 'movement_status'
    ]
    list_filter = ['is_moving', 'created_at']
    search_fields = ['shipment__shipment_id']
    date_hierarchy = 'created_at'
    
    def coordinates(self, obj):
        return f"{obj.latitude}, {obj.longitude}"
    
    def movement_status(self, obj):
        if obj.is_moving:
            return format_html('<span style="color: green;">● Moving</span>')
        return format_html('<span style="color: gray;">○ Stationary</span>')
    movement_status.short_description = 'Status'


@admin.register(RouteOptimization)
class RouteOptimizationAdmin(admin.ModelAdmin):
    """AI Route Optimization"""
    
    list_display = [
        'get_route', 'distance', 'estimated_time', 
        'estimated_fuel_cost', 'confidence_score', 'created_at'
    ]
    list_filter = ['created_at']
    
    def get_route(self, obj):
        origin = f"{obj.origin.get('lat', 'N/A')}, {obj.origin.get('lng', 'N/A')}"
        dest = f"{obj.destination.get('lat', 'N/A')}, {obj.destination.get('lng', 'N/A')}"
        return f"{origin} → {dest}"
    get_route.short_description = 'Route'
    
    
    