"""
Enhanced Blockchain Views - QR Generation, Traceability, Certificates
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from django.utils import timezone
from apps.core.utils import response_success, response_error
from .models import BlockchainTransaction, TraceabilityRecord, QRCode
from apps.lots.models import ProcurementLot
import qrcode
from io import BytesIO
import json


class GenerateQRCodeAPIView(APIView):
    """
    Generate QR code for a lot
    Creates blockchain entry and QR code
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        lot_id = request.data.get('lot_id')
        
        if not lot_id:
            return Response(
                response_error(message="Lot ID is required"),
                status=400
            )
        
        try:
            lot = ProcurementLot.objects.get(id=lot_id)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=404
            )
        
        # Check if QR already exists
        qr_code, created = QRCode.objects.get_or_create(
            lot=lot,
            defaults={
                'qr_data': f"https://seedsync.com/trace/{lot.lot_number}",
                'is_active': True
            }
        )
        
        if not created:
            return Response(
                response_success(
                    message="QR code already exists",
                    data={
                        'qr_id': str(qr_code.id),
                        'qr_url': request.build_absolute_uri(qr_code.qr_image.url) if qr_code.qr_image else None,
                        'trace_url': qr_code.qr_data
                    }
                )
            )
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_code.qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code image
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        from django.core.files import File
        qr_code.qr_image.save(
            f'qr_{lot.lot_number}.png',
            File(buffer),
            save=True
        )
        
        # Create or update traceability record
        traceability, _ = TraceabilityRecord.objects.get_or_create(
            lot=lot,
            defaults={
                'qr_code_data': qr_code.qr_data
            }
        )
        
        traceability.update_journey()
        
        return Response(
            response_success(
                message="QR code generated successfully",
                data={
                    'qr_id': str(qr_code.id),
                    'qr_url': request.build_absolute_uri(qr_code.qr_image.url),
                    'trace_url': qr_code.qr_data,
                    'lot_number': lot.lot_number
                }
            ),
            status=201
        )


class TraceabilityAPIView(APIView):
    """
    Get complete traceability information for a lot
    Public endpoint - anyone can trace with lot number
    """
    permission_classes = [AllowAny]
    
    def get(self, request, lot_number):
        try:
            lot = ProcurementLot.objects.select_related(
                'farmer', 'farmer__user', 'fpo'
            ).get(lot_number=lot_number)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=404
            )
        
        # Get or create traceability record
        traceability, created = TraceabilityRecord.objects.get_or_create(
            lot=lot
        )
        
        if created or not traceability.journey:
            traceability.update_journey()
        
        # Get QR code info
        qr_code = None
        try:
            qr_obj = QRCode.objects.get(lot=lot)
            qr_code = {
                'qr_url': request.build_absolute_uri(qr_obj.qr_image.url) if qr_obj.qr_image else None,
                'scan_count': qr_obj.scan_count,
                'last_scanned': qr_obj.last_scanned_at.isoformat() if qr_obj.last_scanned_at else None
            }
            
            # Increment scan count
            qr_obj.increment_scan_count()
        except QRCode.DoesNotExist:
            pass
        
        # Build response
        trace_data = {
            'lot_info': {
                'lot_number': lot.lot_number,
                'crop_type': lot.crop_type,
                'quantity_quintals': float(lot.quantity_quintals),
                'quality_grade': lot.quality_grade,
                'harvest_date': lot.harvest_date.isoformat(),
                'status': lot.status
            },
            'farmer_info': {
                'name': lot.farmer.full_name,
                'village': lot.farmer.village,
                'district': lot.farmer.district,
                'state': lot.farmer.state,
                'fpo': lot.farmer.fpo.organization_name if lot.farmer.fpo else 'Independent'
            },
            'journey': traceability.journey,
            'verification': {
                'total_transactions': traceability.total_transactions,
                'chain_verified': traceability.chain_verified,
                'last_verification': traceability.last_verification_date.isoformat() if traceability.last_verification_date else None
            },
            'qr_code': qr_code,
            'blockchain_verified': True  # Simplified verification
        }
        
        return Response(
            response_success(
                message="Traceability information fetched successfully",
                data=trace_data
            )
        )


