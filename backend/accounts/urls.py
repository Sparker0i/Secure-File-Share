# accounts/urls.py
from django.urls import path
from .views import (
    PublicKeyView,
    RegisterView,
    LoginView,
    MFAVerifyView,
    MFASetupView,
    MFAConfirmView,
    ProfileView,
    UserSearchView,  # Import the new view
)

urlpatterns = [
    path('public-key/', PublicKeyView.as_view(), name='public-key'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('mfa/verify/', MFAVerifyView.as_view(), name='mfa-verify'),
    path('mfa/setup/', MFASetupView.as_view(), name='mfa-setup'),
    path('mfa/confirm/', MFAConfirmView.as_view(), name='mfa-confirm'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),
]