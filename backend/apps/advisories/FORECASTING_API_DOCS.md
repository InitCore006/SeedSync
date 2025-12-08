# Market Forecasting System - API Documentation

## 🎯 Overview

This forecasting system provides **6 key market analyses** using ARIMA models on real-time market data:

1. **Quantity Forecasting** - Predict future demand
2. **Price Forecasting** - Predict price trends
3. **Seasonal Analysis** - Rabi vs Kharif patterns
4. **Crop-wise Analysis** - Top crops by demand and price
5. **State-wise Analysis** - Geographic supply/demand
6. **Buyer Behavior Analysis** - Who buys what

---

## 📡 API Endpoints

### 1. Comprehensive Market Forecast (Recommended)

**GET** `/api/advisories/market-forecast/`

Get all 6 analyses in one API call, customized by role.

**Query Parameters:**
- `role` (required): `farmer` | `fpo` | `processor` | `retailer`
- `crop_type` (optional): `soybean`, `mustard`, `groundnut`, etc.
- `state` (optional): Filter by state
- `days_back` (optional): Historical data days (default: 365)

**Example Request:**
```bash
GET /api/advisories/market-forecast/?role=farmer&crop_type=soybean
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "role": "farmer",
  "data_summary": {
    "total_transactions": 1250,
    "total_quantity_quintals": 45678.5,
    "avg_price_per_quintal": 4072.64,
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-09"
    }
  },
  "forecast": {
    "price_forecast": {
      "forecast_values": [4100, 4120, 4150, ...],
      "forecast_dates": ["2024-12-10", "2024-12-11", ...],
      "current_price": 4072.64,
      "forecast_avg_price": 4250.50,
      "price_change_percent": 4.37,
      "trend": "bullish",
      "recommendation": "HOLD - Prices expected to rise"
    },
    "seasonal_insights": {
      "rabi": {
        "total_quantity": 28500.5,
        "avg_price": 4100.00,
        "transaction_count": 750
      },
      "kharif": {
        "total_quantity": 17178.0,
        "avg_price": 3950.00,
        "transaction_count": 500
      },
      "peak_season": "rabi",
      "recommendation": "Peak demand in rabi season. Rabi season offers 3.8% higher prices."
    },
    "top_crops": {
      "top_crops": [
        {
          "crop_type": "soybean",
          "total_quantity": 25000.0,
          "avg_price": 4072.00,
          "market_share_percent": 54.7
        },
        {
          "crop_type": "mustard",
          "total_quantity": 12500.0,
          "avg_price": 4500.00,
          "market_share_percent": 27.4
        }
      ],
      "highest_demand_crop": "soybean",
      "highest_price_crop": "mustard"
    },
    "buyer_preferences": {
      "buyer_types": [
        {
          "buyer_type": "processor",
          "total_quantity": 30000.0,
          "avg_price": 4050.00,
          "market_share_percent": 65.7
        },
        {
          "buyer_type": "retailer",
          "total_quantity": 15678.5,
          "market_share_percent": 34.3
        }
      ],
      "dominant_buyer": "processor"
    },
    "actionable_recommendation": {
      "action": "HOLD",
      "reason": "Prices expected to increase by 4.4% in next 30 days",
      "best_selling_window": "20-30 days from now",
      "expected_price_range": "₹4250.50/quintal"
    }
  }
}
```

---

### 2. Quantity Forecast

**GET** `/api/advisories/forecast/quantity/`

**Query Parameters:**
- `days_ahead` (optional): Forecast horizon (default: 30)
- `crop_type` (optional): Filter by crop
- `state` (optional): Filter by state

**Example:**
```bash
GET /api/advisories/forecast/quantity/?days_ahead=60&crop_type=soybean
```

**Response:**
```json
{
  "success": true,
  "analysis_type": "quantity_forecast",
  "forecast": {
    "forecast_values": [250.5, 275.3, 290.1, ...],
    "forecast_dates": ["2024-12-10", "2024-12-11", ...],
    "current_trend": "increasing",
    "total_forecast_demand": 15500.0,
    "avg_daily_demand": 258.33,
    "current_avg_demand": 245.67
  }
}
```

---

### 3. Price Forecast

**GET** `/api/advisories/forecast/price/`

**Query Parameters:**
- `days_ahead` (optional): Forecast horizon (default: 30)
- `crop_type` (optional): Filter by crop
- `state` (optional): Filter by state

