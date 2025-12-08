"""
Stripe Payment Integration Service
Handles Stripe payment operations for SeedSync platform
"""
import stripe
from django.conf import settings
from decimal import Decimal
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe with secret key
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """
    Service class for Stripe payment operations
    """
    
    @staticmethod
    def create_payment_intent(
        amount: Decimal,
        currency: str = 'inr',
        payment_id: str = None,
        metadata: Dict = None
    ) -> Dict:
        """
        Create a Stripe Payment Intent
        
        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: 'inr')
            payment_id: Internal payment ID for reference
            metadata: Additional metadata to attach
            
        Returns:
            Dict containing payment intent details
        """
        try:
            # Convert amount to smallest currency unit (paise for INR)
            amount_in_paise = int(amount * 100)
            
            # Validate minimum amount (50 INR for India)
            if amount_in_paise < 5000:
                raise ValueError("Minimum payment amount is ₹50")
            
            # Prepare metadata
            intent_metadata = {
                'platform': 'SeedSync',
                'payment_id': payment_id or 'N/A',
            }
            if metadata:
                intent_metadata.update(metadata)
            
            # Create payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_paise,
                currency=currency,
                metadata=intent_metadata,
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            logger.info(f"Payment intent created: {payment_intent.id}")
            
            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'amount': amount,
                'currency': currency,
                'status': payment_intent.status,
            }
            
        except stripe.error.CardError as e:
            logger.error(f"Card error: {str(e)}")
            return {
                'success': False,
                'error': str(e.user_message),
                'error_type': 'card_error'
            }
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid request: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'error_type': 'invalid_request'
            }
        except Exception as e:
            logger.error(f"Unexpected error creating payment intent: {str(e)}")
            return {
                'success': False,
                'error': 'An unexpected error occurred',
                'error_type': 'unknown'
            }
    
    @staticmethod
    def confirm_payment_intent(payment_intent_id: str) -> Dict:
        """
        Confirm a payment intent
        
        Args:
            payment_intent_id: Stripe payment intent ID
            
        Returns:
            Dict containing confirmation status
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'status': payment_intent.status,
                'amount': Decimal(payment_intent.amount) / 100,
                'currency': payment_intent.currency,
                'charge_id': payment_intent.charges.data[0].id if payment_intent.charges.data else None,
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Error confirming payment intent: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> Optional[Dict]:
        """
        Retrieve payment intent details
        
        Args:
            payment_intent_id: Stripe payment intent ID
            
        Returns:
            Dict containing payment intent details or None
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'id': payment_intent.id,
                'amount': Decimal(payment_intent.amount) / 100,
                'currency': payment_intent.currency,
                'status': payment_intent.status,
                'charge_id': payment_intent.charges.data[0].id if payment_intent.charges.data else None,
                'customer_id': payment_intent.customer,
                'metadata': payment_intent.metadata,
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving payment intent: {str(e)}")
            return None
    
    @staticmethod
    def cancel_payment_intent(payment_intent_id: str) -> Dict:
        """
        Cancel a payment intent
        
        Args:
            payment_intent_id: Stripe payment intent ID
            
        Returns:
            Dict containing cancellation status
        """
        try:
            payment_intent = stripe.PaymentIntent.cancel(payment_intent_id)
            
            return {
                'success': True,
                'payment_intent_id': payment_intent.id,
                'status': payment_intent.status,
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Error canceling payment intent: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def create_refund(charge_id: str, amount: Optional[Decimal] = None) -> Dict:
        """
        Create a refund for a charge
        
        Args:
            charge_id: Stripe charge ID
            amount: Optional partial refund amount (full refund if not provided)
            
        Returns:
            Dict containing refund details
        """
        try:
            refund_data = {'charge': charge_id}
            
            if amount:
                refund_data['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_data)
            
            logger.info(f"Refund created: {refund.id}")
            
            return {
                'success': True,
                'refund_id': refund.id,
                'amount': Decimal(refund.amount) / 100,
                'status': refund.status,
                'charge_id': refund.charge,
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Error creating refund: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def create_customer(email: str, name: str, metadata: Dict = None) -> Dict:
        """
        Create a Stripe customer
        
        Args:
            email: Customer email
            name: Customer name
            metadata: Additional metadata
            
        Returns:
            Dict containing customer details
        """
        try:
            customer_data = {
                'email': email,
                'name': name,
            }
            
            if metadata:
                customer_data['metadata'] = metadata
            
            customer = stripe.Customer.create(**customer_data)
            
            logger.info(f"Customer created: {customer.id}")
            
            return {
                'success': True,
                'customer_id': customer.id,
                'email': customer.email,
                'name': customer.name,
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Error creating customer: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> Optional[Dict]:
        """
        Verify Stripe webhook signature
        
        Args:
            payload: Raw request body
            sig_header: Stripe-Signature header value
            
        Returns:
            Event dict if valid, None otherwise
        """
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return event
            
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            return None
