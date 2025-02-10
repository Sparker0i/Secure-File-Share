from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('regular', 'Regular User'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='regular')
    mfa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username
