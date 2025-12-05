"""
Custom Permissions for SeedSync Platform
"""
from rest_framework import permissions
from apps.core.constants import (
    ROLE_FARMER, ROLE_FPO, ROLE_PROCESSOR,
    ROLE_RETAILER, ROLE_LOGISTICS, ROLE_WAREHOUSE, ROLE_GOVERNMENT
)


class IsOwner(permissions.BasePermission):
    """
    Permission to only allow owners of an object to access/edit it
    """
    def has_object_permission(self, request, view, obj):
        # Check if obj has 'user' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # Check if obj has 'farmer' attribute
        if hasattr(obj, 'farmer'):
            return obj.farmer.user == request.user
        # Check if obj has 'fpo' attribute
        if hasattr(obj, 'fpo'):
            return obj.fpo.user == request.user
        return False


class IsFarmer(permissions.BasePermission):
    """
    Permission to only allow farmers
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_FARMER


class IsFPO(permissions.BasePermission):
    """
    Permission to only allow FPO users
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_FPO


class IsProcessor(permissions.BasePermission):
    """
    Permission to only allow processors
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_PROCESSOR


class IsRetailer(permissions.BasePermission):
    """
    Permission to only allow retailers
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_RETAILER


class IsLogistics(permissions.BasePermission):
    """
    Permission to only allow logistics partners
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_LOGISTICS


class IsWarehouse(permissions.BasePermission):
    """
    Permission to only allow warehouse operators
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_WAREHOUSE


class IsGovernment(permissions.BasePermission):
    """
    Permission to only allow government officials
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ROLE_GOVERNMENT


class IsVerified(permissions.BasePermission):
    """
    Permission to only allow verified users
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified


class IsFarmerOrFPO(permissions.BasePermission):
    """
    Permission for farmers or FPO users
    """
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in [ROLE_FARMER, ROLE_FPO])


class IsFPOOrProcessor(permissions.BasePermission):
    """
    Permission for FPO or processor users (for bidding)
    """
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in [ROLE_FPO, ROLE_PROCESSOR])
