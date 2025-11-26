from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from django.utils import timezone
from .models import (
    User, 
    FarmerProfile, 
    FPOProfile, 
    ProcessorProfile,
    RetailerProfile, 
    LogisticsProfile, 
    GovernmentProfile
)



# ============================================================================
# CUSTOM FILTERS
# ============================================================================

class ApprovalStatusFilter(admin.SimpleListFilter):
    """Filter by approval status"""
    title = 'Approval Status'
    parameter_name = 'approval_status'
    
    def lookups(self, request, model_admin):
        return User.APPROVAL_STATUS
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(approval_status=self.value())
        return queryset


class RoleFilter(admin.SimpleListFilter):
    """Filter by user role"""
    title = 'User Role'
    parameter_name = 'role'
    
    def lookups(self, request, model_admin):
        return User.ROLE_CHOICES
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(role=self.value())
        return queryset


class VerificationStatusFilter(admin.SimpleListFilter):
    """Filter by verification status"""
    title = 'Verification Status'
    parameter_name = 'verified'
    
    def lookups(self, request, model_admin):
        return (
            ('both', 'Phone & Email Verified'),
            ('phone', 'Phone Verified Only'),
            ('email', 'Email Verified Only'),
            ('none', 'Not Verified'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'both':
            return queryset.filter(phone_verified=True, email_verified=True)
        elif self.value() == 'phone':
            return queryset.filter(phone_verified=True, email_verified=False)
        elif self.value() == 'email':
            return queryset.filter(phone_verified=False, email_verified=True)
        elif self.value() == 'none':
            return queryset.filter(phone_verified=False, email_verified=False)
        return queryset


class StateFilter(admin.SimpleListFilter):
    """Dynamic state filter for farmers"""
    title = 'State'
    parameter_name = 'state'
    
    def lookups(self, request, model_admin):
        # Get unique states from farmer profiles
        states = FarmerProfile.objects.values_list('state', flat=True).distinct()
        return sorted([(s, s) for s in states if s])
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(farmer_profile__state=self.value())
        return queryset


class ProfileCompletionFilter(admin.SimpleListFilter):
    """Filter by profile completion status"""
    title = 'Profile Completion'
    parameter_name = 'profile_complete'
    
    def lookups(self, request, model_admin):
        return (
            ('complete', 'Complete (80%+)'),
            ('incomplete', 'Incomplete (<80%)'),
            ('no_profile', 'No Profile Created'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'complete':
            return queryset.filter(farmer_profile__profile_completed=True)
        elif self.value() == 'incomplete':
            return queryset.filter(
                farmer_profile__profile_completed=False,
                farmer_profile__isnull=False
            )
        elif self.value() == 'no_profile':
            return queryset.filter(farmer_profile__isnull=True)
        return queryset



# ============================================================================
# INLINE ADMINS
# ============================================================================

class FarmerProfileInline(admin.StackedInline):
    """Farmer Profile Inline for User Admin"""
    
    model = FarmerProfile
    can_delete = False
    verbose_name_plural = 'Farmer Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Farmer ID', {
            'fields': ('farmer_id',)
        }),
        ('Personal Information', {
            'fields': (
                'father_husband_name',
                ('date_of_birth', 'gender')
            )
        }),
        ('Location Details', {
            'fields': (
                'village',
                ('district', 'state'),
                'pincode',
                ('latitude', 'longitude')
            )
        }),
        ('Farm Details', {
            'fields': (
                'total_land_area',
                'primary_crops',
                'expected_annual_production'
            )
        }),
        ('Banking Information', {
            'fields': (
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'account_holder_name',
                'upi_id'
            )
        }),
        ('Verification Status', {
            'fields': (
                ('aadhaar_verified', 'land_records_uploaded')
            )
        }),
        ('Performance Metrics', {
            'fields': (
                ('total_transactions', 'total_revenue'),
                ('performance_rating', 'total_ratings'),
                'credit_score'
            ),
            'classes': ('collapse',)
        }),
        ('Profile Status', {
            'fields': (
                ('profile_completed', 'profile_completion_percentage'),
                'is_active_seller'
            ),
            'classes': ('collapse',)
        }),
        ('Activity Tracking', {
            'fields': (
                'last_lot_created_at',
                'last_transaction_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = (
        'farmer_id',
        'total_transactions',
        'total_revenue',
        'performance_rating',
        'total_ratings',
        'credit_score',
        'profile_completed',
        'profile_completion_percentage',
        'last_lot_created_at',
        'last_transaction_at'
    )


class FPOProfileInline(admin.StackedInline):
    model = FPOProfile
    can_delete = False
    verbose_name_plural = 'FPO Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Organization Details', {
            'fields': (
                'organization_name', 
                ('registration_type', 'registration_number'),
                ('year_of_registration', 'total_members'),
                ('contact_person_name', 'contact_person_designation')
            )
        }),
        ('Location & Coverage', {
            'fields': (
                'office_address',
                ('state', 'district', 'block', 'pincode'),
                ('latitude', 'longitude'),
                'operational_villages',
                ('total_land_coverage', 'primary_oilseeds')
            )
        }),
        ('Infrastructure', {
            'fields': (
                ('has_storage', 'has_transport', 'uses_logistics_partners'),
                'average_annual_procurement'
            )
        }),
        ('Verification & Banking', {
            'fields': (
                ('registration_certificate', 'gstin'),
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'cancelled_cheque'
            )
        }),
        ('Performance Metrics', {
            'fields': ('total_lots_created', 'total_sales_volume', 'total_revenue'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('total_lots_created', 'total_sales_volume', 'total_revenue')


class ProcessorProfileInline(admin.StackedInline):
    model = ProcessorProfile
    can_delete = False
    verbose_name_plural = 'Processor Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Company Details', {
            'fields': (
                'company_name',
                ('processor_type', 'gstin'),
                ('cin_number', 'year_of_establishment'),
                ('contact_person_name', 'contact_person_designation')
            )
        }),
        ('Plant Location & Capacity', {
            'fields': (
                'plant_address',
                ('state', 'district', 'pincode'),
                ('latitude', 'longitude'),
                ('daily_crushing_capacity', 'annual_capacity'),
                'seeds_processed',
                'operational_status'
            )
        }),
        ('Storage & Logistics', {
            'fields': (
                ('raw_material_storage', 'finished_oil_storage'),
                ('has_own_warehouse', 'has_own_fleet', 'uses_third_party_logistics'),
                ('fleet_size', 'preferred_sourcing_radius')
            )
        }),
        ('Licenses & Compliance', {
            'fields': (
                ('fssai_license', 'fssai_expiry'),
                'fssai_certificate',
                ('factory_registration', 'factory_certificate'),
                ('pcb_clearance', 'pcb_certificate'),
                ('has_iso_9001', 'has_haccp', 'has_bis'),
                'quality_certificates'
            )
        }),
        ('Banking', {
            'fields': (
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'cancelled_cheque'
            )
        }),
        ('Market Preferences', {
            'fields': (
                'procurement_methods',
                'expected_monthly_procurement',
                'interested_in_contract_farming'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'current_utilization',
                'total_procurement_volume',
                'total_production_volume',
                'average_rating'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('annual_capacity', 'total_procurement_volume', 'total_production_volume')


class RetailerProfileInline(admin.StackedInline):
    model = RetailerProfile
    can_delete = False
    verbose_name_plural = 'Retailer Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Business Details', {
            'fields': (
                'business_name',
                ('business_type', 'gstin'),
                'trade_license',
                ('contact_person_name', 'contact_person_designation')
            )
        }),
        ('Operational Details', {
            'fields': (
                'number_of_outlets',
                'main_office_address',
                ('state', 'city', 'pincode'),
                'monthly_oil_sales_volume',
                'oil_types_sold',
                ('has_warehouse', 'storage_capacity', 'warehouse_location'),
                'procurement_frequency'
            )
        }),
        ('Preferences', {
            'fields': (
                'sourcing_preferences',
                'packaging_preference',
                ('fssai_license', 'fssai_certificate')
            )
        }),
        ('Banking', {
            'fields': (
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'cancelled_cheque'
            )
        }),
        ('Performance Metrics', {
            'fields': ('total_purchase_volume', 'total_orders', 'average_order_value'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('total_purchase_volume', 'total_orders', 'average_order_value')


class LogisticsProfileInline(admin.StackedInline):
    model = LogisticsProfile
    can_delete = False
    verbose_name_plural = 'Logistics Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Company Details', {
            'fields': (
                'company_name',
                ('service_type', 'gstin'),
                'contact_person_name'
            )
        }),
        ('Fleet & Infrastructure', {
            'fields': (
                ('fleet_small_trucks', 'fleet_medium_trucks', 'fleet_large_trucks'),
                ('fleet_tankers', 'fleet_refrigerated'),
                'has_gps_tracking',
                'coverage_states'
            )
        }),
        ('Compliance', {
            'fields': (
                ('transport_license', 'transport_certificate'),
                ('warehouse_license', 'warehouse_certificate'),
                'insurance_certificate'
            )
        }),
        ('Banking', {
            'fields': (
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'cancelled_cheque'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'average_rating',
                'completed_deliveries',
                'total_distance_covered',
                'on_time_delivery_rate'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('completed_deliveries', 'total_distance_covered')


class GovernmentProfileInline(admin.StackedInline):
    model = GovernmentProfile
    can_delete = False
    verbose_name_plural = 'Government Profile'
    fk_name = 'user'
    
    fieldsets = (
        ('Official Details', {
            'fields': (
                ('employee_id', 'designation'),
                'department'
            )
        }),
        ('Jurisdiction', {
            'fields': (
                ('state', 'district', 'block'),
            )
        }),
        ('Permissions', {
            'fields': (
                ('can_approve_fpo', 'can_approve_processor'),
                ('can_approve_retailer', 'can_approve_logistics'),
                ('can_view_analytics', 'can_export_reports')
            )
        }),
        ('Activity Tracking', {
            'fields': (
                ('total_approvals', 'total_rejections'),
                'last_active'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('total_approvals', 'total_rejections', 'last_active')




# ============================================================================
# USER ADMIN
# ============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User Admin with role-based inlines"""
    
    # List Display
    list_display = (
        'username',
        'phone_display',
        'email_display',
        'role_badge',
        'approval_badge',
        'verification_status',
        'login_stats',
        'date_joined_display',
        'action_buttons'
    )
    
    list_filter = (
        RoleFilter,
        ApprovalStatusFilter,
        VerificationStatusFilter,
        ProfileCompletionFilter,
        StateFilter,
        'is_active',
        'is_staff',
        'date_joined',
    )
    
    search_fields = (
        'username',
        'email',
        'phone_number',
        'first_name',
        'last_name',
        'farmer_profile__farmer_id',
        'farmer_profile__village',
        'farmer_profile__district',
    )
    
    ordering = ('-date_joined',)
    
    # Fieldsets for User details
    fieldsets = (
        ('Login Credentials', {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': (
                ('first_name', 'last_name'),
                'phone_number',
                'email'
            )
        }),
        ('Role & Status', {
            'fields': (
                'role',
                ('approval_status', 'approved_by', 'approved_at'),
                'rejection_reason'
            )
        }),
        ('Verification', {
            'fields': (('phone_verified', 'email_verified'),)
        }),
        ('Preferences', {
            'fields': (('preferred_language', 'profile_picture'),)
        }),
        ('Permissions', {
            'fields': (
                ('is_active', 'is_staff', 'is_superuser'),
                'groups',
                'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        ('Session Information', {
            'fields': (('last_login', 'last_login_ip', 'login_count'),),
            'classes': ('collapse',)
        }),
    )
    
    # Add fieldsets
    add_fieldsets = (
        ('Login Credentials', {
            'fields': ('username', 'password1', 'password2')
        }),
        ('Personal Information', {
            'fields': (
                ('first_name', 'last_name'),
                'phone_number',
                'email'
            )
        }),
        ('Role', {
            'fields': ('role',),
            'description': 'Select user role. Farmers are auto-approved.'
        }),
        ('Language', {
            'fields': ('preferred_language',)
        }),
    )
    
    readonly_fields = (
        'last_login',
        'date_joined',
        'last_login_ip',
        'login_count',
        'approved_at',
        'approved_by'
    )
    
    # Actions
    actions = [
        'approve_users',
        'reject_users',
        'suspend_users',
        'verify_phone',
        'verify_email',
        'export_to_csv'
    ]
    
    # Inlines based on role
    inlines = []
    
    def get_inline_instances(self, request, obj=None):
        """Show role-specific inline only"""
        if obj:
            if obj.role == 'FARMER':
                self.inlines = [FarmerProfileInline]
            else:
                self.inlines = []
                # TODO: Add other profile inlines when implemented
                # elif obj.role == 'FPO':
                #     self.inlines = [FPOProfileInline]
                # elif obj.role == 'PROCESSOR':
                #     self.inlines = [ProcessorProfileInline]
        else:
            self.inlines = []
        
        return super().get_inline_instances(request, obj)
    
    # Custom Display Methods
    def phone_display(self, obj):
        """Phone with verification badge"""
        verified = '✓' if obj.phone_verified else '✗'
        color = 'green' if obj.phone_verified else 'red'
        return format_html(
            '{} <span style="color: {};">{}</span>',
            obj.phone_number,
            color,
            verified
        )
    phone_display.short_description = 'Phone Number'
    
    def email_display(self, obj):
        """Email with verification badge (optional for farmers)"""
        if not obj.email:
            return format_html('<span style="color: gray;">Not provided</span>')
        
        verified = '✓' if obj.email_verified else '✗'
        color = 'green' if obj.email_verified else 'red'
        return format_html(
            '{} <span style="color: {};">{}</span>',
            obj.email,
            color,
            verified
        )
    email_display.short_description = 'Email'
    
    def role_badge(self, obj):
        """Colored role badge"""
        colors = {
            'FARMER': '#28a745',
            'FPO': '#17a2b8',
            'PROCESSOR': '#ffc107',
            'RETAILER': '#fd7e14',
            'LOGISTICS': '#6f42c1',
            'WAREHOUSE': '#20c997',
            'GOVERNMENT': '#007bff',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.role, '#6c757d'),
            obj.get_role_display()
        )
    role_badge.short_description = 'Role'
    
    def approval_badge(self, obj):
        """Colored approval status badge"""
        colors = {
            'PENDING': '#ffc107',
            'APPROVED': '#28a745',
            'REJECTED': '#dc3545',
            'SUSPENDED': '#6c757d',
        }
        icons = {
            'PENDING': '⏳',
            'APPROVED': '✓',
            'REJECTED': '✗',
            'SUSPENDED': '⏸',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{} {}</span>',
            colors.get(obj.approval_status, '#6c757d'),
            icons.get(obj.approval_status, ''),
            obj.get_approval_status_display()
        )
    approval_badge.short_description = 'Status'
    
    def verification_status(self, obj):
        """Verification status with icons"""
        phone = '📱✓' if obj.phone_verified else '📱✗'
        email = '📧✓' if obj.email_verified else '📧✗' if obj.email else '📧-'
        return format_html('{} {}', phone, email)
    verification_status.short_description = 'Verified'
    
    def login_stats(self, obj):
        """Login statistics"""
        last_login = obj.last_login.strftime('%Y-%m-%d') if obj.last_login else 'Never'
        return format_html(
            '<small>Count: {}<br/>Last: {}</small>',
            obj.login_count,
            last_login
        )
    login_stats.short_description = 'Login Stats'
    
    def date_joined_display(self, obj):
        """Formatted join date"""
        return obj.date_joined.strftime('%Y-%m-%d %H:%M')
    date_joined_display.short_description = 'Joined'
    date_joined_display.admin_order_field = 'date_joined'
    
    def action_buttons(self, obj):
        """Quick action buttons"""
        # Farmers and Government are auto-approved
        if obj.role in ['FARMER', 'GOVERNMENT']:
            return format_html('<span style="color: green;">✓ Auto-Approved</span>')
        
        if obj.approval_status == 'PENDING':
            approve_url = reverse('admin:users_user_changelist')
            return format_html(
                '<a class="button" href="{}?action=approve_users&_selected_action={}">Approve</a> '
                '<a class="button" href="{}?action=reject_users&_selected_action={}">Reject</a>',
                approve_url, obj.pk,
                approve_url, obj.pk
            )
        elif obj.approval_status == 'APPROVED':
            return format_html('<span style="color: green;">✓ Active</span>')
        elif obj.approval_status == 'REJECTED':
            return format_html('<span style="color: red;">✗ Rejected</span>')
        elif obj.approval_status == 'SUSPENDED':
            return format_html('<span style="color: gray;">⏸ Suspended</span>')
        return '-'
    action_buttons.short_description = 'Actions'
    
    # Admin Actions
    @admin.action(description='✓ Approve selected users')
    def approve_users(self, request, queryset):
        """Approve selected pending users (excludes farmers/government)"""
        queryset = queryset.filter(
            approval_status='PENDING'
        ).exclude(role__in=['FARMER', 'GOVERNMENT'])
        
        updated = queryset.update(
            approval_status='APPROVED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} user(s) approved successfully.')
    
    @admin.action(description='✗ Reject selected users')
    def reject_users(self, request, queryset):
        """Reject selected pending users (excludes farmers/government)"""
        queryset = queryset.filter(
            approval_status='PENDING'
        ).exclude(role__in=['FARMER', 'GOVERNMENT'])
        
        updated = queryset.update(
            approval_status='REJECTED',
            approved_by=request.user,
            approved_at=timezone.now(),
            rejection_reason='Rejected by admin from bulk action'
        )
        self.message_user(request, f'{updated} user(s) rejected.')
    
    @admin.action(description='⏸ Suspend selected users')
    def suspend_users(self, request, queryset):
        """Suspend selected users"""
        updated = queryset.update(
            approval_status='SUSPENDED',
            is_active=False
        )
        self.message_user(request, f'{updated} user(s) suspended.')
    
    @admin.action(description='📱 Verify phone numbers')
    def verify_phone(self, request, queryset):
        """Manually verify phone numbers"""
        updated = queryset.update(phone_verified=True)
        self.message_user(request, f'{updated} phone number(s) verified.')
    
    @admin.action(description='📧 Verify emails')
    def verify_email(self, request, queryset):
        """Manually verify emails"""
        updated = queryset.filter(email__isnull=False).exclude(email='').update(email_verified=True)
        self.message_user(request, f'{updated} email(s) verified.')
    
    @admin.action(description='📊 Export to CSV')
    def export_to_csv(self, request, queryset):
        """Export selected users to CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Username', 'Phone', 'Email', 'Role', 'Approval Status',
            'Phone Verified', 'Email Verified', 'Date Joined'
        ])
        
        for user in queryset:
            writer.writerow([
                user.username,
                user.phone_number,
                user.email or 'N/A',
                user.get_role_display(),
                user.get_approval_status_display(),
                'Yes' if user.phone_verified else 'No',
                'Yes' if user.email_verified else 'No',
                user.date_joined.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response




# ============================================================================
# FARMER PROFILE ADMIN
# ============================================================================

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    """Farmer Profile Admin - Dedicated view for farmer data"""
    
    list_display = (
        'farmer_id',
        'farmer_name',
        'phone_number',
        'location_display',
        'land_area',
        'profile_completion_badge',
        'credit_badge',
        'rating_display',
        'verification_status',
        'activity_status'
    )
    
    list_filter = (
        'state',
        'district',
        'profile_completed',
        'aadhaar_verified',
        'land_records_uploaded',
        'is_active_seller',
        'created_at'
    )
    
    search_fields = (
        'farmer_id',
        'user__first_name',
        'user__last_name',
        'user__phone_number',
        'village',
        'district',
        'state'
    )
    
    ordering = ('-created_at',)
    
    readonly_fields = (
        'farmer_id',
        'total_transactions',
        'total_revenue',
        'performance_rating',
        'total_ratings',
        'credit_score',
        'profile_completed',
        'profile_completion_percentage',
        'last_lot_created_at',
        'last_transaction_at',
        'created_at',
        'updated_at'
    )
    
    fieldsets = (
        ('User Link', {
            'fields': ('user',)
        }),
        ('Farmer Identification', {
            'fields': ('farmer_id',)
        }),
        ('Personal Information', {
            'fields': (
                'father_husband_name',
                ('date_of_birth', 'gender')
            )
        }),
        ('Location Details', {
            'fields': (
                'village',
                ('district', 'state'),
                'pincode',
                ('latitude', 'longitude')
            )
        }),
        ('Farm Details', {
            'fields': (
                'total_land_area',
                'primary_crops',
                'expected_annual_production'
            )
        }),
        ('Banking Information', {
            'fields': (
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'account_holder_name',
                'upi_id'
            )
        }),
        ('Verification & Documents', {
            'fields': (
                ('aadhaar_verified', 'land_records_uploaded')
            )
        }),
        ('Performance Metrics', {
            'fields': (
                ('total_transactions', 'total_revenue'),
                ('performance_rating', 'total_ratings'),
                'credit_score'
            )
        }),
        ('Profile Status', {
            'fields': (
                ('profile_completed', 'profile_completion_percentage'),
                'is_active_seller'
            )
        }),
        ('Activity Tracking', {
            'fields': (
                'last_lot_created_at',
                'last_transaction_at',
                ('created_at', 'updated_at')
            )
        }),
    )
    
    # Custom Display Methods
    def farmer_name(self, obj):
        """Display farmer's full name"""
        return obj.user.get_full_name() or obj.user.username
    farmer_name.short_description = 'Farmer Name'
    farmer_name.admin_order_field = 'user__first_name'
    
    def phone_number(self, obj):
        """Display phone number"""
        return obj.user.phone_number
    phone_number.short_description = 'Phone'
    
    def location_display(self, obj):
        """Display formatted location"""
        return obj.location_display
    location_display.short_description = 'Location'
    
    def land_area(self, obj):
        """Display land area with unit"""
        return f"{obj.total_land_area} acres"
    land_area.short_description = 'Land Area'
    land_area.admin_order_field = 'total_land_area'
    
    def profile_completion_badge(self, obj):
        """Show profile completion status with progress bar"""
        percentage = obj.profile_completion_percentage
        color = 'green' if percentage >= 80 else 'orange' if percentage >= 50 else 'red'
        
        return format_html(
            '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px;">'
            '<div style="width: {}%; background-color: {}; color: white; text-align: center; padding: 2px; border-radius: 3px;">{} %</div>'
            '</div>',
            percentage,
            color,
            percentage
        )
    profile_completion_badge.short_description = 'Profile %'
    profile_completion_badge.admin_order_field = 'profile_completion_percentage'
    
    def credit_badge(self, obj):
        """Display credit score with color coding"""
        score = obj.credit_score
        if score >= 700:
            color = '#28a745'  # Green - Excellent
        elif score >= 600:
            color = '#ffc107'  # Yellow - Good
        elif score >= 500:
            color = '#fd7e14'  # Orange - Fair
        else:
            color = '#dc3545'  # Red - Poor
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            score
        )
    credit_badge.short_description = 'Credit Score'
    credit_badge.admin_order_field = 'credit_score'
    
    def rating_display(self, obj):
        """Display star rating"""
        rating = obj.performance_rating
        full_stars = int(rating)
        half_star = 1 if (rating - full_stars) >= 0.5 else 0
        empty_stars = 5 - full_stars - half_star
        
        stars = '⭐' * full_stars
        if half_star:
            stars += '½'
        stars += '☆' * empty_stars
        
        return format_html(
            '{} <small>({:.1f}/5.0 from {} ratings)</small>',
            stars,
            rating,
            obj.total_ratings
        )
    rating_display.short_description = 'Rating'
    rating_display.admin_order_field = 'performance_rating'
    
    def verification_status(self, obj):
        """Show verification status"""
        aadhaar_icon = '✓' if obj.aadhaar_verified else '✗'
        aadhaar_color = 'green' if obj.aadhaar_verified else 'red'
        
        land_icon = '✓' if obj.land_records_uploaded else '✗'
        land_color = 'green' if obj.land_records_uploaded else 'red'
        
        return format_html(
            '<span style="color: {};">Aadhaar: {}</span><br/>'
            '<span style="color: {};">Land: {}</span>',
            aadhaar_color, aadhaar_icon,
            land_color, land_icon
        )
    verification_status.short_description = 'Verification'
    
    def activity_status(self, obj):
        """Show activity status"""
        if obj.is_active_seller:
            status = '<span style="color: green;">● Active</span>'
        else:
            status = '<span style="color: gray;">○ Inactive</span>'
        
        last_activity = obj.last_transaction_at or obj.last_lot_created_at
        if last_activity:
            days_ago = (timezone.now() - last_activity).days
            status += f'<br/><small>Last: {days_ago}d ago</small>'
        
        return format_html(status)
    activity_status.short_description = 'Activity'
    
    
    
# Replace the performance_display methods in ALL profile admins with simpler individual displays

@admin.register(FPOProfile)
class FPOProfileAdmin(admin.ModelAdmin):
    """FPO Profile Admin"""
    
    list_display = (
        'organization_name',
        'registration_number',
        'registration_type',
        'location_display',
        'members_count',
        'lots_created_display',
        'sales_volume_display',
        'revenue_display'
    )
    
    list_filter = ('registration_type', 'state', 'district', 'has_storage', 'has_transport')
    search_fields = ('organization_name', 'registration_number', 'contact_person_name', 'state', 'district')
    
    readonly_fields = ('total_lots_created', 'total_sales_volume', 'total_revenue', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User Link', {
            'fields': ('user',)
        }),
        ('Organization Details', {
            'fields': (
                'organization_name',
                ('registration_type', 'registration_number'),
                ('year_of_registration', 'total_members'),
                ('contact_person_name', 'contact_person_designation')
            )
        }),
        ('Location & Coverage', {
            'fields': (
                'office_address',
                ('state', 'district', 'block', 'pincode'),
                ('latitude', 'longitude'),
                'operational_villages',
                ('total_land_coverage', 'primary_oilseeds')
            )
        }),
        ('Infrastructure', {
            'fields': (
                ('has_storage', 'has_transport', 'uses_logistics_partners'),
                'average_annual_procurement'
            )
        }),
        ('Verification & Banking', {
            'fields': (
                ('registration_certificate', 'gstin'),
                ('bank_account_number', 'ifsc_code'),
                ('bank_name', 'branch_name'),
                'cancelled_cheque'
            )
        }),
        ('Performance Metrics', {
            'fields': ('total_lots_created', 'total_sales_volume', 'total_revenue'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def location_display(self, obj):
        return f"{obj.district}, {obj.state}"
    location_display.short_description = 'Location'
    
    def members_count(self, obj):
        count = obj.total_members if obj.total_members else 0
        return f"{count} members"
    members_count.short_description = 'Members'
    
    def lots_created_display(self, obj):
        return obj.total_lots_created if obj.total_lots_created else 0
    lots_created_display.short_description = 'Lots'
    lots_created_display.admin_order_field = 'total_lots_created'
    
    def sales_volume_display(self, obj):
        volume = obj.total_sales_volume if obj.total_sales_volume else 0
        return f"{volume} MT"
    sales_volume_display.short_description = 'Volume'
    sales_volume_display.admin_order_field = 'total_sales_volume'
    
    def revenue_display(self, obj):
        revenue = obj.total_revenue if obj.total_revenue else 0
        return f"₹{revenue}"
    revenue_display.short_description = 'Revenue'
    revenue_display.admin_order_field = 'total_revenue'

@admin.register(ProcessorProfile)
class ProcessorProfileAdmin(admin.ModelAdmin):
    """Processor Profile Admin"""
    
    list_display = (
        'company_name',
        'processor_type',
        'gstin',
        'location_display',
        'capacity_display',
        'utilization_badge',
        'rating_display'
    )
    
    list_filter = ('processor_type', 'state', 'operational_status', 'has_iso_9001', 'has_haccp', 'has_bis')
    search_fields = ('company_name', 'gstin', 'contact_person_name', 'state', 'district')
    
    readonly_fields = ('annual_capacity', 'total_procurement_volume', 'total_production_volume', 'created_at', 'updated_at')
    
    def location_display(self, obj):
        return f"{obj.district}, {obj.state}"
    location_display.short_description = 'Location'
    
    def capacity_display(self, obj):
        return format_html(
            'Daily: {} MT<br/>Annual: {} MT',
            obj.daily_crushing_capacity,
            obj.annual_capacity
        )
    capacity_display.short_description = 'Capacity'
    
    def utilization_badge(self, obj):
        color = 'green' if obj.current_utilization >= 75 else 'orange' if obj.current_utilization >= 50 else 'red'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}%</span>',
            color,
            obj.current_utilization
        )
    utilization_badge.short_description = 'Utilization'
    
    def rating_display(self, obj):
        stars = '⭐' * int(obj.average_rating)
        return format_html('{} ({})', stars, obj.average_rating)
    rating_display.short_description = 'Rating'


@admin.register(RetailerProfile)
class RetailerProfileAdmin(admin.ModelAdmin):
    """Retailer Profile Admin"""
    
    list_display = (
        'business_name',
        'business_type',
        'gstin',
        'location_display',
        'outlets_count',
        'performance_display'
    )
    
    list_filter = ('business_type', 'state', 'has_warehouse', 'procurement_frequency')
    search_fields = ('business_name', 'gstin', 'contact_person_name', 'state', 'city')
    
    readonly_fields = ('total_purchase_volume', 'total_orders', 'average_order_value', 'created_at', 'updated_at')
    
    def location_display(self, obj):
        return f"{obj.city}, {obj.state}"
    location_display.short_description = 'Location'
    
    def outlets_count(self, obj):
        return f"{obj.number_of_outlets} outlet(s)"
    outlets_count.short_description = 'Outlets'
    
    def performance_display(self, obj):
        return format_html(
            'Orders: {} | Volume: {:,.2f} MT',
            obj.total_orders,
            obj.total_purchase_volume
        )
    performance_display.short_description = 'Performance'


@admin.register(LogisticsProfile)
class LogisticsProfileAdmin(admin.ModelAdmin):
    """Logistics Profile Admin"""
    
    list_display = (
        'company_name',
        'service_type',
        'gstin',
        'fleet_display',
        'coverage_display',
        'performance_display'
    )
    
    list_filter = ('service_type', 'has_gps_tracking')
    search_fields = ('company_name', 'gstin', 'contact_person_name')
    
    readonly_fields = ('completed_deliveries', 'total_distance_covered', 'created_at', 'updated_at')
    
    def fleet_display(self, obj):
        return format_html(
            'Total: {} vehicles<br/>GPS: {}',
            obj.total_fleet_size,
            '✓' if obj.has_gps_tracking else '✗'
        )
    fleet_display.short_description = 'Fleet'
    
    def coverage_display(self, obj):
        states = ', '.join(obj.coverage_states[:3])
        if len(obj.coverage_states) > 3:
            states += '...'
        return states
    coverage_display.short_description = 'Coverage'
    
    def performance_display(self, obj):
        return format_html(
            'Deliveries: {} | On-time: {}%',
            obj.completed_deliveries,
            obj.on_time_delivery_rate
        )
    performance_display.short_description = 'Performance'


@admin.register(GovernmentProfile)
class GovernmentProfileAdmin(admin.ModelAdmin):
    """Government Profile Admin"""
    
    list_display = (
        'officer_name',
        'employee_id',
        'designation',
        'jurisdiction_display',
        'approval_stats'
    )
    
    list_filter = ('designation', 'state', 'district')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'state', 'district')
    
    readonly_fields = ('total_approvals', 'total_rejections', 'last_active', 'created_at', 'updated_at')
    
    def officer_name(self, obj):
        return obj.user.get_full_name()
    officer_name.short_description = 'Officer Name'
    
    def jurisdiction_display(self, obj):
        if obj.designation == 'NATIONAL':
            return 'National Level'
        elif obj.designation == 'STATE':
            return obj.state
        elif obj.designation == 'DISTRICT':
            return f"{obj.district}, {obj.state}"
        elif obj.designation == 'BLOCK':
            return f"{obj.block}, {obj.district}, {obj.state}"
        return '-'
    jurisdiction_display.short_description = 'Jurisdiction'
    
    def approval_stats(self, obj):
        total = obj.total_approvals + obj.total_rejections
        approval_rate = (obj.total_approvals / total * 100) if total > 0 else 0
        return format_html(
            'Approved: {} | Rejected: {}<br/>Rate: {:.1f}%',
            obj.total_approvals,
            obj.total_rejections,
            approval_rate
        )
    approval_stats.short_description = 'Approval Stats'


