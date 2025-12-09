# 🔗 Blockchain Transaction Recording - Code Locations

## Overview
Blockchain transactions are **automatically recorded** using Django signals in the backend. Every time a key event happens in the supply chain, a signal triggers and creates an immutable blockchain record.

---

## 📍 Main File Location
**File:** `backend/apps/blockchain/signals.py` (539 lines)

This file contains all the signal receivers that automatically create blockchain transactions.

---

## 🔄 How It Works

### 1. **Signal Decorator Pattern**
```python
@receiver(post_save, sender=ModelName)
def signal_function(sender, instance, created, **kwargs):
    # Automatically triggered when ModelName is saved
    create_blockchain_transaction(...)
```

### 2. **Automatic Registration**
Signals are automatically loaded when Django starts:
```python
# backend/apps/blockchain/apps.py
class BlockchainConfig(AppConfig):
    def ready(self):
        import apps.blockchain.signals  # ← Loads all signals
```

---

## 📋 All Blockchain Transaction Recording Points

### 1️⃣ **LOT CREATION** 
**Signal:** `lot_created_blockchain` (Line 127)
**Trigger:** When `ProcurementLot` is created
**Action Type:** `BLOCKCHAIN_CREATED`
**Records:**
- Farmer details (name, phone, location)
- Crop details (type, variety, quantity, harvest date)
- Quality parameters (grade, moisture, oil content)
- Expected price
- GPS coordinates (if available)

**Code:**
```python
@receiver(post_save, sender=ProcurementLot)
def lot_created_blockchain(sender, instance, created, **kwargs):
    if created and instance.farmer:
        # Records lot creation automatically
        create_blockchain_transaction(
            lot=instance,
            action_type=BLOCKCHAIN_CREATED,
            actor=instance.farmer.user,
            transaction_data={...},
            location=(lat, lng)
        )
        # Also generates QR code
        generate_qr_code_for_lot(instance)
```

**When it happens:** 
- Farmer creates a lot via API/Dashboard
- FPO creates a lot on behalf of farmer

---

### 2️⃣ **FPO PROCUREMENT**
**Signal:** `lot_procured_blockchain` (Line 191)
**Trigger:** When `ProcurementLot` is updated with FPO assignment
**Action Type:** `BLOCKCHAIN_PROCURED`
**Records:**
- FPO details (organization name, registration number)
- Procurement date
- Purchase price (if different from expected)
- Commission structure
- Warehouse assignment

**Code:**
```python
@receiver(post_save, sender=ProcurementLot)
def lot_procured_blockchain(sender, instance, created, **kwargs):
    if not created and instance.fpo and instance.managed_by_fpo:
        # Check if not already recorded
        if not existing_procurement:
            create_blockchain_transaction(
                lot=instance,
                action_type=BLOCKCHAIN_PROCURED,
                actor=instance.fpo.user,
                transaction_data={...}
            )
```

---

### 3️⃣ **WAREHOUSE MOVEMENT**
**Signal:** `warehouse_movement_blockchain` (Line 236)
**Trigger:** When `StockMovement` is created
**Action Types:** 
- `BLOCKCHAIN_WAREHOUSE_IN` (when movement_type = 'IN')
- `BLOCKCHAIN_WAREHOUSE_OUT` (when movement_type = 'OUT')

**Records:**
- Warehouse details (name, location, capacity)
- Movement type (IN/OUT)
- Quantity moved
- Movement date
- Reference number
- Storage conditions

**Code:**
```python
@receiver(post_save, sender=StockMovement)
def warehouse_movement_blockchain(sender, instance, created, **kwargs):
    if created and instance.lot:
        action_type = BLOCKCHAIN_WAREHOUSE_IN if instance.movement_type == 'IN' else BLOCKCHAIN_WAREHOUSE_OUT
        create_blockchain_transaction(
            lot=instance.lot,
            action_type=action_type,
            actor=instance.warehouse.fpo.user,
            transaction_data={...}
        )
```

---

### 4️⃣ **BID ACCEPTANCE**
**Signal:** `bid_accepted_blockchain` (Line 296)
**Trigger:** When `BidAcceptance` is created
**Action Type:** `BLOCKCHAIN_SALE_AGREED`
**Records:**
- Buyer details (type, name)
- Pricing (offered price, quantity, total amount)
- Payment terms
- Expected pickup date
- Delivery location

**Code:**
```python
@receiver(post_save, sender=BidAcceptance)
def bid_accepted_blockchain(sender, instance, created, **kwargs):
    if created:
        create_blockchain_transaction(
            lot=instance.bid.lot,
            action_type=BLOCKCHAIN_SALE_AGREED,
            actor=instance.bid.lot.farmer.user,
            transaction_data={...}
        )
```

---

