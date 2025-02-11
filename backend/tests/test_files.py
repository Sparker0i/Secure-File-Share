# tests/test_files.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from files.models import File, FileShare
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class FileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='fileuser', email='fileuser@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        # Assume you have a URL name for file upload; adjust accordingly.
        self.upload_url = reverse('file-upload')
        # Create a dummy file for upload testing.
        self.uploaded_file_content = b'This is a test file'
        self.uploaded_file = SimpleUploadedFile('test.txt', self.uploaded_file_content, content_type='text/plain')

    def test_file_upload(self):
        data = {
            'file': self.uploaded_file,
            'filename': 'test.txt',
            'encryption_key': 'dummy_key'
        }
        response = self.client.post(self.upload_url, data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(File.objects.filter(filename='test.txt').exists())

    def test_file_download_owner(self):
        # Create a file record
        file_instance = File.objects.create(owner=self.user, filename='test.txt', size=1024, file='uploads/test.txt')
        download_url = reverse('file-download', args=[file_instance.id])
        response = self.client.get(download_url)
        self.assertEqual(response.status_code, 200)

    def test_file_download_shared_user(self):
        # Create a file record
        file_instance = File.objects.create(owner=self.user, filename='test.txt', size=1024, file='uploads/test.txt')
        # Share the file with another user
        recipient = User.objects.create_user(username='recipient', email='recipient@example.com', password='password123')
        share = FileShare.objects.create(file=file_instance, target_user=recipient, permission='download')
        # Authenticate as the recipient and attempt download
        self.client.force_authenticate(user=recipient)
        download_url = reverse('file-download', args=[file_instance.id])
        response = self.client.get(download_url)
        self.assertEqual(response.status_code, 200)

    def test_shareable_link_download(self):
        # Create a file record
        file_instance = File.objects.create(owner=self.user, filename='test.txt', size=1024, file='uploads/test.txt')
        share_url = reverse('file-share', args=[file_instance.id])
        data = {
            'share_type': 'link',
            'expires_in': 60,  # link valid for 1 minute
            'permission': 'download'
        }
        response = self.client.post(share_url, data, format='json')
        self.assertEqual(response.status_code, 201)
        shareable_link = response.data.get('shareable_link')
        # Test download via the shareable link (simulate unauthenticated request)
        self.client.force_authenticate(user=None)
        download_response = self.client.get(shareable_link)
        self.assertEqual(download_response.status_code, 200)

    def test_shareable_link_expired(self):
        # Create a file record
        file_instance = File.objects.create(owner=self.user, filename='test.txt', size=1024, file='uploads/test.txt')
        share_url = reverse('file-share', args=[file_instance.id])
        data = {
            'share_type': 'link',
            'expires_in': 1,  # very short expiration (1 minute)
            'permission': 'download'
        }
        response = self.client.post(share_url, data, format='json')
        self.assertEqual(response.status_code, 201)
        shareable_link = response.data.get('shareable_link')
        # Manually expire the share by updating expires_at
        share = FileShare.objects.get(shareable_link__isnull=False)
        share.expires_at = timezone.now() - timedelta(minutes=1)
        share.save()
        self.client.force_authenticate(user=None)
        download_response = self.client.get(shareable_link)
        # Depending on your implementation, you might get a 403 or a 404; adjust accordingly.
        self.assertIn(download_response.status_code, [403, 404])
