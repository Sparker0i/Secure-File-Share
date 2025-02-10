from datetime import datetime, timedelta
import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import pyotp
from .models import CustomUser
from .utils import decrypt_password

class PublicKeyView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"public_key": settings.PUBLIC_KEY_PEM.decode('utf-8')})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "message": "User registered successfully."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            encrypted_password = serializer.validated_data.get('encrypted_password')
            plaintext_password = decrypt_password(encrypted_password)
            user = authenticate(request, username=username, password=plaintext_password)
            if user is not None:
                # Two-step login: if MFA is enabled and no MFA code provided,
                # return a temporary token so the client can proceed to MFA verification.
                if user.mfa_enabled and not serializer.validated_data.get('mfa_code'):
                    temp_payload = {
                        'user_id': user.pk,
                        'mfa_pending': True,
                        'exp': datetime.utcnow() + timedelta(minutes=5)
                    }
                    temp_token = jwt.encode(temp_payload, settings.SECRET_KEY, algorithm='HS256')
                    return Response({
                        "mfa_required": True,
                        "temp_token": temp_token,
                    }, status=status.HTTP_200_OK)
                elif user.mfa_enabled and serializer.validated_data.get('mfa_code'):
                    mfa_code = serializer.validated_data.get('mfa_code')
                    totp = pyotp.TOTP(user.totp_secret) if user.totp_secret else None
                    if totp and not totp.verify(mfa_code):
                        return Response({"detail": "Invalid MFA code."}, status=status.HTTP_401_UNAUTHORIZED)
                # If MFA is not enabled or has been verified, generate tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": {
                        "id": user.pk,
                        "username": user.username,
                        "role": user.role,
                        "mfa_enabled": user.mfa_enabled,
                    }
                })
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MFASetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        method = request.data.get('method')
        if method not in ['TOTP', 'SMS']:
            return Response({"detail": "Unsupported MFA method."}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if method == 'TOTP':
            # Generate TOTP secret
            secret = pyotp.random_base32()
            user.totp_secret = secret
            user.save()
            totp = pyotp.TOTP(secret)
            qr_url = totp.provisioning_uri(name=user.email, issuer_name="SecureFileShare")
            return Response({
                "message": "MFA setup initiated for TOTP.",
                "qr_code_url": qr_url,
                "secret": secret
            })
        elif method == 'SMS':
            phone_number = request.data.get('phone_number')
            if not phone_number:
                return Response({"detail": "Phone number required for SMS MFA."}, status=status.HTTP_400_BAD_REQUEST)
            user.phone_number = phone_number
            # For demonstration, generate an OTP (in production, integrate with an SMS gateway)
            otp = pyotp.random_base32()[:6]
            user.otp = otp  # Note: In production, store OTP securely (e.g. in cache)
            user.save()
            print(f"Sending SMS OTP {otp} to {phone_number}")
            return Response({
                "message": "OTP sent to the provided phone number. Please verify using the MFA verification endpoint."
            })

class MFAVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Expect the temporary token (temp_token) and the MFA code
        temp_token = request.data.get('temp_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
        if not temp_token:
            return Response({"detail": "Temporary token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payload = jwt.decode(temp_token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({"detail": "Temporary token expired."}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"detail": "Invalid temporary token."}, status=status.HTTP_401_UNAUTHORIZED)
        if not payload.get('mfa_pending'):
            return Response({"detail": "MFA verification not pending."}, status=status.HTTP_400_BAD_REQUEST)
        user_id = payload.get('user_id')
        user = CustomUser.objects.filter(pk=user_id).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        mfa_code = request.data.get('mfa_code')
        if not mfa_code:
            return Response({"detail": "MFA code required."}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(user.totp_secret) if user.totp_secret else None
        if totp and totp.verify(mfa_code):
            refresh = RefreshToken.for_user(user)
            return Response({
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.pk,
                    "username": user.username,
                    "role": user.role,
                    "mfa_enabled": user.mfa_enabled,
                }
            })
        # Add SMS MFA logic here if needed.
        return Response({"detail": "Invalid MFA code."}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "mfa_enabled": user.mfa_enabled
        })
    def put(self, request):
        user = request.user
        email = request.data.get('email')
        password = request.data.get('encrypted_password')
        if email:
            user.email = email
        if password:
            from .utils import decrypt_password
            plaintext_password = decrypt_password(password)
            user.set_password(plaintext_password)
        user.save()
        return Response({
            "message": "Profile updated successfully.",
            "profile": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "mfa_enabled": user.mfa_enabled
            }
        })

class MFAConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        mfa_code = request.data.get('mfa_code')
        if not mfa_code:
            return Response({"detail": "MFA code required."}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.totp_secret:
            return Response({"detail": "MFA is not setup for this user."}, status=status.HTTP_400_BAD_REQUEST)
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(mfa_code):
            user.mfa_enabled = True
            user.save()
            return Response({"message": "MFA setup confirmed."})
        return Response({"detail": "Invalid MFA code."}, status=status.HTTP_400_BAD_REQUEST)

class UserSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get the search query from the query parameters
        query = request.query_params.get('query', '')
        if query:
            # Filter by username or email (case-insensitive)
            users = CustomUser.objects.filter(username__icontains=query) | CustomUser.objects.filter(email__icontains=query)
            users = users.distinct()[:10]  # Limit results to 10 matches
            data = [{'id': user.pk, 'username': user.username, 'email': user.email} for user in users]
            return Response(data, status=status.HTTP_200_OK)
        # If no query provided, return an empty list
        return Response([], status=status.HTTP_200_OK)