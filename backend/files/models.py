# files/models.py
from django.db import models
from accounts.models import CustomUser

class File(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='uploads/')
    filename = models.CharField(max_length=255)
    size = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class FileShare(models.Model):
    PERMISSION_CHOICES = (
        ('view', 'View'),
        ('download', 'Download'),
    )
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    target_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    shareable_link = models.CharField(max_length=255, null=True, blank=True)
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    revoked = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)  # New field for link expiration

    def __str__(self):
        return f"{self.file.filename} shared with {self.target_user or self.shareable_link}"
