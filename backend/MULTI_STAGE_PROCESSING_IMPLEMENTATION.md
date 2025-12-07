# Multi-Stage Processing Implementation

## Overview
Complete implementation of multi-step oilseed processing workflow from raw materials to finished products with 8 distinct processing stages.

## Database Models

### 1. ProcessingBatch (Enhanced)
**Purpose**: Track complete batch processing lifecycle with stage-wise quantities

**New Fields**:
- `initial_quantity_quintals` - Starting raw material quantity
- Stage outputs: `cleaned_quantity_quintals`, `dehulled_quantity_quintals`, `crushed_quantity_quintals`, `conditioned_quantity_quintals`
- Final products: `oil_extracted_quintals`, `refined_oil_quintals`, `cake_produced_quintals`, `hulls_produced_quintals`
- `waste_quantity_quintals` - Total waste across all stages
- `processing_method` - cold_pressed, hot_pressed, solvent_extraction, expeller_pressed
- `current_stage` - Tracks which stage batch is currently in
- `status` - pending, in_progress, completed, on_hold, cancelled
- Date tracking: `start_date`, `completion_date`, `expected_completion_date`

**Properties**:
- `oil_yield_percentage` - Calculate oil extraction efficiency
- `cake_yield_percentage` - Calculate cake production rate
- `total_waste_percentage` - Track total losses

### 2. ProcessingStageLog (New)
**Purpose**: Detailed tracking of each processing stage for quality control and analysis

**Fields**:
- `batch` - Link to ProcessingBatch
- `stage` - cleaning, dehulling, crushing, conditioning, pressing, filtration, refining, packaging
- `input_quantity`, `output_quantity`, `waste_quantity` - Material flow tracking
- `quality_metrics` - JSON field for stage-specific quality parameters (moisture %, purity %, etc.)
- `operator` - User who performed the stage
- `equipment_used` - Machine/equipment identifier
- `start_time`, `end_time`, `duration_minutes` - Timing tracking
- `issues_encountered`, `notes` - Documentation

**Properties**:
- `yield_percentage` - Output/Input ratio
- `loss_percentage` - Calculate material losses

**Constraints**:
- Unique constraint on (batch, stage) - Each stage logged once per batch

### 3. FinishedProduct (New)
**Purpose**: Inventory management for finished products after processing

**Fields**:
- `batch` - Link to ProcessingBatch
- `product_type` - crude_oil, refined_oil, oil_cake, hulls
- Quantities: `quantity_quintals`, `reserved_quantity_quintals`, `available_quantity_quintals`
- Storage: `storage_location`, `storage_conditions` (ambient, cool_dry, refrigerated, climate_controlled)
- Quality: `quality_grade`, `quality_test_report` (file upload)
- Packaging: `packaging_type`, `units_per_package`, `total_packages`
- Dates: `production_date`, `expiry_date`
- Status: in_stock, reserved, sold, shipped, expired
- Pricing: `cost_per_quintal`, `selling_price_per_quintal`
- `low_stock_threshold` - Alert threshold

**Properties**:
- `is_low_stock` - Check if below threshold
- `is_expired` - Check expiry date

## API Endpoints

### Batch Management (ViewSet)
Base URL: `/api/processors/batches-management/`

#### 1. Create Batch
```
POST /api/processors/batches-management/
Body: {
    "plant": "<plant_id>",
    "lot": "<lot_id>",
    "batch_number": "BATCH001",
    "initial_quantity_quintals": 100.0,
    "processing_method": "cold_pressed",
    "expected_completion_date": "2025-12-15"
}
```

#### 2. Start Batch Processing
```
POST /api/processors/batches-management/{id}/start_batch/
```
- Changes status to 'in_progress'
- Sets current_stage to 'cleaning'
- Creates first ProcessingStageLog entry
- Sets start_date

#### 3. Advance to Next Stage
```
POST /api/processors/batches-management/{id}/advance_stage/
Body: {
    "output_quantity": 95.5,
    "waste_quantity": 2.5,
    "quality_metrics": {
        "moisture": 8.5,
        "purity": 99.2,
        "foreign_matter": 0.5
    },
    "equipment_used": "Cleaner Model XYZ",
    "notes": "Good quality output"
}
```
- Completes current stage log
- Updates batch stage-specific quantity field
- Advances to next stage
- Creates new stage log for next stage
- If last stage, marks batch as 'completed'

#### 4. Record Final Outputs
```
POST /api/processors/batches-management/{id}/record_output/
Body: {
    "oil_extracted_quintals": 35.5,
    "refined_oil_quintals": 34.0,
    "cake_produced_quintals": 58.5,
    "hulls_produced_quintals": 3.0
}
```
- Updates final product quantities on batch
- Used after pressing/refining stages

