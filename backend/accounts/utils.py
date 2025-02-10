import base64
from django.conf import settings
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

def decrypt_password(encrypted_password_b64: str) -> str:
    return base64.b64decode(encrypted_password_b64).decode('utf-8')
