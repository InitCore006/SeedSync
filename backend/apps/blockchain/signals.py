"""
Blockchain Signals for Automatic Transaction Recording
Auto-trigger blockchain transactions on key supply chain events
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
import logging
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

from apps.lots.models import ProcurementLot
from apps.processors.models import ProcessingBatch, ProcessingStageLog, FinishedProduct
from apps.bids.models import BidAcceptance
from apps.payments.models import Payment
from apps.warehouses.models import StockMovement
from .models import BlockchainTransaction, QRCode, TraceabilityRecord
from apps.core.constants import (
    BLOCKCHAIN_CREATED, BLOCKCHAIN_PROCURED, BLOCKCHAIN_QUALITY_CHECKED,
    BLOCKCHAIN_WAREHOUSE_IN, BLOCKCHAIN_WAREHOUSE_OUT, BLOCKCHAIN_SALE_AGREED,
    BLOCKCHAIN_SHIPPED, BLOCKCHAIN_RECEIVED, BLOCKCHAIN_PROCESSED,
    BLOCKCHAIN_STAGE_COMPLETED, BLOCKCHAIN_PACKAGED, BLOCKCHAIN_PAYMENT_COMPLETED
)

User = get_user_model()
logger = logging.getLogger(__name__)


def create_blockchain_transaction(lot, action_type, actor, transaction_data, location=None):
    """
    Helper function to create blockchain transaction
    
    Args:
        lot: ProcurementLot instance
        action_type: Type of blockchain action
        actor: User who performed the action
        transaction_data: Dict containing transaction details
        location: Tuple of (latitude, longitude) or None
    """
    try:
        # Get actor details
        actor_role = actor.user_type if hasattr(actor, 'user_type') else 'system'
        actor_name = actor.get_full_name() if hasattr(actor, 'get_full_name') else str(actor)
        
        # Extract location
        lat, lng = location if location else (None, None)
        
        # Create transaction
        transaction = BlockchainTransaction.objects.create(
            lot=lot,
            action_type=action_type,
            actor_id=actor.id if hasattr(actor, 'id') else None,
            actor_role=actor_role,
            actor_name=actor_name,
            transaction_data=transaction_data,
            location_latitude=lat,
            location_longitude=lng
        )
        
        # Update traceability record
        update_traceability_record(lot)
        
        logger.info(f"Blockchain transaction created: {transaction.transaction_id} for lot {lot.lot_number}")
        return transaction
        
    except Exception as e:
        logger.error(f"Error creating blockchain transaction: {str(e)}")
        return None


def update_traceability_record(lot):
    """Update or create traceability record for a lot"""
    try:
        record, created = TraceabilityRecord.objects.get_or_create(lot=lot)
        record.update_journey()
        logger.info(f"Traceability record updated for lot {lot.lot_number}")
    except Exception as e:
        logger.error(f"Error updating traceability record: {str(e)}")


def generate_qr_code_for_lot(lot):
    """Generate QR code for lot traceability"""
    try:
        # Create or get QR code record
        qr_record, created = QRCode.objects.get_or_create(lot=lot)
        
        # Generate QR code data (URL to trace page)
        trace_url = f"https://seedsync.app/trace/{lot.lot_number}"
        qr_record.qr_data = trace_url
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(trace_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Save to model
        filename = f'qr_{lot.lot_number}.png'
        qr_record.qr_image.save(filename, File(buffer), save=False)
        qr_record.save()
        
        logger.info(f"QR code generated for lot {lot.lot_number}")
        return qr_record
        
    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        return None


# ============================================================================
# LOT CREATION SIGNAL
# ============================================================================
@receiver(post_save, sender=ProcurementLot)
def lot_created_blockchain(sender, instance, created, **kwargs):
    """
    Trigger blockchain transaction when lot is created
    Records initial lot creation with farmer details and crop information
    """
    if created and instance.farmer:
        try:
            # Prepare transaction data
            transaction_data = {
                'event': 'lot_created',
                'lot_number': instance.lot_number,
                'farmer_details': {
                    'name': instance.farmer.user.get_full_name(),
                    'phone': instance.farmer.phone_number,
                    'location': {
                        'village': instance.farmer.village if hasattr(instance.farmer, 'village') else '',
                        'district': instance.farmer.district if hasattr(instance.farmer, 'district') else '',
                        'state': instance.farmer.state if hasattr(instance.farmer, 'state') else ''
                    }
                },
                'crop_details': {
                    'crop_type': instance.crop_type,
                    'crop_variety': instance.crop_variety,
                    'quantity_quintals': float(instance.quantity_quintals),
                    'harvest_date': instance.harvest_date.isoformat(),
                    'expected_price': float(instance.expected_price_per_quintal)
                },
                'quality_parameters': {
                    'quality_grade': instance.quality_grade,
                    'moisture_content': float(instance.moisture_content) if instance.moisture_content else None,
                    'oil_content': float(instance.oil_content) if instance.oil_content else None
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Get location from farmer profile if available
            location = None
            if hasattr(instance.farmer, 'latitude') and instance.farmer.latitude:
                location = (instance.farmer.latitude, instance.farmer.longitude)
            
            # Create blockchain transaction
            create_blockchain_transaction(
                lot=instance,
                action_type=BLOCKCHAIN_CREATED,
                actor=instance.farmer.user,
                transaction_data=transaction_data,
                location=location
            )
            
            # Generate QR code
            generate_qr_code_for_lot(instance)
            
        except Exception as e:
            logger.error(f"Error in lot_created_blockchain signal: {str(e)}")


# ============================================================================
# FPO PROCUREMENT SIGNAL
# ============================================================================
@receiver(post_save, sender=ProcurementLot)
def lot_procured_blockchain(sender, instance, created, **kwargs):
    """
    Trigger blockchain transaction when FPO procures a lot
    Records procurement details, pricing, and FPO information
    """
    if not created and instance.fpo and instance.managed_by_fpo:
        # Check if this is a new procurement (not already recorded)
        existing_procurement = BlockchainTransaction.objects.filter(
            lot=instance,
            action_type=BLOCKCHAIN_PROCURED
        ).exists()
        
        if not existing_procurement:
            try:
                transaction_data = {
                    'event': 'fpo_procured',
                    'fpo_details': {
                        'name': instance.fpo.organization_name,
                        'registration_number': instance.fpo.registration_number,
                        'contact': instance.fpo.email
                    },
                    'procurement_data': {
                        'procurement_date': timezone.now().isoformat(),
                        'quantity': float(instance.quantity_quintals),
                        'listing_type': instance.listing_type
                    },
                    'warehouse_info': {
                        'warehouse_id': str(instance.warehouse.id) if instance.warehouse else None,
                        'warehouse_name': instance.warehouse.name if instance.warehouse else None,
                        'capacity_utilization': float(instance.warehouse.current_utilization_percentage()) if instance.warehouse else None
                    } if instance.warehouse else None,
                    'timestamp': timezone.now().isoformat()
                }
                
                # Get FPO location
                location = None
                if hasattr(instance.fpo, 'latitude') and instance.fpo.latitude:
                    location = (instance.fpo.latitude, instance.fpo.longitude)
                
                create_blockchain_transaction(
                    lot=instance,
                    action_type=BLOCKCHAIN_PROCURED,
                    actor=instance.fpo.user,
                    transaction_data=transaction_data,
                    location=location
                )
                
            except Exception as e:
                logger.error(f"Error in lot_procured_blockchain signal: {str(e)}")


# ============================================================================
# WAREHOUSE STOCK MOVEMENT SIGNAL
# ============================================================================
@receiver(post_save, sender=StockMovement)
def warehouse_movement_blockchain(sender, instance, created, **kwargs):
    """
    Record warehouse stock movements on blockchain
    Tracks IN and OUT movements for complete traceability
    """
    if created and instance.lot:
        try:
            transaction_data = {
                'event': 'warehouse_movement',
                'movement_type': instance.movement_type,
                'warehouse': {
                    'id': str(instance.warehouse.id),
                    'name': instance.warehouse.name,
                    'location': {
                        'district': instance.warehouse.district,
                        'state': instance.warehouse.state
                    }
                },
                'quantity_quintals': float(instance.quantity_quintals),
                'movement_date': instance.movement_date.isoformat(),
                'reference_number': instance.reference_number,
                'remarks': instance.remarks,
                'timestamp': timezone.now().isoformat()
            }
            
            # Determine action type based on movement
            if instance.movement_type == 'IN':
                action_type = BLOCKCHAIN_WAREHOUSE_IN
            else:
                action_type = BLOCKCHAIN_WAREHOUSE_OUT  # OUT movement
            
            # Get warehouse location
            location = None
            if hasattr(instance.warehouse, 'latitude') and instance.warehouse.latitude:
                location = (instance.warehouse.latitude, instance.warehouse.longitude)
            
            create_blockchain_transaction(
                lot=instance.lot,
                action_type=action_type,
                actor=instance.warehouse.fpo.user,
                transaction_data=transaction_data,
                location=location
            )
            
        except Exception as e:
            logger.error(f"Error in warehouse_movement_blockchain signal: {str(e)}")


# ============================================================================
# BID ACCEPTANCE SIGNAL
# ============================================================================
@receiver(post_save, sender=BidAcceptance)
def bid_accepted_blockchain(sender, instance, created, **kwargs):
    """
    Record bid acceptance on blockchain
    Captures sale agreement between seller and buyer
    """
    if created:
        try:
            transaction_data = {
                'event': 'bid_accepted',
                'buyer_details': {
                    'type': instance.bid.bidder_type,
                    'name': instance.bid.bidder.get_full_name() if hasattr(instance.bid.bidder, 'get_full_name') else str(instance.bid.bidder)
                },
                'pricing': {
                    'offered_price_per_quintal': float(instance.bid.offered_price_per_quintal),
                    'quantity_quintals': float(instance.bid.quantity_quintals),
                    'total_amount': float(instance.bid.offered_price_per_quintal * instance.bid.quantity_quintals),
                    'payment_terms': instance.bid.payment_terms
                },
                'logistics': {
                    'expected_pickup_date': instance.bid.expected_pickup_date.isoformat() if instance.bid.expected_pickup_date else None,
                    'delivery_location': instance.bid.delivery_location if hasattr(instance.bid, 'delivery_location') else None
                },
                'acceptance_date': instance.accepted_date.isoformat(),
                'timestamp': timezone.now().isoformat()
            }
            
            create_blockchain_transaction(
                lot=instance.bid.lot,
                action_type=BLOCKCHAIN_SALE_AGREED,
                actor=instance.bid.lot.farmer.user if instance.bid.lot.farmer else instance.bid.lot.fpo.user,
                transaction_data=transaction_data,
                location=None
            )
            
        except Exception as e:
            logger.error(f"Error in bid_accepted_blockchain signal: {str(e)}")


# ============================================================================
# PROCESSING BATCH SIGNAL
# ============================================================================
@receiver(post_save, sender=ProcessingBatch)
def processing_batch_blockchain(sender, instance, created, **kwargs):
    """
    Record processing batch creation and completion
    Tracks transformation from raw material to finished products
    """
    if instance.status == 'completed':
        # Check if already recorded
        existing = BlockchainTransaction.objects.filter(
            lot=instance.lot,
            action_type=BLOCKCHAIN_PROCESSED,
            transaction_data__batch_number=instance.batch_number
        ).exists()
        
        if not existing:
            try:
                transaction_data = {
                    'event': 'processing_completed',
                    'batch_number': instance.batch_number,
                    'processor': {
                        'plant_id': str(instance.plant.id),
                        'plant_name': instance.plant.plant_name,
                        'company': instance.plant.processor.company_name
                    },
                    'processing_details': {
                        'method': instance.processing_method,
                        'initial_quantity': float(instance.initial_quantity_quintals),
                        'start_date': instance.start_date.isoformat() if instance.start_date else None,
                        'completion_date': instance.completion_date.isoformat() if instance.completion_date else None
                    },
                    'output_products': {
                        'oil_extracted_quintals': float(instance.oil_extracted_quintals) if instance.oil_extracted_quintals else 0,
                        'refined_oil_quintals': float(instance.refined_oil_quintals) if instance.refined_oil_quintals else 0,
                        'cake_produced_quintals': float(instance.cake_produced_quintals) if instance.cake_produced_quintals else 0,
                        'waste_quintals': float(instance.waste_quantity_quintals)
                    },
                    'yield_metrics': {
                        'oil_yield_percentage': float(instance.oil_yield_percentage),
                        'cake_yield_percentage': float(instance.cake_yield_percentage),
                        'waste_percentage': float(instance.total_waste_percentage)
                    },
                    'quality_grade': instance.quality_grade,
                    'timestamp': timezone.now().isoformat()
                }
                
                # Get processor location
                location = None
                if hasattr(instance.plant, 'latitude') and instance.plant.latitude:
                    location = (instance.plant.latitude, instance.plant.longitude)
                elif hasattr(instance.plant.processor, 'latitude') and instance.plant.processor.latitude:
                    location = (instance.plant.processor.latitude, instance.plant.processor.longitude)
                
                create_blockchain_transaction(
                    lot=instance.lot,
                    action_type=BLOCKCHAIN_PROCESSED,
                    actor=instance.plant.processor.user,
                    transaction_data=transaction_data,
                    location=location
                )
                
            except Exception as e:
                logger.error(f"Error in processing_batch_blockchain signal: {str(e)}")


# ============================================================================
# PROCESSING STAGE LOG SIGNAL
# ============================================================================
@receiver(post_save, sender=ProcessingStageLog)
def processing_stage_blockchain(sender, instance, created, **kwargs):
    """
    Record each processing stage on blockchain
    Provides granular tracking of transformation process
    """
    if created:
        try:
            transaction_data = {
                'event': 'processing_stage_completed',
                'batch_number': instance.batch.batch_number,
                'stage': instance.stage,
                'stage_display': instance.get_stage_display(),
                'quantities': {
                    'input': float(instance.input_quantity),
                    'output': float(instance.output_quantity),
                    'waste': float(instance.waste_quantity)
                },
                'quality_metrics': instance.quality_metrics,
                'performance': {
                    'yield_percentage': float(instance.yield_percentage),
                    'loss_percentage': float(instance.loss_percentage),
                    'duration_minutes': instance.duration_minutes
                },
                'equipment': instance.equipment_used,
                'operator': str(instance.operator) if instance.operator else None,
                'timestamp': instance.start_time.isoformat()
            }
            
            create_blockchain_transaction(
                lot=instance.batch.lot,
                action_type=BLOCKCHAIN_STAGE_COMPLETED,
                actor=instance.operator if instance.operator else instance.batch.plant.processor.user,
                transaction_data=transaction_data,
                location=None
            )
            
        except Exception as e:
            logger.error(f"Error in processing_stage_blockchain signal: {str(e)}")


# ============================================================================
# FINISHED PRODUCT SIGNAL
# ============================================================================
@receiver(post_save, sender=FinishedProduct)
def finished_product_blockchain(sender, instance, created, **kwargs):
    """
    Record finished product packaging on blockchain
    Links final products back to source lots
    """
    if created:
        try:
            transaction_data = {
                'event': 'product_packaged',
                'product_details': {
                    'type': instance.product_type,
                    'oil_type': instance.oil_type,
                    'quantity_liters': float(instance.quantity_liters) if instance.quantity_liters else None,
                    'quantity_quintals': float(instance.quantity_quintals) if instance.quantity_quintals else None,
                    'packaging': instance.packaging_type
                },
                'batch_info': {
                    'batch_number': instance.batch.batch_number,
                    'source_lot': instance.batch.lot.lot_number
                },
                'storage': {
                    'location': instance.storage_location,
                    'conditions': instance.storage_conditions
                },
                'quality': {
                    'grade': instance.quality_grade,
                    'manufacturing_date': instance.manufacturing_date.isoformat() if hasattr(instance, 'manufacturing_date') and instance.manufacturing_date else None,
                    'expiry_date': instance.expiry_date.isoformat() if hasattr(instance, 'expiry_date') and instance.expiry_date else None
                },
                'timestamp': timezone.now().isoformat()
            }
            
            create_blockchain_transaction(
                lot=instance.batch.lot,
                action_type=BLOCKCHAIN_PACKAGED,
                actor=instance.batch.plant.processor.user,
                transaction_data=transaction_data,
                location=None
            )
            
        except Exception as e:
            logger.error(f"Error in finished_product_blockchain signal: {str(e)}")


# ============================================================================
# PAYMENT SIGNAL
# ============================================================================
@receiver(post_save, sender=Payment)
def payment_completed_blockchain(sender, instance, created, **kwargs):
    """
    Record payment completion on blockchain
    Ensures financial transparency in the supply chain
    """
    if instance.status == 'completed' and instance.bid_acceptance:
        # Check if already recorded
        existing = BlockchainTransaction.objects.filter(
            lot=instance.bid_acceptance.bid.lot,
            action_type=BLOCKCHAIN_PAYMENT_COMPLETED,
            transaction_data__payment_id=str(instance.id)
        ).exists()
        
        if not existing:
            try:
                transaction_data = {
                    'event': 'payment_completed',
                    'payment_id': str(instance.id),
                    'transaction_id': instance.transaction_id,
                    'amount_details': {
                        'gross_amount': float(instance.amount),
                        'platform_commission': float(instance.platform_commission) if hasattr(instance, 'platform_commission') else 0,
                        'fpo_commission': float(instance.fpo_commission) if hasattr(instance, 'fpo_commission') else 0,
                        'net_amount': float(instance.amount)  # Simplified
                    },
                    'payer': str(instance.payer),
                    'payee': str(instance.payee),
                    'payment_method': instance.payment_method,
                    'payment_date': instance.payment_date.isoformat() if instance.payment_date else timezone.now().isoformat(),
                    'timestamp': timezone.now().isoformat()
                }
                
                create_blockchain_transaction(
                    lot=instance.bid_acceptance.bid.lot,
                    action_type=BLOCKCHAIN_PAYMENT_COMPLETED,
                    actor=instance.payer,
                    transaction_data=transaction_data,
                    location=None
                )
                
            except Exception as e:
                logger.error(f"Error in payment_completed_blockchain signal: {str(e)}")