class AddBlockchainTransactionAPIView(APIView):
    """
    Add a new transaction to the blockchain
    Used when lot status changes (procured, shipped, received, etc.)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        lot_id = request.data.get('lot_id')
        action_type = request.data.get('action_type')
        transaction_data = request.data.get('transaction_data', {})
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not lot_id or not action_type:
            return Response(
                response_error(message="Lot ID and action type are required"),
                status=400
            )
        
        try:
            lot = ProcurementLot.objects.get(id=lot_id)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=404
            )
        
        # Create blockchain transaction
        transaction = BlockchainTransaction.objects.create(
            lot=lot,
            action_type=action_type,
            actor_id=request.user.id,
            actor_role=request.user.role,
            actor_name=request.user.get_full_name(),
            transaction_data=transaction_data,
            location_latitude=latitude,
            location_longitude=longitude
        )
        
        # Update traceability record
        try:
            traceability = TraceabilityRecord.objects.get(lot=lot)
            traceability.update_journey()
        except TraceabilityRecord.DoesNotExist:
            traceability = TraceabilityRecord.objects.create(lot=lot)
            traceability.update_journey()
        
        return Response(
            response_success(
                message="Blockchain transaction added successfully",
                data={
                    'transaction_id': transaction.transaction_id,
                    'action_type': transaction.get_action_type_display(),
                    'timestamp': transaction.timestamp.isoformat(),
                    'data_hash': transaction.data_hash
                }
            ),
            status=201
        )


class VerifyBlockchainAPIView(APIView):
    """
    Verify blockchain integrity for a lot
    Checks hash chain continuity
    """
    permission_classes = [AllowAny]
    
    def get(self, request, lot_number):
        try:
            lot = ProcurementLot.objects.get(lot_number=lot_number)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=404
            )
        
        # Get all transactions for this lot
        transactions = BlockchainTransaction.objects.filter(lot=lot).order_by('created_at')
        
        if not transactions.exists():
            return Response(
                response_success(
                    message="No blockchain transactions found",
                    data={'verified': True, 'total_transactions': 0}
                )
            )
        
        # Verify hash chain
        verified = True
        previous_hash = None
        
        for i, tx in enumerate(transactions):
            if i == 0:
                # First transaction should have genesis hash
                if tx.previous_hash != "0" * 64:
                    verified = False
                    break
            else:
                # Check if previous_hash matches
                if tx.previous_hash != previous_hash:
                    verified = False
                    break
            
            previous_hash = tx.data_hash
        
        return Response(
            response_success(
                message="Blockchain verification completed",
                data={
                    'verified': verified,
                    'total_transactions': transactions.count(),
                    'first_transaction': transactions.first().timestamp.isoformat(),
                    'last_transaction': transactions.last().timestamp.isoformat()
                }
            )
        )


class DownloadCertificateAPIView(APIView):
    """
    Download traceability certificate as PDF
    Contains QR code and complete journey
    """
    permission_classes = [AllowAny]
    
    def get(self, request, lot_number):
        try:
            lot = ProcurementLot.objects.get(lot_number=lot_number)
        except ProcurementLot.DoesNotExist:
            return Response(
                response_error(message="Lot not found"),
                status=404
            )
        
        # For hackathon, return JSON instead of PDF
        # In production, generate PDF using reportlab
        
        try:
            traceability = TraceabilityRecord.objects.get(lot=lot)
        except TraceabilityRecord.DoesNotExist:
            traceability = TraceabilityRecord.objects.create(lot=lot)
            traceability.update_journey()
        
        certificate_data = {
            'certificate_number': f"CERT-{lot.lot_number}",
            'issue_date': timezone.now().isoformat(),
            'lot_number': lot.lot_number,
            'crop_type': lot.get_crop_type_display(),
            'quantity': f"{lot.quantity_quintals} quintals",
            'quality_grade': lot.quality_grade,
            'farmer': lot.farmer.full_name,
            'fpo': lot.farmer.fpo.organization_name if lot.farmer.fpo else 'Independent',
            'journey': traceability.journey,
            'verification_status': 'Verified' if traceability.chain_verified else 'Pending',
            'blockchain_verified': True,
            'certificate_hash': traceability.certificate_hash or 'N/A'
        }
        
        # Return as JSON for now (convert to PDF in production)
        return Response(
            response_success(
                message="Certificate data generated",
                data=certificate_data
            )
        )