### 5️⃣ **PROCESSING BATCH COMPLETION**
**Signal:** `processing_batch_blockchain` (Line 345)
**Trigger:** When `ProcessingBatch.status = 'completed'`
**Action Type:** `BLOCKCHAIN_PROCESSED`
**Records:**
- Batch number
- Processor/plant details
- Processing method (cold pressed, hot pressed, etc.)
- Initial quantity
- Start and completion dates
- Output products (oil, cake, waste quantities)
- Yield metrics (oil %, cake %, waste %)
- Quality grade

**Code:**
```python
@receiver(post_save, sender=ProcessingBatch)
def processing_batch_blockchain(sender, instance, created, **kwargs):
    if instance.status == 'completed':
        if not existing:  # Avoid duplicate
            create_blockchain_transaction(
                lot=instance.lot,
                action_type=BLOCKCHAIN_PROCESSED,
                actor=instance.plant.processor.user,
                transaction_data={
                    'batch_number': instance.batch_number,
                    'output_products': {...},
                    'yield_metrics': {...}
                }
            )
```

---

### 6️⃣ **PROCESSING STAGE COMPLETION**
**Signal:** `processing_stage_blockchain` (Line 407)
**Trigger:** When `ProcessingStageLog` is created
**Action Type:** `BLOCKCHAIN_STAGE_COMPLETED`
**Records:**
- Batch number
- Stage name (cleaning, dehulling, crushing, pressing, etc.)
- Input/output/waste quantities
- Quality metrics
- Yield and loss percentages
- Duration
- Equipment used
- Operator details

**Code:**
```python
@receiver(post_save, sender=ProcessingStageLog)
def processing_stage_blockchain(sender, instance, created, **kwargs):
    if created:
        create_blockchain_transaction(
            lot=instance.batch.lot,
            action_type=BLOCKCHAIN_STAGE_COMPLETED,
            actor=instance.operator,
            transaction_data={
                'stage': instance.stage,
                'quantities': {...},
                'performance': {...}
            }
        )
```

**Processing Stages Tracked:**
1. Cleaning
2. Dehulling
3. Crushing
4. Conditioning
5. Pressing
6. Filtration
7. Refining
8. Packaging

---

### 7️⃣ **FINISHED PRODUCT PACKAGING**
**Signal:** `finished_product_blockchain` (Line 455)
**Trigger:** When `FinishedProduct` is created
**Action Type:** `BLOCKCHAIN_PACKAGED`
**Records:**
- Product type (crude oil, refined oil, oil cake, hulls)
- SKU/product code
- Quantity (liters or quintals)
- Packaging details
- Manufacturing date
- Expiry date
- Quality grade
- Storage conditions
- Batch linkage (traceability back to source)

**Code:**
```python
@receiver(post_save, sender=FinishedProduct)
def finished_product_blockchain(sender, instance, created, **kwargs):
    if created:
        create_blockchain_transaction(
            lot=instance.batch.lot,
            action_type=BLOCKCHAIN_PACKAGED,
            actor=instance.processor.user,
            transaction_data={
                'product_type': instance.product_type,
                'quantity': {...},
                'packaging': {...},
                'traceability': {
                    'source_batch': instance.batch.batch_number,
                    'source_lot': instance.batch.lot.lot_number
                }
            }
        )
```

---

### 8️⃣ **PAYMENT SETTLEMENT**
**Signal:** `payment_completed_blockchain` (Line 502)
**Trigger:** When `Payment.status = 'completed'`
**Action Type:** `BLOCKCHAIN_PAYMENT_COMPLETED`
**Records:**
- Payment amount (gross, commission, net)
- Payment method
- Transaction reference
- Payer and payee details
- Payment date
- Commission breakdown (FPO cut, platform fee)

**Code:**
```python
@receiver(post_save, sender=Payment)
def payment_completed_blockchain(sender, instance, created, **kwargs):
    if instance.status == 'completed':
        if not existing:
            create_blockchain_transaction(
                lot=instance.lot,
                action_type=BLOCKCHAIN_PAYMENT_COMPLETED,
                actor=instance.paid_by,
                transaction_data={
                    'payment_breakdown': {...},
                    'commission': {...}
                }
            )
```

---

## 🔧 Helper Functions

### `create_blockchain_transaction()`
**Location:** Line 32
**Purpose:** Core function that creates the blockchain transaction

**What it does:**
1. Extracts actor details (role, name, ID)
2. Creates `BlockchainTransaction` record
3. Automatically links to previous transaction (creates hash chain)
4. Generates transaction ID and data hash (SHA-256)
5. Updates `TraceabilityRecord`
6. Logs the transaction

```python
def create_blockchain_transaction(lot, action_type, actor, transaction_data, location=None):
    transaction = BlockchainTransaction.objects.create(
        lot=lot,
        action_type=action_type,
        actor_id=actor.id,
        actor_role=actor_role,
        actor_name=actor_name,
        transaction_data=transaction_data,
        location_latitude=lat,
        location_longitude=lng
    )
    # Auto-links to previous transaction in save() method
    update_traceability_record(lot)
    return transaction
```

