import os
from cryptography.hazmat.primitives import padding as sym_padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from django.conf import settings

def get_aes_cipher():
    key = settings.AES_SECRET_KEY  # Must be 32 bytes for AES‑256
    iv = settings.AES_IV  # Must be 16 bytes
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    return cipher

def encrypt_file_data(data: bytes) -> bytes:
    cipher = get_aes_cipher()
    padder = sym_padding.PKCS7(128).padder()
    padded_data = padder.update(data) + padder.finalize()
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return encrypted

def decrypt_file_data(encrypted_data: bytes) -> bytes:
    cipher = get_aes_cipher()
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
    unpadder = sym_padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()
    return data
