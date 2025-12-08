# 📱 Simple Market Forecasting API Guide

## 🎯 Main Endpoint (Use This!)

### Get Complete Market Forecast

**Endpoint:** `GET /api/advisories/market-forecast/`

**Simple Input - Just one parameter:**
```
?role=farmer
```

**Available Roles:**
- `farmer` - For farmers on mobile app
- `fpo` - For FPO managers on web dashboard
- `processor` - For processors on web dashboard
- `retailer` - For retailers on web dashboard

---

## 📋 Example Usage

### 1. For Farmers (Mobile App)

```bash
GET /api/advisories/market-forecast/?role=farmer
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "role": "farmer",
  "insights": {
    "summary": {
      "total_market_value": "₹10,379,900",
      "average_price": "₹4,072.64 per quintal",
      "total_quantity": "2,548 quintals"
    },
    "price_today": "₹4,072.64 per quintal",
    "price_expected_30_days": "₹4,250.00 per quintal",
    "recommendation": {
      "action": "Wait & Watch",
      "message": "Prices may go UP by 4.4% in next 30 days",
      "suggestion": "Consider holding your crop for better prices",
      "best_time_to_sell": "20-30 days from now"
    },
    "top_crops_by_price": [
      {
        "crop": "soybean",
        "average_price": "₹4,072.64/quintal",
        "market_demand": "54.7% of total market"
      },
      {
        "crop": "mustard",
        "average_price": "₹4,663.39/quintal",
        "market_demand": "27.4% of total market"
      }
    ],
    "seasonal_tip": "Peak demand in rabi season. Rabi season offers 3.8% higher prices.",
    "best_season": "rabi"
  }
}
```

---

### 2. For FPOs (Web Dashboard)

```bash
GET /api/advisories/market-forecast/?role=fpo
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "role": "fpo",
  "insights": {
    "summary": {
      "total_market_value": "₹10,379,900",
      "average_price": "₹4,072.64 per quintal"
    },
    "procurement_forecast": {
      "next_60_days_demand": "15,500 quintals",
      "daily_average_demand": "258 quintals per day",
      "recommendation": "Plan to procure approximately 17,825 quintals (with 15% buffer)"
    },
    "price_trends": {
      "current_average": "₹4,072.64/quintal",
      "expected_in_60_days": "₹4,250.00/quintal",
      "trend": "BULLISH"
    },
    "top_crops_to_focus": [
      {
        "crop": "soybean",
        "demand": "25,000 quintals",
        "price": "₹4,072.00/quintal",
        "market_share": "54.7%"
      }
    ],
    "action_plan": {
      "message": "Focus on crops with high demand and good prices",
      "priority_crops": ["soybean", "mustard", "groundnut"]
    }
  }
}
```

---

### 3. For Processors (Web Dashboard)

```bash
GET /api/advisories/market-forecast/?role=processor
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "role": "processor",
  "insights": {
    "supply_forecast": {
      "next_90_days_supply": "30,000 quintals available",
      "recommended_procurement": "36,000 quintals (with 20% buffer)"
    },
    "price_analysis": {
      "current_price": "₹4,072.64/quintal",
      "price_trend": "BULLISH",
      "price_change_expected": "4.4%"
    },
    "procurement_strategy": {
      "recommendation": "Buy Gradually",
      "reason": "Prices are bullish",
      "best_timing": "Spread over 4-6 weeks"
    },
    "crop_availability": [
      {
        "crop": "soybean",
        "available_quantity": "25,000 quintals",
        "average_price": "₹4,072.00/quintal"
      }
    ]
  }
}
```

---

### 4. For Retailers (Web Dashboard)

```bash
GET /api/advisories/market-forecast/?role=retailer
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "role": "retailer",
  "insights": {
    "product_availability": {
      "next_30_days": "15,500 quintals expected",
      "supply_status": "Sufficient"
    },
    "pricing": {
      "current_market_price": "₹4,072.64/quintal",
      "expected_price_30_days": "₹4,250.00/quintal",
      "price_stability": "Stable"
    },
    "popular_products": [
      {
        "product": "soybean",
        "demand": "54.7% market share",
        "price": "₹4,072.64/quintal"
      }
    ],
    "business_tip": {
      "message": "Stock up on high-demand crops",
      "focus_products": ["soybean", "mustard", "groundnut"]
    }
  }
}
```

