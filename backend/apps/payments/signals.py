"""
Payment Signals
Auto-create wallet for new users and handle payment notifications
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from apps.users.models import User
from .models import Wallet, Payment


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """
    Automatically create a wallet for new users
    Give processors/FPOs demo balance for testing
    """
    if created:
        # Default balance based on role
        initial_balance = Decimal('0.00')
        
        # Give demo balance to buyers (processors/FPOs/retailers) for testing
        if instance.role in ['processor', 'fpo', 'retailer']:
            initial_balance = Decimal('100000.00')  # ₹1,00,000 demo balance
        
        Wallet.objects.create(
            user=instance,
            balance=initial_balance
        )


@receiver(post_save, sender=Payment)
def notify_payment_status_change(sender, instance, created, **kwargs):
    """
    Send notifications when payment status changes
    """
    if not created and instance.status == 'completed':
        # TODO: Send notification to farmer that payment is received
        # Can integrate with notifications app
        pass
    elif not created and instance.status == 'failed':
        # TODO: Send notification to payer that payment failed
        pass
