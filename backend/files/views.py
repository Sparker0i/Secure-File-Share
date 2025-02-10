from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework import generics
from datetime import datetime, timedelta
from .models import File, FileShare
from .serializers import FileSerializer, FileUploadSerializer, FileShareSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.files.base import ContentFile
from .utils import encrypt_file_data, decrypt_file_data
import os, uuid

class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = serializer.validated_data['file']
            filename = serializer.validated_data['filename']
            encryption_key = serializer.validated_data['encryption_key']
            # Read the file data
            data = uploaded_file.read()
            # Encrypt file data with AES‑256 for encryption at rest
            encrypted_data = encrypt_file_data(data)
            file_instance = File.objects.create(
                owner=request.user,
                filename=filename,
                size=len(encrypted_data)
            )
            file_path = f'uploads/{file_instance.id}_{filename}'
            full_path = os.path.join('media', file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(encrypted_data)
            file_instance.file = file_path
            file_instance.save()
            return Response({
                "file_id": file_instance.id,
                "filename": filename,
                "uploaded_at": file_instance.uploaded_at,
                "size": file_instance.size,
                "message": "File uploaded successfully."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileListView(generics.ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Files the user owns OR files that are shared with the user (and not revoked)
        return File.objects.filter(
            Q(owner=user) | Q(shares__target_user=user, shares__revoked=False)
        ).distinct()

class FileDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, file_id):
        file_instance = get_object_or_404(File, id=file_id)
        if file_instance.owner != request.user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        file_path = os.path.join('media', file_instance.file.name)
        if not os.path.exists(file_path):
            return Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        with open(file_path, 'rb') as f:
            encrypted_data = f.read()
        decrypted_data = decrypt_file_data(encrypted_data)
        response = Response(decrypted_data, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file_instance.filename}"'
        return response

class FileShareView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, file_id):
        serializer = FileShareSerializer(data=request.data)
        if serializer.is_valid():
            file_instance = get_object_or_404(File, id=file_id)
            if file_instance.owner != request.user:
                return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

            share_type = serializer.validated_data['share_type']
            permission = serializer.validated_data['permission']  # Should be "download"
            if share_type == 'user':
                # Process target for user sharing
                target = serializer.validated_data.get('target')
                try:
                    target_user_id = int(target)
                except ValueError:
                    return Response({"detail": "Invalid user ID."}, status=status.HTTP_400_BAD_REQUEST)
                share = FileShare.objects.create(
                    file=file_instance,
                    target_user_id=target_user_id,
                    permission=permission
                )
                return Response({
                    "message": "File shared successfully with the user.",
                    "share_details": {
                        "file_id": file_instance.id,
                        "target_user": target,
                        "permission": permission
                    }
                })
            elif share_type == 'link':
                expires_in = request.data.get('expires_in')
                try:
                    expires_in = int(expires_in) if expires_in else 1440  # Default: 1440 minutes (24 hours)
                except ValueError:
                    return Response({"detail": "Invalid expiration time."}, status=status.HTTP_400_BAD_REQUEST)
                link_id = str(uuid.uuid4())
                expiration_time = datetime.utcnow() + timedelta(minutes=expires_in)
                share = FileShare.objects.create(
                    file=file_instance,
                    shareable_link=link_id,
                    permission=permission,
                    expires_at=expiration_time
                )
                return Response({
                    "shareable_link": f"/api/files/shareable/{link_id}",
                    "expires_at": expiration_time.isoformat() + 'Z',
                    "message": "Shareable link generated successfully."
                }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RevokeShareView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, file_id):
        share_type = request.data.get('share_type')
        target = request.data.get('target')
        file_instance = get_object_or_404(File, id=file_id)
        if file_instance.owner != request.user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        if share_type == 'user':
            try:
                target_user_id = int(target)
            except ValueError:
                return Response({"detail": "Invalid user ID."}, status=status.HTTP_400_BAD_REQUEST)
            share = FileShare.objects.filter(file=file_instance, target_user_id=target_user_id, revoked=False).first()
        elif share_type == 'link':
            share = FileShare.objects.filter(file=file_instance, shareable_link=target, revoked=False).first()
        else:
            return Response({"detail": "Invalid share_type."}, status=status.HTTP_400_BAD_REQUEST)
        if share:
            share.revoked = True
            share.save()
            return Response({"message": "Sharing permissions revoked successfully."})
        return Response({"detail": "Share entry not found."}, status=status.HTTP_404_NOT_FOUND)

class ShareableLinkAccessView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, link_id):
        share = get_object_or_404(FileShare, shareable_link=link_id, revoked=False)
        file_instance = share.file
        file_path = os.path.join('media', file_instance.file.name)
        if not os.path.exists(file_path):
            return Response({"detail": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        with open(file_path, 'rb') as f:
            encrypted_data = f.read()
        decrypted_data = decrypt_file_data(encrypted_data)
        share.revoked = True  # Invalidate the link (single‑use)
        share.save()
        response = Response(decrypted_data, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file_instance.filename}"'
        return response
