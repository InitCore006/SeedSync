# 🚀 SeedSync Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Setup Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Create Sample Data
```bash
python seed_data.py
```

### Step 4: Create Admin User
```bash
python manage.py createsuperuser
```

### Step 5: Run Server
```bash
python manage.py runserver
```

Server will start at: `http://localhost:8000`

---

## 🧪 Test Immediately

### Test 1: Login as Farmer
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+919876543200", "password": "farmer123"}'
```

Copy the `access` token from response.

### Test 2: Get Market Prices
```bash
curl -X GET "http://localhost:8000/api/farmers/market-prices/?crop_type=soybean" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 3: Get Government Dashboard
```bash
curl -X GET http://localhost:8000/api/government/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test 4: Generate QR Code
```bash
curl -X POST http://localhost:8000/api/blockchain/generate-qr/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lot_id": "LOT_UUID_HERE"}'
```

---

## 📱 Test Credentials

| Role | Phone | Password |
|------|-------|----------|
| Farmer | +919876543200 | farmer123 |
| FPO | +919876000001 | fpo123 |
| Government | +919876000002 | gov123 |

---

## 🎯 Key Endpoints to Demo

### For Judges (Government Dashboard):
```bash
GET /api/government/dashboard/
GET /api/government/heatmap/
GET /api/government/fpo-monitoring/
```

### For Blockchain Demo:
```bash
POST /api/blockchain/generate-qr/
GET /api/blockchain/trace/{lot_number}/
```

### For AI Features:
```bash
POST /api/farmers/disease-detection/
POST /api/farmers/yield-prediction/
```

### For Market Intelligence:
```bash
GET /api/farmers/market-prices/
GET /api/crops/price-trend/?crop_type=soybean
GET /api/advisories/weather/
```

---

## 📊 Admin Panel

Access at: `http://localhost:8000/admin/`

Use superuser credentials created in Step 4.

---

## 🔍 Explore APIs

Full documentation: `API_DOCUMENTATION.md`

Interactive testing: Use Postman or curl

---

## ⚠️ Troubleshooting

### Issue: Migration errors
```bash
python manage.py makemigrations --empty appname
python manage.py migrate --fake
```

### Issue: Port already in use
```bash
python manage.py runserver 8001
```

### Issue: CORS errors
Check `config/settings.py` - CORS is enabled by default

---

## 🎬 Demo Flow

1. **Show Government Dashboard** - Impress judges first!
2. **Show Blockchain Traceability** - Scan QR, view journey
3. **Show Farmer Features** - Market prices, weather, AI
4. **Show FPO Dashboard** - Analytics and procurement
5. **Show Complete Flow** - Farmer creates lot → FPO bids → Accept

---

## 💡 Pro Tips

- Use Admin panel to quickly view/modify data
- Check `seed_data.py` for sample data
- All APIs return consistent JSON format
- JWT tokens in Authorization header
- Filter params in query string

---

## 🏆 Hackathon Ready!

✅ All APIs working  
✅ Sample data loaded  
✅ Documentation complete  
✅ Easy to demo  

**Good luck!** 🚀