**Example:**
```bash
GET /api/advisories/forecast/price/?crop_type=mustard&days_ahead=30
```

**Response:**
```json
{
  "success": true,
  "analysis_type": "price_forecast",
  "forecast": {
    "forecast_values": [4500, 4520, 4550, ...],
    "forecast_dates": ["2024-12-10", ...],
    "current_price": 4463.39,
    "forecast_avg_price": 4650.00,
    "price_change_percent": 4.18,
    "trend": "bullish",
    "recommendation": "HOLD - Prices expected to rise",
    "volatility": 125.50
  }
}
```

---

### 4. Seasonal Analysis

**GET** `/api/advisories/analysis/seasonal/`

**Query Parameters:**
- `crop_type` (optional)
- `state` (optional)

**Response:**
```json
{
  "success": true,
  "analysis_type": "seasonal_analysis",
  "analysis": {
    "rabi": {
      "total_quantity": 28500.5,
      "avg_price": 4100.00,
      "transaction_count": 750
    },
    "kharif": {
      "total_quantity": 17178.0,
      "avg_price": 3950.00,
      "transaction_count": 500
    },
    "peak_season": "rabi",
    "price_comparison": "Rabi season offers 3.8% higher prices",
    "recommendation": "Peak demand in rabi season..."
  }
}
```

---

### 5. Crop-wise Analysis

**GET** `/api/advisories/analysis/crop-wise/`

**Query Parameters:**
- `state` (optional)
- `top_n` (optional): Number of top crops (default: 5)

**Response:**
```json
{
  "success": true,
  "analysis_type": "crop_wise_analysis",
  "analysis": {
    "top_crops": [
      {
        "crop_type": "soybean",
        "total_quantity": 25000.0,
        "avg_price": 4072.00,
        "total_value": 101800000.0,
        "transaction_count": 620,
        "market_share_percent": 54.7
      }
    ],
    "highest_demand_crop": "soybean",
    "highest_price_crop": "mustard",
    "total_crops": 8
  }
}
```

---

### 6. State-wise Analysis

**GET** `/api/advisories/analysis/state-wise/`

**Query Parameters:**
- `crop_type` (optional)
- `top_n` (optional): Number of top states (default: 5)

**Response:**
```json
{
  "success": true,
  "analysis_type": "state_wise_analysis",
  "analysis": {
    "top_states": [
      {
        "state": "Maharashtra",
        "total_quantity": 15000.0,
        "avg_price": 4072.00,
        "market_share_percent": 32.8
      },
      {
        "state": "Madhya Pradesh",
        "total_quantity": 12000.0,
        "avg_price": 4100.00,
        "market_share_percent": 26.3
      }
    ],
    "total_states": 12,
    "top_3_concentration_percent": 72.5,
    "highest_supply_state": "Maharashtra",
    "highest_price_state": "Rajasthan"
  }
}
```

---

### 7. Buyer Behavior Analysis

**GET** `/api/advisories/analysis/buyer-behavior/`

**Query Parameters:**
- `crop_type` (optional)
- `state` (optional)

**Response:**
```json
{
  "success": true,
  "analysis_type": "buyer_behavior_analysis",
  "analysis": {
    "buyer_types": [
      {
        "buyer_type": "processor",
        "total_quantity": 30000.0,
        "avg_price": 4050.00,
        "transaction_count": 450,
        "market_share_percent": 65.7,
        "avg_order_size": 66.67
      },
      {
        "buyer_type": "retailer",
        "total_quantity": 10000.0,
        "avg_price": 4250.00,
        "market_share_percent": 21.9
      }
    ],
    "dominant_buyer": "processor",
    "highest_paying_buyer": "retailer",
    "recommendation": "processors are the largest buyers. retailers offer best prices."
  }
}
```

---

## 🎭 Role-Based Usage

### For Farmers 👨‍🌾

```bash
# Get farmer-specific insights
GET /api/advisories/market-forecast/?role=farmer&crop_type=soybean

# Focus: Price forecast, seasonal timing, when to sell
```

**Key Insights:**
- Price trend (bullish/bearish)
- Best selling window
- Quality premium analysis
- Buyer preferences

---

### For FPOs 🏢

```bash
# Get FPO procurement insights
GET /api/advisories/market-forecast/?role=fpo&state=Maharashtra

# Focus: Demand forecast, procurement planning
```

