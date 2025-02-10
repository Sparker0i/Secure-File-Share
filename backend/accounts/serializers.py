from rest_framework import serializers
from .models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):
    encrypted_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'encrypted_password')

    def create(self, validated_data):
        encrypted_password = validated_data.pop('encrypted_password')
        from .utils import decrypt_password
        plaintext_password = decrypt_password(encrypted_password)
        user = CustomUser(**validated_data)
        user.set_password(plaintext_password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    encrypted_password = serializers.CharField(write_only=True)
    mfa_code = serializers.CharField(required=False, allow_blank=True)
