"""
Core Constants for SeedSync Platform
Indian Oilseed Value Chain Platform
"""

# Status Choices
STATUS_PENDING = 'pending'
STATUS_ACTIVE = 'active'
STATUS_COMPLETED = 'completed'
STATUS_CANCELLED = 'cancelled'
STATUS_REJECTED = 'rejected'

STATUS_CHOICES = [
    (STATUS_PENDING, 'Pending'),
    (STATUS_ACTIVE, 'Active'),
    (STATUS_COMPLETED, 'Completed'),
    (STATUS_CANCELLED, 'Cancelled'),
    (STATUS_REJECTED, 'Rejected'),
]

# Quality Grades for Oilseeds
GRADE_A_PLUS = 'A+'
GRADE_A = 'A'
GRADE_B = 'B'
GRADE_C = 'C'

QUALITY_GRADE_CHOICES = [
    (GRADE_A_PLUS, 'A+ Grade (Premium)'),
    (GRADE_A, 'A Grade (Good)'),
    (GRADE_B, 'B Grade (Average)'),
    (GRADE_C, 'C Grade (Below Average)'),
]

# Payment Status
PAYMENT_PENDING = 'pending'
PAYMENT_PROCESSING = 'processing'
PAYMENT_COMPLETED = 'completed'
PAYMENT_FAILED = 'failed'

PAYMENT_STATUS_CHOICES = [
    (PAYMENT_PENDING, 'Pending'),
    (PAYMENT_PROCESSING, 'Processing'),
    (PAYMENT_COMPLETED, 'Completed'),
    (PAYMENT_FAILED, 'Failed'),
]

# User Roles
ROLE_FARMER = 'farmer'
ROLE_FPO = 'fpo'
ROLE_PROCESSOR = 'processor'
ROLE_RETAILER = 'retailer'
ROLE_LOGISTICS = 'logistics'
ROLE_WAREHOUSE = 'warehouse'
ROLE_GOVERNMENT = 'government'

USER_ROLE_CHOICES = [
    (ROLE_FARMER, 'Farmer (किसान)'),
    (ROLE_FPO, 'FPO (किसान उत्पादक संगठन)'),
    (ROLE_PROCESSOR, 'Processor (प्रोसेसर)'),
    (ROLE_RETAILER, 'Retailer (खुदरा विक्रेता)'),
    (ROLE_LOGISTICS, 'Logistics (रसद)'),
    (ROLE_WAREHOUSE, 'Warehouse (भंडारण)'),
    (ROLE_GOVERNMENT, 'Government Official (सरकारी अधिकारी)'),
]

# Oilseed Types (8 major oilseeds in India)
OILSEED_SOYBEAN = 'soybean'
OILSEED_MUSTARD = 'mustard'
OILSEED_GROUNDNUT = 'groundnut'
OILSEED_SUNFLOWER = 'sunflower'
OILSEED_SAFFLOWER = 'safflower'
OILSEED_SESAME = 'sesame'
OILSEED_LINSEED = 'linseed'
OILSEED_NIGER = 'niger'

OILSEED_CHOICES = [
    (OILSEED_SOYBEAN, 'Soybean (सोयाबीन)'),
    (OILSEED_MUSTARD, 'Mustard (सरसों)'),
    (OILSEED_GROUNDNUT, 'Groundnut (मूंगफली)'),
    (OILSEED_SUNFLOWER, 'Sunflower (सूरजमुखी)'),
    (OILSEED_SAFFLOWER, 'Safflower (कुसुम)'),
    (OILSEED_SESAME, 'Sesame (तिल)'),
    (OILSEED_LINSEED, 'Linseed (अलसी)'),
    (OILSEED_NIGER, 'Niger (रामतिल)'),
]

# Indian States (Major oilseed producing states)
INDIAN_STATES = [
    ('maharashtra', 'Maharashtra'),
    ('madhya_pradesh', 'Madhya Pradesh'),
    ('rajasthan', 'Rajasthan'),
    ('gujarat', 'Gujarat'),
    ('andhra_pradesh', 'Andhra Pradesh'),
    ('telangana', 'Telangana'),
    ('karnataka', 'Karnataka'),
    ('uttar_pradesh', 'Uttar Pradesh'),
    ('haryana', 'Haryana'),
    ('punjab', 'Punjab'),
    ('tamil_nadu', 'Tamil Nadu'),
    ('west_bengal', 'West Bengal'),
    ('odisha', 'Odisha'),
    ('chhattisgarh', 'Chhattisgarh'),
    ('jharkhand', 'Jharkhand'),
    ('bihar', 'Bihar'),
]

# Soil Types
SOIL_CLAY = 'clay'
SOIL_SANDY = 'sandy'
SOIL_LOAMY = 'loamy'
SOIL_BLACK = 'black'
SOIL_RED = 'red'
SOIL_ALLUVIAL = 'alluvial'

SOIL_TYPE_CHOICES = [
    (SOIL_CLAY, 'Clay Soil'),
    (SOIL_SANDY, 'Sandy Soil'),
    (SOIL_LOAMY, 'Loamy Soil'),
    (SOIL_BLACK, 'Black Soil'),
    (SOIL_RED, 'Red Soil'),
    (SOIL_ALLUVIAL, 'Alluvial Soil'),
]