#### 5. Create Finished Product Inventory
```
POST /api/processors/batches-management/{id}/create_finished_products/
Body: {
    "products": [
        {
            "product_type": "refined_oil",
            "quantity_quintals": 34.0,
            "storage_location": "Tank A1",
            "storage_conditions": "cool_dry",
            "quality_grade": "Premium",
            "packaging_type": "5L bottles",
            "selling_price_per_quintal": 15000.00,
            "notes": "Export quality"
        },
        {
            "product_type": "oil_cake",
            "quantity_quintals": 58.5,
            "storage_location": "Warehouse B",
            "storage_conditions": "ambient",
            "quality_grade": "Standard",
            "packaging_type": "50kg bags"
        }
    ]
}
```
- Creates FinishedProduct entries from completed batch
- Automatically calculates available_quantity
- Sets production_date to current date

#### 6. List/Retrieve/Update/Delete
Standard REST operations available through ViewSet

### Stage Logs
```
GET /api/processors/batches/{batch_id}/stage-logs/
```
Returns all stage logs for a batch with:
- Stage name and display name
- Input/output/waste quantities
- Yield and loss percentages
- Quality metrics
- Operator details
- Equipment used
- Timing information

### Finished Products
```
GET /api/processors/finished-products/
Query params:
    ?status=in_stock
    ?product_type=refined_oil
```
Returns finished product inventory with:
- Product details and quantities
- Storage information
- Quality grades
- Batch information
- Stock status indicators
- Expiry warnings

## Processing Workflow

### Complete Processing Flow:
1. **Create Batch** - Link to procurement lot, set initial quantity
2. **Start Batch** - Begin processing, enters cleaning stage
3. **Stage 1: Cleaning** - Remove impurities
   - Record output, waste, quality (moisture, purity)
4. **Stage 2: Dehulling** - Remove outer shells
   - Record dehulled quantity, hulls produced
5. **Stage 3: Crushing** - Break down seeds
   - Record crushed quantity, quality metrics
6. **Stage 4: Conditioning** - Heat treatment preparation
   - Record conditioned quantity, temperature logs
7. **Stage 5: Pressing** - Extract oil
   - Record oil extracted, cake produced
8. **Stage 6: Filtration** - Remove sediments
   - Record filtered oil quantity, purity
9. **Stage 7: Refining** - Purification process
   - Record refined oil, quality grade
10. **Stage 8: Packaging** - Final packaging
    - Record packaged quantities, packaging details
11. **Create Finished Products** - Add to inventory system

## Quality Metrics Examples

### Cleaning Stage
```json
{
    "moisture_percent": 8.5,
    "purity_percent": 99.2,
    "foreign_matter_percent": 0.5,
    "damaged_seeds_percent": 0.3
}
```

### Pressing Stage
```json
{
    "pressure_bar": 45,
    "temperature_celsius": 60,
    "extraction_rate_percent": 35.5,
    "oil_quality": "Grade A"
}
```

### Refining Stage
```json
{
    "acid_value": 0.5,
    "peroxide_value": 2.0,
    "color_lovibond": "1.5R",
    "clarity": "Clear"
}
```

## Frontend Integration Points

### Dashboard Updates Needed:
1. **Batch List** - Show current_stage and status
2. **Stage Progress Tracker** - Visual progress through 8 stages
3. **Stage Completion Form** - Input quantities and quality metrics
4. **Finished Products Inventory** - Display all products with filters
5. **Quality Analytics** - Charts for yield percentages, quality trends

### Key Components to Build:
- `BatchStageTracker.tsx` - Visual stage progression
- `StageCompletionModal.tsx` - Form to complete a stage
- `FinishedProductsTable.tsx` - Inventory management
- `QualityMetricsChart.tsx` - Quality visualization
- `YieldAnalytics.tsx` - Efficiency metrics

## Migration Status
✅ Models created and migrated
✅ API endpoints implemented
✅ Serializers created with computed fields
✅ URLs configured

## Next Steps
1. Test API endpoints with Postman/Thunder Client
2. Build frontend components for multi-stage tracking
3. Add analytics dashboard for yield analysis
4. Implement quality control workflows
5. Add PDF report generation for batches
6. Create mobile app views for operators

## Benefits
- **Complete Traceability** - Every stage tracked with operator accountability
- **Quality Control** - Stage-wise quality metrics for analysis
- **Yield Optimization** - Identify inefficiencies at each stage
- **Inventory Management** - Finished products tracked separately
- **Compliance Ready** - Detailed logs for regulatory requirements
- **Data-Driven** - Rich data for process improvement
