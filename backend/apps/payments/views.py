"""Payments Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from decimal import Decimal
from .models import Payment, Transaction, Wallet
from .serializers import PaymentSerializer, TransactionSerializer, WalletSerializer
from apps.core.utils import response_success, response_error

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(is_active=True)
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'payer', 'payee']
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get all payments for current user (as payer or payee)"""
        try:
            # Get user's profile ID based on role
            user_profile_ids = []
            if hasattr(request.user, 'processor_profile'):
                user_profile_ids.append(request.user.processor_profile.id)
            if hasattr(request.user, 'fpo_profile'):
                user_profile_ids.append(request.user.fpo_profile.id)
            if hasattr(request.user, 'retailer_profile'):
                user_profile_ids.append(request.user.retailer_profile.id)
            if hasattr(request.user, 'farmer_profile'):
                user_profile_ids.append(request.user.farmer_profile.id)
            
            if not user_profile_ids:
                return Response(
                    response_success(message="No payments found", data=[])
                )
            
            # Get payments where user is payer or payee
            payments = self.get_queryset().filter(
                Q(payer_id__in=user_profile_ids) | Q(payee_id__in=user_profile_ids)
            ).order_by('-initiated_at')
            
            serializer = self.get_serializer(payments, many=True)
            return Response(
                response_success(
                    message="Payments retrieved successfully",
                    data=serializer.data
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to retrieve payments: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def my_wallet(self, request):
        """Get wallet balance and payment summary for current user"""
        try:
            # Get or create wallet for user
            # Give demo balance to buyers for testing
            initial_balance = Decimal('100000.00') if request.user.role in ['processor', 'fpo', 'retailer'] else Decimal('0.00')
            wallet, created = Wallet.objects.get_or_create(
                user=request.user,
                defaults={'balance': initial_balance}
            )
            
            # Get user's profile IDs based on role
            user_profile_ids = []
            if hasattr(request.user, 'processor_profile'):
                user_profile_ids.append(request.user.processor_profile.id)
            if hasattr(request.user, 'fpo_profile'):
                user_profile_ids.append(request.user.fpo_profile.id)
            if hasattr(request.user, 'retailer_profile'):
                user_profile_ids.append(request.user.retailer_profile.id)
            if hasattr(request.user, 'farmer_profile'):
                user_profile_ids.append(request.user.farmer_profile.id)
            
            # Calculate pending payments (where user is payee)
            pending_payments = Decimal('0.00')
            total_earned = Decimal('0.00')
            
            if user_profile_ids:
                pending_payments = Payment.objects.filter(
                    payee_id__in=user_profile_ids,
                    status='pending',
                    is_active=True
                ).aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
                
                # Calculate total earned (completed payments where user is payee)
                total_earned = Payment.objects.filter(
                    payee_id__in=user_profile_ids,
                    status='completed',
                    is_active=True
                ).aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
            
            wallet_data = {
                'balance': float(wallet.balance),
                'pending_payments': float(pending_payments),
                'total_earned': float(total_earned),
                'currency': 'INR'
            }
            
            return Response(
                response_success(
                    message="Wallet data retrieved successfully",
                    data=wallet_data
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to retrieve wallet data: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wallet.objects.filter(is_active=True)
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        """Process wallet payment for a bid"""
        from django.db import transaction
        from django.utils import timezone
        from decimal import Decimal
        
        payment_id = request.data.get('payment_id')
        
        if not payment_id:
            return Response(
                response_error(message="payment_id is required"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user's profile ID based on role
            user_profile_id = None
            if hasattr(request.user, 'processor_profile'):
                user_profile_id = request.user.processor_profile.id
            elif hasattr(request.user, 'fpo_profile'):
                user_profile_id = request.user.fpo_profile.id
            elif hasattr(request.user, 'retailer_profile'):
                user_profile_id = request.user.retailer_profile.id
            
            if not user_profile_id:
                return Response(
                    response_error(message="User profile not found"),
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get payment
            payment = Payment.objects.select_for_update().get(
                id=payment_id,
                payer_id=user_profile_id,
                is_active=True
            )
        except Payment.DoesNotExist:
            return Response(
                response_error(message="Payment not found or you are not authorized"),
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if payment is already completed
        if payment.status == 'completed':
            return Response(
                response_error(message="Payment already completed"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if payment is failed
        if payment.status == 'failed':
            return Response(
                response_error(message="Payment has failed. Please contact support"),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Get or create payer wallet
                payer_wallet, _ = Wallet.objects.select_for_update().get_or_create(
                    user=request.user,
                    defaults={'balance': Decimal('0')}
                )
                
                # Check sufficient balance
                if not payer_wallet.has_sufficient_balance(payment.gross_amount):
                    return Response(
                        response_error(
                            message=f"Insufficient wallet balance. Available: ₹{payer_wallet.get_available_balance()}, Required: ₹{payment.gross_amount}"
                        ),
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Deduct from payer wallet
                payer_wallet.deduct_balance(
                    payment.gross_amount,
                    reason=f"Payment for lot {payment.lot.lot_number}"
                )
                
                # Create transaction record
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='payment_processing',
                    amount=payment.gross_amount,
                    status='processing',
                    status_message=f"Deducted ₹{payment.gross_amount} from payer wallet"
                )
                
                # Distribute payment (farmer + FPO commission if applicable)
                self._distribute_payment(payment)
                
                # Update payment status
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.gateway_transaction_id = f"WALLET-{timezone.now().strftime('%Y%m%d%H%M%S')}-{payment.id}"
                payment.save()
                
                # Create completion transaction
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='payment_completed',
                    amount=payment.net_amount,
                    status='completed',
                    status_message=f"Payment completed successfully. Net amount: ₹{payment.net_amount}"
                )
                
                return Response(
                    response_success(
                        message="Payment processed successfully",
                        data={
                            'payment_id': str(payment.id),
                            'amount': float(payment.gross_amount),
                            'net_amount': float(payment.net_amount),
                            'status': payment.status,
                            'payer_balance': float(payer_wallet.balance)
                        }
                    )
                )
                
        except ValueError as e:
            return Response(
                response_error(message=str(e)),
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                response_error(message=f"Payment processing failed: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _distribute_payment(self, payment):
        """Distribute payment to farmer and FPO (if commission exists)"""
        from django.utils import timezone
        from apps.farmers.models import FarmerProfile
        
        # Credit farmer (net amount)
        try:
            # Get farmer by profile ID (payee_id is farmer profile ID, not user ID)
            farmer = FarmerProfile.objects.select_related('user').get(id=payment.payee_id)
            payee_wallet, _ = Wallet.objects.get_or_create(
                user=farmer.user,
                defaults={'balance': Decimal('0')}
            )
            
            payee_wallet.add_balance(
                payment.net_amount,
                reason=f"Payment received for lot {payment.lot.lot_number}"
            )
            
            Transaction.objects.create(
                payment=payment,
                transaction_type='payment_completed',
                amount=payment.net_amount,
                status='completed',
                status_message=f"Credited ₹{payment.net_amount} to farmer wallet"
            )
        except FarmerProfile.DoesNotExist:
            # Log error if farmer not found
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Farmer profile not found for payee_id: {payment.payee_id}")
        
        # Credit FPO commission if applicable
        if payment.commission_amount > 0 and 'FPO:' in payment.notes:
            try:
                # Extract FPO ID from notes
                import re
                fpo_id_match = re.search(r'FPO:.*\(ID: ([a-f0-9\-]+)\)', payment.notes)
                if fpo_id_match:
                    from apps.fpos.models import FPOProfile
                    fpo_id = fpo_id_match.group(1)
                    fpo = FPOProfile.objects.get(id=fpo_id)
                    fpo_wallet, _ = Wallet.objects.get_or_create(
                        user=fpo.user,
                        defaults={'balance': Decimal('0')}
                    )
                    
                    fpo_wallet.add_balance(
                        payment.commission_amount,
                        reason=f"Commission from lot {payment.lot.lot_number}"
                    )
                    
                    Transaction.objects.create(
                        payment=payment,
                        transaction_type='payment_completed',
                        amount=payment.commission_amount,
                        status='completed',
                        status_message=f"Credited ₹{payment.commission_amount} commission to FPO wallet"
                    )
            except:
                pass
    
    @action(detail=False, methods=['get'])
    def pending_payments(self, request):
        """Get pending payments for current user (as payer)"""
        try:
            # Get user's profile ID based on role
            user_profile_id = None
            if hasattr(request.user, 'processor_profile'):
                user_profile_id = request.user.processor_profile.id
            elif hasattr(request.user, 'fpo_profile'):
                user_profile_id = request.user.fpo_profile.id
            elif hasattr(request.user, 'retailer_profile'):
                user_profile_id = request.user.retailer_profile.id
            
            if not user_profile_id:
                return Response(
                    response_success(message="No pending payments", data=[])
                )
            
            # Get pending payments
            payments = Payment.objects.filter(
                payer_id=user_profile_id,
                status='pending',
                is_active=True
            ).select_related('lot', 'bid').order_by('-initiated_at')
            
            serializer = PaymentSerializer(payments, many=True)
            
            return Response(
                response_success(
                    message="Pending payments retrieved successfully",
                    data=serializer.data
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to retrieve pending payments: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def farmer_earnings(self, request):
        """Get payment history for farmer"""
        try:
            # Check if user is a farmer
            if not hasattr(request.user, 'farmer_profile'):
                return Response(
                    response_error(message="Only farmers can access earnings"),
                    status=status.HTTP_403_FORBIDDEN
                )
            
            farmer = request.user.farmer_profile
            
            # Get all payments where farmer is payee
            payments = Payment.objects.filter(
                payee_id=farmer.id,
                is_active=True
            ).select_related('lot', 'bid').order_by('-initiated_at')
            
            serializer = PaymentSerializer(payments, many=True)
            
            # Calculate summary
            total_earnings = payments.filter(status='completed').aggregate(
                total=Sum('net_amount')
            )['total'] or Decimal('0')
            
            pending_payments = payments.filter(status='pending').aggregate(
                total=Sum('net_amount')
            )['total'] or Decimal('0')
            
            return Response(
                response_success(
                    message="Farmer earnings retrieved successfully",
                    data={
                        'payments': serializer.data,
                        'summary': {
                            'total_earnings': float(total_earnings),
                            'pending_payments': float(pending_payments),
                            'total_payments': payments.count(),
                            'completed_payments': payments.filter(status='completed').count()
                        }
                    }
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to retrieve earnings: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
