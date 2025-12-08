# 🌿 Dual-Mode Oilseed Crop Recommendation System

## Overview
AI-powered crop recommendation system using Gemini API with two intelligent modes for recommending the best oilseed crop from 8 specific crops.

---

## 🎯 Supported Oilseed Crops (Exactly 8)

```
1. groundnut
2. sesame
3. mustard/rapeseed
4. linseed
5. niger
6. sunflower
7. safflower
8. castor
```

---

## 🌱 MODE 1: Auto Recommendation (Zero User Input)

### Input Required
- **None** - Completely automatic

### Auto-Detected Data
- ✅ State & City (from user profile)
- ✅ Season (auto-calculated from system month)
- ✅ District (Gemini maps City → District)
- ✅ Soil values (Gemini infers based on region)
- ✅ Climate values (Gemini infers based on region)

### Season Detection Logic
```
June-October    → kharif
November-February → rabi
March-May      → both possible
```

### Gemini Inference
- Soil pH
- Organic Carbon %
- Nitrogen (kg/ha)
- Phosphorus (kg/ha)
- Potassium (kg/ha)
- Irrigation %
- Rainfall (mm)
- Temperature (°C)

---

## 📋 MODE 2: Soil Card Based Recommendation

### Input Required from User
| Parameter | Required | Example |
|-----------|----------|---------|
| Soil pH | ✅ Yes | 6.5 |
| Nitrogen (kg/ha) | ✅ Yes | 250 |
| Phosphorus (kg/ha) | ✅ Yes | 30 |
| Potassium (kg/ha) | ✅ Yes | 200 |
| Organic Carbon % | ❓ Optional | 0.5 |

### Auto-Detected Data
- ✅ State & City (from profile)
- ✅ Season (from system date)
- ✅ District (Gemini mapping)
- ✅ Irrigation (Gemini infers if missing)
- ✅ Climate data (Gemini infers)

### Smart Fallback
- If Organic Carbon not provided → Gemini infers
- Gemini uses actual soil values when provided
- Fills missing values intelligently based on location

---

## 🤖 Gemini API Integration

### Prompt Structure
```
You are an agricultural intelligence engine specializing only in Indian oilseed crops.

Your role is to determine the best crop out of the following 8:
[groundnut, sesame, mustard/rapeseed, linseed, niger, sunflower, safflower, castor]

📍 USER CONTEXT
State: <STATE>
City: <CITY>
Mode: <AUTO | SOIL_CARD>

Soil Card Inputs (if provided):
- Soil pH: <SOIL_PH or null>
- Nitrogen (kg/ha): <N or null>
- Phosphorus (kg/ha): <P or null>
- Potassium (kg/ha): <K or null>
- Organic Carbon %: <OC or null>

🌱 Rules for Processing:

1. City → District Mapping
2. Season Detection
3. Soil and Climate Data Extraction
4. Crop Evaluation Logic
5. Output Must Be Pure JSON
```

### Response Format
```json
{
  "district": "string",
  "season": "kharif | rabi | both",
  "mode_used": "auto | soil_card",
  "soil_data": {
    "ph": 6.5,
    "organic_carbon_pct": 0.5,
    "nitrogen_kg_ha": 250,
    "phosphorus_kg_ha": 30,
    "potassium_kg_ha": 200,
    "irrigation_pct": 60,
    "rainfall_mm": 800,
    "temperature_c": 28.5
  },
  "recommended_crop": "groundnut",
  "confidence": 85,
  "reasoning": "brief explanation"
}
```

---

## 🎨 User Interface

### Mode Selection Screen
- **Auto Mode Button**: ⚡ "AI infers everything"
- **Soil Card Button**: 📋 "Use soil test data"

### Auto-Detected Information
- 📍 Location: City, State (from profile)
- 📅 Season: Auto-detected from current date

### Soil Card Input Form (Mode 2 Only)
- Text inputs for pH, N, P, K
- Optional Organic Carbon input
- Helpful placeholders and validation

### Results Display
- 🌿 Recommended crop name
- 📊 Confidence score (0-100%)
- 📍 District mapping
- 📅 Season compatibility
- 🔬 Soil & Climate data (expandable)
- 💡 AI reasoning
- 🔄 Reset button

---

## 🔧 Implementation Details

### Key Functions

#### `getCurrentSeason()`
```typescript
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 2) return 'rabi';
  return 'both';
};
```

#### `handleGetRecommendations()`
- Validates location data
- Validates soil card inputs (if mode = soil_card)
- Builds Gemini prompt dynamically
- Calls `geminiService.generateJSON()`
- Validates response (crop must be one of 8)
- Updates state with recommendation

