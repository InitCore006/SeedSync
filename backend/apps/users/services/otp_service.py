"""
OTP Service for SeedSync Platform
Handles OTP generation and SMS sending
"""
import logging


logger = logging.getLogger(__name__)


def send_otp_sms(phone_number, otp):
    """
    Send OTP via SMS using Twilio
    For hackathon, this is a mock implementation
    Phone number will be in +91XXXXXXXXXX format (auto-formatted by backend)
    """
    # Mock implementation for hackathon
    logger.info(f"[MOCK SMS] Sending OTP {otp} to {phone_number}")
    
    # In production, use Twilio:
    """
    from twilio.rest import Client
    
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    message = client.messages.create(
        body=f"Your SeedSync OTP is: {otp}. Valid for 10 minutes. DO NOT share with anyone.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone_number
    )
    
    return message.sid
    """
    
    # For demo purposes, print to console
    # Extract 10-digit number for display (remove +91)
    display_number = phone_number.replace('+91', '') if phone_number.startswith('+91') else phone_number
    
    print(f"\n{'='*50}")
    print(f"📱 SMS to {display_number} (India)")
    print(f"🔐 OTP: {otp}")
    print(f"⏰ Valid for 10 minutes")
    print(f"{'='*50}\n")
    
    return True


def send_otp_whatsapp(phone_number, otp):
    """
    Send OTP via WhatsApp using Twilio
    For hackathon, this is a mock implementation
    Phone number will be in +91XXXXXXXXXX format (auto-formatted by backend)
    """
    logger.info(f"[MOCK WhatsApp] Sending OTP {otp} to {phone_number}")
    
    # In production, use Twilio WhatsApp:
    """
    from twilio.rest import Client
    
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    message = client.messages.create(
        body=f"🌾 SeedSync OTP: {otp}\\n\\nValid for 10 minutes.\\n\\n🇮🇳 Building Atmanirbhar Bharat in Oilseeds",
        from_=f'whatsapp:{settings.TWILIO_PHONE_NUMBER}',
        to=f'whatsapp:{phone_number}'
    )
    
    return message.sid
    """
    
    # Extract 10-digit number for display (remove +91)
    display_number = phone_number.replace('+91', '') if phone_number.startswith('+91') else phone_number
    
    print(f"\n{'='*50}")
    print(f"💬 WhatsApp to {display_number} (India)")
    print(f"🔐 OTP: {otp}")
    print(f"⏰ Valid for 10 minutes")
    print(f"{'='*50}\n")
    
    return True
