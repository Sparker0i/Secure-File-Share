# tests/test_auth.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
import base64, jwt, pyotp
from datetime import datetime, timedelta
from django.conf import settings

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse('register')
        self.login_url = reverse('login')
        self.mfa_confirm_url = reverse('mfa-confirm')
        # Create a test user (without MFA enabled initially)
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')

    def test_register_user(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'encrypted_password': base64.b64encode('password123'.encode()).decode(),
        }
        response = self.client.post(self.registration_url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.data)
        new_user = User.objects.get(username='newuser')
        self.assertEqual(new_user.email, 'new@example.com')

    def test_login_without_mfa(self):
        data = {
            'username': 'testuser',
            'encrypted_password': base64.b64encode('password123'.encode()).decode(),
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.data)
        self.assertFalse(response.data.get('mfa_required', False))

    def test_login_requires_mfa(self):
        # Enable MFA for the user
        totp_secret = pyotp.random_base32()
        self.user.totp_secret = totp_secret
        self.user.mfa_enabled = True
        self.user.set_password('password123')
        self.user.save()

        data = {
            'username': 'testuser',
            'encrypted_password': base64.b64encode('password123'.encode()).decode(),
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('mfa_required'))

    def test_mfa_confirmation(self):
        # Create a user with MFA not yet enabled
        totp_secret = pyotp.random_base32()
        self.user.totp_secret = totp_secret
        self.user.mfa_enabled = False
        self.user.set_password('password123')
        self.user.save()
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
        totp = pyotp.TOTP(totp_secret)
        code = totp.now()
        data = {'mfa_code': code}
        response = self.client.post(self.mfa_confirm_url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.mfa_enabled)
