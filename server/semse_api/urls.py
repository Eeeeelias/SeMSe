from django.urls import path
from . import views

urlpatterns = [
    path('media/', views.get_all_media, name='get_all_media'),
    path('query/', views.query_media, name='query_media'),
    path('queryPlain/', views.query_media_fts, name='query_media_fts'),
    path('size/', views.get_media_size, name='get_media_size'),
    path('test/', views.test_api, name='test'),
    path('image/<str:uuid>/', views.serve_image, name='serve_image'),
]
