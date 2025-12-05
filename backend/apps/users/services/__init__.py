# Services module
from .otp_service import send_otp_sms, send_otp_whatsapp

__all__ = ['send_otp_sms', 'send_otp_whatsapp']