### State Management
```typescript
const [mode, setMode] = useState<'auto' | 'soil_card'>('auto');
const [location, setLocation] = useState({ city: '', state: '' });
const [soilPH, setSoilPH] = useState('');
const [nitrogen, setNitrogen] = useState('');
const [phosphorus, setPhosphorus] = useState('');
const [potassium, setPotassium] = useState('');
const [organicCarbon, setOrganicCarbon] = useState('');
const [recommendation, setRecommendation] = useState<GeminiRecommendationResponse | null>(null);
```

---

## ✅ Validation & Error Handling

### Auto Mode Validation
- ✅ State must be present
- ✅ City must be present

### Soil Card Mode Validation
- ✅ All above + pH, N, P, K required
- ✅ Organic Carbon optional (Gemini will infer)

### Response Validation
```typescript
if (!OILSEED_CROPS.includes(response.recommended_crop)) {
  throw new Error('Invalid crop recommendation received');
}
```

### Error Handling
- Alert dialogs for missing location
- Alert for missing soil data
- Try-catch with user-friendly error messages
- Gemini API error handling

---

## 📱 User Experience Flow

### Auto Mode Flow
1. User taps "Get Recommendation"
2. System auto-detects season
3. Gemini infers all soil/climate data
4. Displays: Crop + Confidence + Reasoning
5. User can view detailed soil data
6. Reset to try again

### Soil Card Mode Flow
1. User switches to Soil Card mode
2. Enters pH, N, P, K values
3. Optionally enters Organic Carbon
4. Taps "Get Recommendation"
5. Gemini uses actual values + infers missing
6. Displays: Crop + Confidence + Reasoning
7. User can view all data points
8. Reset to try different values

---

## 🎯 Gemini Evaluation Logic

Gemini considers:
- ✅ Water requirement vs irrigation
- ✅ Soil tolerance (pH, NPK, OC)
- ✅ Rainfall suitability
- ✅ Temperature preference
- ✅ Season compatibility
- ✅ Regional best practices
- ✅ Soil type matching

---

## 🚀 Benefits

### For Farmers
- Zero-input smart recommendation
- Science-based soil card integration
- Season-aware suggestions
- Location-specific advice
- High confidence scoring

### For System
- Flexible dual-mode approach
- Intelligent fallback mechanisms
- Accurate district mapping
- Realistic data inference
- Pure JSON responses (no parsing errors)

---

## 📊 Sample Outputs

### Auto Mode Example
```json
{
  "district": "Anantapur",
  "season": "kharif",
  "mode_used": "auto",
  "soil_data": {
    "ph": 7.2,
    "organic_carbon_pct": 0.4,
    "nitrogen_kg_ha": 200,
    "phosphorus_kg_ha": 25,
    "potassium_kg_ha": 180,
    "irrigation_pct": 40,
    "rainfall_mm": 550,
    "temperature_c": 29.0
  },
  "recommended_crop": "groundnut",
  "confidence": 88,
  "reasoning": "Groundnut thrives in red sandy loam soils of Anantapur with moderate rainfall and warm temperatures during kharif season. High drought tolerance matches low irrigation availability."
}
```

### Soil Card Mode Example
```json
{
  "district": "Nalgonda",
  "season": "rabi",
  "mode_used": "soil_card",
  "soil_data": {
    "ph": 6.5,
    "organic_carbon_pct": 0.6,
    "nitrogen_kg_ha": 250,
    "phosphorus_kg_ha": 35,
    "potassium_kg_ha": 220,
    "irrigation_pct": 70,
    "rainfall_mm": 300,
    "temperature_c": 22.0
  },
  "recommended_crop": "mustard/rapeseed",
  "confidence": 92,
  "reasoning": "Mustard is ideal for rabi season with cooler temperatures. Your soil's optimal pH 6.5 and high NPK levels support excellent mustard cultivation. Good irrigation ensures consistent growth."
}
```

---

## 🔄 Future Enhancements

- [ ] Multi-crop ranking (top 3)
- [ ] Variety-specific recommendations
- [ ] Yield predictions
- [ ] Cost-benefit analysis
- [ ] Market price integration
- [ ] Historical crop performance
- [ ] Weather forecast integration
- [ ] Pest/disease risk assessment

---

## 📝 Notes

- **City is used instead of District** in user input (more familiar to farmers)
- **Gemini maps City → District** automatically
- **Season is always auto-detected** (not user-selectable)
- **Organic Carbon is truly optional** (Gemini infers intelligently)
- **Response must be valid JSON** (no markdown, no extra text)
- **Crop name must match exactly** from the 8-crop list

---

## 🎓 Technical Stack

- **Framework**: React Native (Expo)
- **AI Engine**: Google Gemini 2.0 Flash (JSON mode)
- **State Management**: React useState
- **API Service**: geminiService.generateJSON()
- **UI Components**: Custom React Native components
- **Validation**: Real-time form validation
- **Error Handling**: User-friendly Alert dialogs