# Lot/Listing Status
LOT_AVAILABLE = 'available'
LOT_BIDDING = 'bidding'
LOT_SOLD = 'sold'
LOT_DELIVERED = 'delivered'
LOT_CANCELLED = 'cancelled'

LOT_STATUS_CHOICES = [
    (LOT_AVAILABLE, 'Available'),
    (LOT_BIDDING, 'Bidding Active'),
    (LOT_SOLD, 'Sold'),
    (LOT_DELIVERED, 'Delivered'),
    (LOT_CANCELLED, 'Cancelled'),
]

# Bid Status
BID_PENDING = 'pending'
BID_ACCEPTED = 'accepted'
BID_REJECTED = 'rejected'
BID_WITHDRAWN = 'withdrawn'

BID_STATUS_CHOICES = [
    (BID_PENDING, 'Pending'),
    (BID_ACCEPTED, 'Accepted'),
    (BID_REJECTED, 'Rejected'),
    (BID_WITHDRAWN, 'Withdrawn'),
]

# Payment Terms
PAYMENT_IMMEDIATE = 'immediate'
PAYMENT_7_DAYS = '7_days'
PAYMENT_15_DAYS = '15_days'
PAYMENT_30_DAYS = '30_days'

PAYMENT_TERMS_CHOICES = [
    (PAYMENT_IMMEDIATE, 'Immediate'),
    (PAYMENT_7_DAYS, '7 Days'),
    (PAYMENT_15_DAYS, '15 Days'),
    (PAYMENT_30_DAYS, '30 Days'),
]

# KYC Status
KYC_PENDING = 'pending'
KYC_VERIFIED = 'verified'
KYC_REJECTED = 'rejected'

KYC_STATUS_CHOICES = [
    (KYC_PENDING, 'Pending'),
    (KYC_VERIFIED, 'Verified'),
    (KYC_REJECTED, 'Rejected'),
]

# Blockchain Action Types
BLOCKCHAIN_CREATED = 'created'
BLOCKCHAIN_PROCURED = 'procured'
BLOCKCHAIN_QUALITY_CHECKED = 'quality_checked'
BLOCKCHAIN_SHIPPED = 'shipped'
BLOCKCHAIN_RECEIVED = 'received'
BLOCKCHAIN_PROCESSED = 'processed'
BLOCKCHAIN_PACKAGED = 'packaged'

BLOCKCHAIN_ACTION_CHOICES = [
    (BLOCKCHAIN_CREATED, 'Lot Created'),
    (BLOCKCHAIN_PROCURED, 'Procured by FPO'),
    (BLOCKCHAIN_QUALITY_CHECKED, 'Quality Checked'),
    (BLOCKCHAIN_SHIPPED, 'Shipped'),
    (BLOCKCHAIN_RECEIVED, 'Received by Processor'),
    (BLOCKCHAIN_PROCESSED, 'Processed'),
    (BLOCKCHAIN_PACKAGED, 'Packaged'),
]

# Season Types
SEASON_KHARIF = 'kharif'
SEASON_RABI = 'rabi'
SEASON_ZAID = 'zaid'

SEASON_CHOICES = [
    (SEASON_KHARIF, 'Kharif (खरीफ) - June to October'),
    (SEASON_RABI, 'Rabi (रबी) - November to March'),
    (SEASON_ZAID, 'Zaid (जायद) - March to June'),
]

# Notification Types
NOTIF_BID_RECEIVED = 'bid_received'
NOTIF_BID_ACCEPTED = 'bid_accepted'
NOTIF_BID_REJECTED = 'bid_rejected'
NOTIF_PAYMENT_COMPLETED = 'payment_completed'
NOTIF_WEATHER_ALERT = 'weather_alert'
NOTIF_PRICE_SPIKE = 'price_spike'

NOTIFICATION_TYPE_CHOICES = [
    (NOTIF_BID_RECEIVED, 'New Bid Received'),
    (NOTIF_BID_ACCEPTED, 'Bid Accepted'),
    (NOTIF_BID_REJECTED, 'Bid Rejected'),
    (NOTIF_PAYMENT_COMPLETED, 'Payment Completed'),
    (NOTIF_WEATHER_ALERT, 'Weather Alert'),
    (NOTIF_PRICE_SPIKE, 'Price Spike Alert'),
]

# Measurement Units
UNIT_QUINTAL = 'quintal'
UNIT_KG = 'kg'
UNIT_TONNE = 'tonne'
UNIT_ACRE = 'acre'
UNIT_HECTARE = 'hectare'

# Currency
CURRENCY_INR = 'INR'

# Phone Number Regex Pattern (India)
PHONE_REGEX = r'^\+?91?[6-9]\d{9}$'

# OTP Settings
OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 10

# Color Palette (Brand Identity)
COLOR_PRIMARY_GREEN = '#437409'
COLOR_SECONDARY_GREEN = '#438602'
COLOR_LIGHT_GREEN = '#c8e686'
