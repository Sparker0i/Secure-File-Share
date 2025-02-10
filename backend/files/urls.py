from django.urls import path
from .views import FileUploadView, FileListView, FileDownloadView, FileShareView, RevokeShareView, ShareableLinkAccessView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('', FileListView.as_view(), name='file-list'),
    path('<int:file_id>/download/', FileDownloadView.as_view(), name='file-download'),
    path('<int:file_id>/share/', FileShareView.as_view(), name='file-share'),
    path('<int:file_id>/share/revoke/', RevokeShareView.as_view(), name='share-revoke'),
    path('shareable/<str:link_id>/', ShareableLinkAccessView.as_view(), name='shareable-link'),
]
