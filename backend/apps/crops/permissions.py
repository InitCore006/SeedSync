from rest_framework import permissions


class IsFarmer(permissions.BasePermission):
    """Permission for farmers only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'farmer'


class IsFPOAdmin(permissions.BasePermission):
    """Permission for FPO admins only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'fpo_admin'


class IsProcessor(permissions.BasePermission):
    """Permission for processors only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'processor'


class IsRetailer(permissions.BasePermission):
    """Permission for retailers only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'retailer'


class IsAdmin(permissions.BasePermission):
    """Permission for admins only"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsFarmerOrFPOAdmin(permissions.BasePermission):
    """Permission for farmers or FPO admins"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['farmer', 'fpo_admin']