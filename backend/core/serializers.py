from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'farmer'):
            return obj.farmer.user == request.user
        
        return False


class IsFarmer(permissions.BasePermission):
    """Allow only farmers"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'FARMER'


class IsFPO(permissions.BasePermission):
    """Allow only FPOs"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'FPO'


class IsProcessor(permissions.BasePermission):
    """Allow only processors"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'PROCESSOR'


class IsLogisticsPartner(permissions.BasePermission):
    """Allow only logistics partners"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LOGISTICS'


class IsPolicyMaker(permissions.BasePermission):
    """Allow only policy makers"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'POLICY'


class IsVerifiedUser(permissions.BasePermission):
    """Allow only verified users"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified 
    
    
    
    
    