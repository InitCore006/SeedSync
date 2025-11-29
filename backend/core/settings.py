"""
Django settings for SeedSync - AI-Enabled Oilseed Value Chain Platform
Smart India Hackathon 2024
Ministry of Agriculture & Farmers Welfare

Development Configuration
"""

from pathlib import Path
from datetime import timedelta
from decouple import config
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================================================================
# SECURITY SETTINGS
# ==============================================================================

SECRET_KEY = config('SECRET_KEY', default='django-insecure-e(b24%-m=n!p-*862zv&aefvdo%$7q1q+web5kq)$k931l+f+o')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '10.0.2.2',          # Android emulator
    '192.168.176.1',     # Your local network IP
    '*',                 # Allow all (DEVELOPMENT ONLY)
]

# ==============================================================================
# APPLICATION DEFINITION
# ==============================================================================

INSTALLED_APPS = [
    # Django Admin Theme (Keep at top)
    'adminlte3',
    'adminlte3_theme',
    
    # Django Core Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'django.contrib.gis',  # GeoDjango for spatial data
    
    # Third-party Apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # For token rotation
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_filters',
    'corsheaders',

    # ==============================================================================
    # CORE FOUNDATION APPS (Phase 1)
    # ==============================================================================
    'apps.users',
    'apps.farmers',
    'apps.fpos',  # Farmer Producer Organizations
    'apps.crops',
    'apps.advisories',
    
    # ==============================================================================
    # AI & ANALYTICS APPS (Phase 1)
    # ==============================================================================
    'apps.demand_supply',
    'apps.analytics',
    
    # ==============================================================================
    # OPERATIONS & SUPPLY CHAIN APPS (Phase 2)
    # ==============================================================================
    'apps.procurement',
    'apps.logistics',
    'apps.warehouses',
    'apps.processing',
    
    # ==============================================================================
    # INNOVATION & DIFFERENTIATION APPS (Phase 3)
    # ==============================================================================
    'apps.blockchain',
    'apps.marketplace',
    'apps.finance',
    'apps.policy_dashboard',
    
    # ==============================================================================
    # SUPPORT & INTEGRATION APPS (Phase 4)
    # ==============================================================================
    'apps.notifications',
    'apps.integrations',
    'apps.compliance',  # Optional
]

# ==============================================================================
# MIDDLEWARE CONFIGURATION
# ==============================================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For serving static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# ==============================================================================
# TEMPLATES CONFIGURATION
# ==============================================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================

# Development: SQLite
# Production: Switch to PostgreSQL with PostGIS
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Uncomment for PostgreSQL + PostGIS (Production-ready)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.contrib.gis.db.backends.postgis',
#         'NAME': config('DB_NAME', default='seedsync_db'),
#         'USER': config('DB_USER', default='postgres'),
#         'PASSWORD': config('DB_PASSWORD', default='postgres'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }

# ==============================================================================
# PASSWORD VALIDATION
# ==============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==============================================================================
# INTERNATIONALIZATION
# ==============================================================================

LANGUAGE_CODE = 'en-in'  # Indian English

TIME_ZONE = 'Asia/Kolkata'  # IST

USE_I18N = True

USE_L10N = True

USE_TZ = True

# ==============================================================================
# STATIC FILES CONFIGURATION
# ==============================================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Serve static files with Whitenoise (production-ready)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ==============================================================================
# MEDIA FILES CONFIGURATION
# ==============================================================================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Subdirectories for organized media storage
MEDIA_SUBDIRS = {
    'PROFILE_PICS': 'profiles/',
    'KYC_DOCUMENTS': 'kyc/',
    'FARM_PHOTOS': 'farms/',
    'CROP_IMAGES': 'crops/',
    'PEST_DETECTION': 'pest_detection/',
    'PRODUCT_IMAGES': 'products/',
    'CERTIFICATES': 'certificates/',
    'FPO_DOCUMENTS': 'fpo_docs/',
    'CONTRACTS': 'contracts/',
}

# ==============================================================================
# CUSTOM USER MODEL
# ==============================================================================


AUTH_USER_MODEL = 'users.User'

# ==============================================================================
# REST FRAMEWORK CONFIGURATION
# ==============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # For browsable API
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'MAX_PAGE_SIZE': 100,
    
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    
    # Date/Time formatting
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
    'DATE_FORMAT': '%Y-%m-%d',
    'TIME_FORMAT': '%H:%M:%S',
    
    # Schema generation
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    
    # Throttling (API rate limiting)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
    
    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    
    # Renderer classes
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # Development only
    ],
}

# ==============================================================================
# SIMPLE JWT CONFIGURATION (Token Authentication)
# ==============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),  # Shorter for security
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'seedsync-api',
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    # Custom claims
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    'JTI_CLAIM': 'jti',
    
    # Token blacklist
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(hours=12),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=30),
}

# ==============================================================================
# CORS CONFIGURATION (Cross-Origin Resource Sharing)
# ==============================================================================

# Development: Allow all origins
CORS_ALLOW_ALL_ORIGINS = True  # DEVELOPMENT ONLY

# Production: Uncomment and specify exact origins
# CORS_ALLOWED_ORIGINS = [
#     "https://seedsync.in",
#     "https://www.seedsync.in",
#     "https://admin.seedsync.in",
# ]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # React dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:8081",      # Expo mobile app
    "http://192.168.176.1:8000",  # Your local IP
    "http://10.0.2.2:8000",       # Android emulator
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==============================================================================
# CSRF CONFIGURATION
# ==============================================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8081",
    "http://10.0.2.2:8000",
    "http://192.168.176.1:8000",
    "http://localhost:5173",
    "http://localhost:3000",
]