### `update_traceability_record()`
**Location:** Line 76
**Purpose:** Updates the aggregated journey for a lot

### `generate_qr_code_for_lot()`
**Location:** Line 85
**Purpose:** Generates QR code image for traceability

---

## 🎯 Hash Chain Creation

**Auto-generated in model's `save()` method:**
```python
# backend/apps/blockchain/models.py
class BlockchainTransaction(TimeStampedModel):
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = generate_hash(f"{lot_id}{action}{timestamp}")
        
        if not self.data_hash:
            self.data_hash = generate_hash(json.dumps(self.transaction_data))
        
        if not self.previous_hash:
            previous_tx = BlockchainTransaction.objects.filter(
                lot=self.lot
            ).order_by('-created_at').first()
            
            if previous_tx:
                self.previous_hash = previous_tx.data_hash  # ← Creates chain!
            else:
                self.previous_hash = "0" * 64  # Genesis block
        
        super().save(*args, **kwargs)
```

---

## 📊 Transaction Flow Example

### Scenario: Farmer creates lot → FPO procures → Processes → Sells

```
1. Farmer creates lot
   ↓ SIGNAL TRIGGERED: lot_created_blockchain
   ↓ Creates: BlockchainTransaction (action: 'created')
   ↓ previous_hash: "000...000" (genesis)
   ↓ Generates QR code

2. FPO procures lot
   ↓ SIGNAL TRIGGERED: lot_procured_blockchain
   ↓ Creates: BlockchainTransaction (action: 'procured')
   ↓ previous_hash: <hash from step 1>

3. Warehouse receives lot
   ↓ SIGNAL TRIGGERED: warehouse_movement_blockchain
   ↓ Creates: BlockchainTransaction (action: 'warehouse_in')
   ↓ previous_hash: <hash from step 2>

4. Quality check performed
   ↓ (Manual API call or auto-triggered)
   ↓ Creates: BlockchainTransaction (action: 'quality_checked')
   ↓ previous_hash: <hash from step 3>

5. Processor bids and wins
   ↓ SIGNAL TRIGGERED: bid_accepted_blockchain
   ↓ Creates: BlockchainTransaction (action: 'sale_agreed')
   ↓ previous_hash: <hash from step 4>

6. Processing: 8 stages
   ↓ SIGNAL TRIGGERED 8 times: processing_stage_blockchain
   ↓ Creates 8 BlockchainTransactions (action: 'stage_completed')
   ↓ Each links to previous

7. Finished product packaged
   ↓ SIGNAL TRIGGERED: finished_product_blockchain
   ↓ Creates: BlockchainTransaction (action: 'packaged')

8. Payment completed
   ↓ SIGNAL TRIGGERED: payment_completed_blockchain
   ↓ Creates: BlockchainTransaction (action: 'payment_completed')

Total: 14+ transactions in the chain!
```

---

## 🔍 Verification

### Chain Integrity Check
**Endpoint:** `POST /api/blockchain/traceability/{id}/verify_chain/`
**Code:** `backend/apps/blockchain/views.py` Line 59

```python
@action(detail=True, methods=['post'])
def verify_chain(self, request, pk=None):
    transactions = BlockchainTransaction.objects.filter(lot=lot).order_by('created_at')
    
    is_valid = True
    previous_tx = None
    for tx in transactions:
        if previous_tx:
            if tx.previous_hash != previous_tx.data_hash:
                is_valid = False  # Chain broken!
        previous_tx = tx
    
    return Response({'is_valid': is_valid})
```

---

## 🚀 How to Test

### 1. Create a lot:
```bash
POST /api/lots/
# → Automatically creates blockchain transaction via signal
```

### 2. Check blockchain transactions:
```bash
GET /api/blockchain/transactions/?lot_number=SB2025001
# → Returns all transactions for that lot
```

### 3. View traceability:
```bash
GET /api/blockchain/trace/SB2025001/
# → Returns complete journey with all transactions
```

### 4. Verify chain:
```bash
POST /api/blockchain/verify/SB2025001/
# → Returns chain integrity status
```

---

## 📝 Summary

**Key Points:**
- ✅ **Automatic:** No manual API calls needed - signals handle everything
- ✅ **Immutable:** Hash chain prevents tampering
- ✅ **Complete:** Every major event is recorded
- ✅ **Verifiable:** Chain integrity can be checked anytime
- ✅ **Traceable:** Full journey from farm to consumer

**Files to Check:**
1. `backend/apps/blockchain/signals.py` - All signal receivers
2. `backend/apps/blockchain/models.py` - Hash chain logic
3. `backend/apps/blockchain/views.py` - API endpoints
4. `backend/apps/blockchain/apps.py` - Signal registration

**No code changes needed in other apps!** The signals work transparently in the background. 🎉
