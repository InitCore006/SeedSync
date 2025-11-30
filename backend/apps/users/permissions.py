from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission: Owner or Admin can access
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role == 'admin':
            return True
        
        # Owner can access their own object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return obj == request.user


class IsAdmin(permissions.BasePermission):
    """
    Custom permission: Only admins
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsKYCVerifier(permissions.BasePermission):
    """
    Custom permission: Admin or Government Official can verify KYC
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'govt_official']


class IsFPOAdmin(permissions.BasePermission):
    """
    Custom permission: FPO Admin
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'fpo_admin'


class IsGovernmentOfficial(permissions.BasePermission):
    """
    Custom permission: Government Official
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'govt_official'