from rest_framework import serializers
from .models import File, FileShare

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'filename', 'size', 'uploaded_at')

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    filename = serializers.CharField(max_length=255)
    encryption_key = serializers.CharField(max_length=255)  # Client‑side derived key

class FileShareSerializer(serializers.Serializer):
    share_type = serializers.ChoiceField(choices=[('user', 'user'), ('link', 'link')])
    target = serializers.CharField(required=False, allow_blank=True)
    permission = serializers.ChoiceField(choices=[('download', 'download')])  # Only allow 'download'
    # For shareable links, you may optionally allow an expiration parameter.
    
    def validate(self, data):
        share_type = data.get("share_type")
        target = data.get("target")
        if share_type == "user":
            # For user-based sharing, target is required.
            if not target:
                raise serializers.ValidationError({"target": "This field is required for user sharing."})
            # Enforce that permission must be "download" (even if provided).
            data["permission"] = "download"
        return data