# ==============================================================================
# ADMIN INTERFACE CONFIGURATION
# ==============================================================================

X_FRAME_OPTIONS = 'SAMEORIGIN'
SILENCED_SYSTEM_CHECKS = ['security.W019']

# ==============================================================================
# DRF SPECTACULAR (API DOCUMENTATION)
# ==============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'SeedSync API - AI-Enabled Oilseed Value Chain Platform',
    'DESCRIPTION': '''
    API documentation for SeedSync platform developed for Smart India Hackathon 2024.
    
    **Features:**
    - JWT Authentication
    - Role-based access control (Farmer, FPO, Processor, Retailer, Government)
    - AI-powered advisories and forecasting
    - Blockchain traceability
    - Complete supply chain management
    
    **Mobile App:** Farmer-specific features available via mobile interface
    ''',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
    'SWAGGER_UI_DIST': 'SIDECAR',
    'SWAGGER_UI_FAVICON_HREF': 'SIDECAR',
    'REDOC_DIST': 'SIDECAR',
    'TAGS': [
        {'name': 'Authentication', 'description': 'User authentication and authorization'},
        {'name': 'Farmers', 'description': 'Farmer management (Mobile App)'},
        {'name': 'FPOs', 'description': 'Farmer Producer Organizations'},
        {'name': 'Crops', 'description': 'Crop master data and pricing'},
        {'name': 'Advisories', 'description': 'AI-powered crop advisories'},
        {'name': 'Demand & Supply', 'description': 'Market forecasting'},
        {'name': 'Procurement', 'description': 'Purchase orders and bidding'},
        {'name': 'Logistics', 'description': 'Transportation and delivery'},
        {'name': 'Warehouses', 'description': 'Storage and inventory'},
        {'name': 'Processing', 'description': 'Processing unit management'},
        {'name': 'Blockchain', 'description': 'Traceability and transparency'},
        {'name': 'Marketplace', 'description': 'Direct farmer-to-market'},
        {'name': 'Finance', 'description': 'Credit, insurance, and subsidies'},
        {'name': 'Policy Dashboard', 'description': 'Government analytics'},
        {'name': 'Notifications', 'description': 'Multi-channel alerts'},
    ],
}


# ==============================================================================
# LOGGING CONFIGURATION
# ==============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'seedsync.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

# ==============================================================================
# EMAIL CONFIGURATION (For notifications)
# ==============================================================================

EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'  # Development
)

# For production, use SMTP
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
# EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
# EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
# DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@seedsync.in')

# ==============================================================================
# SMS CONFIGURATION (Twilio/MSG91)
# ==============================================================================

SMS_BACKEND = config('SMS_BACKEND', default='mock')  # mock, twilio, msg91
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')

# ==============================================================================
# EXTERNAL API KEYS (Store in .env file)
# ==============================================================================

# Weather APIs
OPENWEATHER_API_KEY = config('OPENWEATHER_API_KEY', default='')
IMD_API_KEY = config('IMD_API_KEY', default='')

# Satellite Data
BHUVAN_API_KEY = config('BHUVAN_API_KEY', default='')

# Payment Gateway
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')

# Map Services
GOOGLE_MAPS_API_KEY = config('GOOGLE_MAPS_API_KEY', default='')

# Government APIs
AGRISTACK_API_KEY = config('AGRISTACK_API_KEY', default='')
ENAM_API_KEY = config('ENAM_API_KEY', default='')

# ==============================================================================
# AI/ML MODEL PATHS
# ==============================================================================

ML_MODELS_DIR = BASE_DIR / 'ml_models'
ML_MODELS_DIR.mkdir(exist_ok=True)

ML_MODEL_PATHS = {
    'PRICE_FORECAST': ML_MODELS_DIR / 'price_forecast_model.pkl',
    'PEST_DETECTION': ML_MODELS_DIR / 'pest_detection_model.h5',
    'YIELD_PREDICTION': ML_MODELS_DIR / 'yield_prediction_model.pkl',
    'CREDIT_SCORING': ML_MODELS_DIR / 'credit_scoring_model.pkl',
}

# ==============================================================================
# BLOCKCHAIN CONFIGURATION
# ==============================================================================

BLOCKCHAIN_NETWORK = config('BLOCKCHAIN_NETWORK', default='local')  # local, testnet, mainnet
BLOCKCHAIN_PROVIDER_URL = config('BLOCKCHAIN_PROVIDER_URL', default='http://localhost:8545')
BLOCKCHAIN_CONTRACT_ADDRESS = config('BLOCKCHAIN_CONTRACT_ADDRESS', default='')

# ==============================================================================
# FILE UPLOAD LIMITS
# ==============================================================================

DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']

# ==============================================================================
# MOBILE APP SPECIFIC SETTINGS
# ==============================================================================

# Farmer mobile app features
MOBILE_APP_VERSION = '1.0.0'
MOBILE_APP_FORCE_UPDATE = False
MOBILE_APP_MIN_VERSION = '1.0.0'

# Push notification settings (FCM)
FCM_SERVER_KEY = config('FCM_SERVER_KEY', default='')

# ==============================================================================
# SECURITY SETTINGS (DEVELOPMENT)
# ==============================================================================

# In production, set these properly
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# ==============================================================================
# DEFAULT PRIMARY KEY FIELD TYPE
# ==============================================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================================
# PROJECT METADATA
# ==============================================================================

PROJECT_NAME = 'SeedSync'
PROJECT_VERSION = '1.0.0'
PROJECT_DESCRIPTION = 'AI-Enabled Value Chain Platform for Oilseed Self-Reliance'
ORGANIZATION = 'Smart India Hackathon 2024 - Ministry of Agriculture & Farmers Welfare'