---

## 🚀 Quick Insights (Optional Endpoints)

### Quick Price Forecast
```bash
GET /api/advisories/quick/price/
```

**Response:**
```json
{
  "success": true,
  "forecast": {
    "current_price": "₹4,072.64",
    "expected_price_30_days": "₹4,250.00",
    "trend": "BULLISH",
    "change_percentage": "4.4%",
    "recommendation": "HOLD - Prices expected to rise"
  }
}
```

### Quick Demand Forecast
```bash
GET /api/advisories/quick/demand/
```

**Response:**
```json
{
  "success": true,
  "forecast": {
    "current_demand": "245 quintals/day",
    "expected_demand": "258 quintals/day",
    "trend": "INCREASING",
    "total_30_days": "7,740 quintals"
  }
}
```

### Top Crops
```bash
GET /api/advisories/quick/top-crops/
```

**Response:**
```json
{
  "success": true,
  "top_crops": [
    {
      "crop_name": "soybean",
      "demand": "25,000 quintals",
      "price": "₹4,072.64/quintal",
      "market_share": "54.7%"
    }
  ],
  "highest_demand": "soybean",
  "best_price": "mustard"
}
```

---

## 📱 Mobile App Integration (React Native)

```javascript
import { useState, useEffect } from 'react';

const MarketForecast = () => {
  const [forecast, setForecast] = useState(null);
  const userRole = 'farmer'; // Get from user context
  
  useEffect(() => {
    fetch(`/api/advisories/market-forecast/?role=${userRole}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setForecast(data.insights);
      }
    });
  }, []);
  
  if (!forecast) return <Loading />;
  
  return (
    <View>
      <Text style={styles.price}>
        Today's Price: {forecast.price_today}
      </Text>
      
      <Text style={styles.forecast}>
        Expected (30 days): {forecast.price_expected_30_days}
      </Text>
      
      <Card style={styles.recommendation}>
        <Text style={styles.action}>
          {forecast.recommendation.action}
        </Text>
        <Text>{forecast.recommendation.message}</Text>
        <Text>Best Time: {forecast.recommendation.best_time_to_sell}</Text>
      </Card>
      
      <Text style={styles.sectionTitle}>Top Crops</Text>
      {forecast.top_crops_by_price.map(crop => (
        <CropCard key={crop.crop} data={crop} />
      ))}
    </View>
  );
};
```

---

## 💻 Web Dashboard Integration (React/Next.js)

```javascript
const FPODashboard = () => {
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    fetchMarketForecast('fpo').then(setInsights);
  }, []);
  
  return (
    <div className="dashboard">
      <SummaryCards data={insights?.summary} />
      
      <ProcurementCard 
        forecast={insights?.procurement_forecast}
        prices={insights?.price_trends}
      />
      
      <CropsTable crops={insights?.top_crops_to_focus} />
      
      <ActionPlan plan={insights?.action_plan} />
    </div>
  );
};
```

---

## ⚠️ Error Handling

**Invalid Role:**
```json
{
  "success": false,
  "message": "Please provide role. Choose from: farmer, fpo, processor, retailer",
  "example": "/api/advisories/market-forecast/?role=farmer"
}
```

**No Data:**
```json
{
  "success": false,
  "message": "No market data available yet. Please check back later."
}
```

---

## ✅ Key Benefits

1. **Simple** - Just one parameter (`role`)
2. **All Crops** - Shows insights for ALL crops automatically
3. **Easy to Understand** - Plain language, no jargon
4. **Role-Specific** - Tailored insights for each user type
5. **Mobile & Web Ready** - JSON format works everywhere
6. **Actionable** - Clear recommendations for decision-making

---

## 🎯 What Each Role Gets

| Role | Key Insights |
|------|-------------|
| **Farmer** | Price forecast, when to sell, top crops by price |
| **FPO** | Procurement planning, demand forecast, price trends |
| **Processor** | Supply availability, procurement strategy, timing |
| **Retailer** | Product availability, price stability, popular products |

---

## 📞 Support

All insights are based on real market data from:
- ✅ Marketplace orders
- ✅ Procurement lots
- ✅ Processing batches

**Forecast Updates:** Daily  
**Historical Data:** 365 days  
**Forecast Horizon:** 30-90 days (role-dependent)
