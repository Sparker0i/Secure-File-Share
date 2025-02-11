import os
from pathlib import Path
from datetime import timedelta
from cryptography.hazmat.primitives import serialization

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-sample-secret-key'
DEBUG = True
ALLOWED_HOSTS = ["backend", "localhost"]

INSTALLED_APPS = [
    'accounts',
    'files',
    # Default Django apps...
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third‑party apps
    'rest_framework',
    # Our apps
]

AUTH_USER_MODEL = 'accounts.CustomUser'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'secure_file_share.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'secure_file_share.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# RSA Keys for password encryption/decryption.
# In production, store these securely (e.g. in environment variables or secrets manager).
RSA_PRIVATE_KEY_PEM = b"""
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
"""

PRIVATE_KEY = serialization.load_pem_private_key(
    RSA_PRIVATE_KEY_PEM,
    password=None,
)
SERVER_PRIVATE_KEY = PRIVATE_KEY

# Load public key (to be served to clients)
SERVER_PUBLIC_KEY = PRIVATE_KEY.public_key()
PUBLIC_KEY_PEM = SERVER_PUBLIC_KEY.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# AES‑256 key for file encryption at rest.
# In production, use secure secrets management.
AES_SECRET_KEY = os.environ.get('AES_SECRET_KEY', '0123456789abcdef0123456789abcdef').encode('utf-8')  # 32 bytes
AES_IV = os.environ.get('AES_IV', 'abcdef9876543210').encode('utf-8')  # 16 bytes