**Key Insights:**
- 60-day demand forecast
- Procurement recommendations
- State-wise supply analysis
- Buyer demand patterns

---

### For Processors 🏭

```bash
# Get processor supply insights
GET /api/advisories/market-forecast/?role=processor&crop_type=soybean

# Focus: Supply availability, procurement timing
```

**Key Insights:**
- 90-day supply forecast
- Price trends
- Procurement strategy (aggressive/gradual)
- State-wise supply sources

---

### For Retailers 🛒

```bash
# Get retailer market insights
GET /api/advisories/market-forecast/?role=retailer

# Focus: Product availability, price stability
```

**Key Insights:**
- 30-day availability forecast
- Price trends
- Seasonal insights

---

## 📊 Data Visualization Examples

### Frontend Integration (React/Next.js)

```javascript
// Example: Fetch farmer forecast
const fetchFarmerForecast = async (cropType) => {
  const response = await fetch(
    `/api/advisories/market-forecast/?role=farmer&crop_type=${cropType}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  // Extract price forecast for chart
  const priceChart = {
    dates: data.forecast.price_forecast.forecast_dates,
    prices: data.forecast.price_forecast.forecast_values,
    trend: data.forecast.price_forecast.trend
  };
  
  // Show recommendation
  const recommendation = data.forecast.actionable_recommendation;
  console.log(recommendation.action); // "HOLD" or "SELL NOW"
  console.log(recommendation.reason);
  
  return data;
};
```

---

### Mobile App Integration (React Native)

```javascript
// Example: Display forecast for farmer
import { LineChart } from 'react-native-chart-kit';

const FarmerDashboard = () => {
  const [forecast, setForecast] = useState(null);
  
  useEffect(() => {
    fetchMarketForecast('farmer', 'soybean')
      .then(data => setForecast(data));
  }, []);
  
  if (!forecast) return <Loading />;
  
  const priceData = forecast.forecast.price_forecast;
  
  return (
    <View>
      <Text style={styles.price}>
        Current Price: ₹{priceData.current_price}/quintal
      </Text>
      
      <Text style={styles.forecast}>
        Forecast (30 days): ₹{priceData.forecast_avg_price}/quintal
      </Text>
      
      <Badge color={priceData.trend === 'bullish' ? 'green' : 'red'}>
        {priceData.trend.toUpperCase()}
      </Badge>
      
      <LineChart
        data={{
          labels: priceData.forecast_dates.slice(0, 10),
          datasets: [{ data: priceData.forecast_values.slice(0, 10) }]
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
      />
      
      <RecommendationCard
        action={forecast.forecast.actionable_recommendation.action}
        reason={forecast.forecast.actionable_recommendation.reason}
      />
    </View>
  );
};
```

---

## 🔒 Authentication

All endpoints require authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## ⚠️ Error Handling

**Common Errors:**

1. **No Data Available (404)**
```json
{
  "error": "No market data available for the given filters",
  "filters": {"crop_type": "soybean", "state": "Gujarat"}
}
```

2. **Invalid Role (400)**
```json
{
  "error": "Role is required. Must be one of: farmer, fpo, processor, retailer"
}
```

3. **Insufficient Data**
```json
{
  "error": "Insufficient data for forecasting. Need at least 30 days."
}
```

---

## 🚀 Best Practices

1. **Cache Results**: Forecast data changes daily, cache for 24 hours
2. **Batch Requests**: Use comprehensive endpoint instead of individual ones
3. **Filter Wisely**: Use crop_type and state filters for better accuracy
4. **Handle Errors**: Always check for `error` key in response
5. **Update Frequency**: Refresh forecasts daily, not real-time

---

## 📈 Accuracy Notes

- **ARIMA Models**: Optimized for oilseed market patterns
- **Confidence Intervals**: Provided in forecast responses
- **Historical Data**: Minimum 30 days for basic forecast, 90+ days recommended
- **Seasonal Patterns**: Requires at least 6 months data for accurate seasonal analysis

---

## 🛠 Technical Details

**Models Used:**
- ARIMA(5,1,2) for quantity forecasting
- ARIMA(3,1,2) for price forecasting
- Statistical aggregation for other analyses

**Data Sources:**
- Marketplace orders (primary)
- Procurement lots (supplementary)
- Processing batches (processor demand)

**Update Frequency:**
- Real-time data extraction
- Daily forecast updates recommended
