"""
Custom Exceptions for SeedSync Platform
"""
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.views import exception_handler
from datetime import datetime


class ResourceNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found'
    default_code = 'resource_not_found'


class InvalidDataException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid data provided'
    default_code = 'invalid_data'


class UnauthorizedAccessException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this resource'
    default_code = 'unauthorized_access'


class LotNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Lot not found'
    default_code = 'lot_not_found'


class BidNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Bid not found'
    default_code = 'bid_not_found'


class FarmerNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Farmer profile not found'
    default_code = 'farmer_not_found'


class FPONotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'FPO profile not found'
    default_code = 'fpo_not_found'


class InvalidOTPException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid or expired OTP'
    default_code = 'invalid_otp'


class PaymentFailedException(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Payment processing failed'
    default_code = 'payment_failed'


def custom_exception_handler(exc, context):
    """
    Custom exception handler to return consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            'status': 'error',
            'message': response.data.get('detail', str(exc)),
            'errors': {},
            'meta': {
                'timestamp': datetime.now().isoformat()
            }
        }

        # If there are field-specific errors, include them
        if isinstance(response.data, dict):
            for key, value in response.data.items():
                if key != 'detail':
                    custom_response_data['errors'][key] = value

        response.data = custom_response_data

    return response
