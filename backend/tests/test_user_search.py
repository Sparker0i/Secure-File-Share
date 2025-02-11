# tests/test_user_search.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='searchuser', email='search@example.com', password='password123')
        self.other_user = User.objects.create_user(username='otheruser', email='other@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.search_url = reverse('user-search')
    
    def test_user_search_excludes_self(self):
        response = self.client.get(self.search_url, {'query': 'search'})
        self.assertEqual(response.status_code, 200)
        # Ensure self.user is not in the search results
        for user_data in response.data:
            self.assertNotEqual(user_data['id'], self.user.pk)
        # Ensure that another user is returned if matching
        found = any(user_data['id'] == self.other_user.pk for user_data in response.data)
        self.assertTrue(found)
