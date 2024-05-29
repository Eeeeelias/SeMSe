from django.urls import path
from . import views

urlpatterns = [
    path('api/media/', views.get_all_media, name='get_all_media'),
    path('api/query/', views.query_media, name='query_media'),
    path('api/queryPlain/', views.query_media_fts, name='query_media_fts'),
    path('api/size/', views.get_media_size, name='get_media_size'),
    path('api/test/', views.test_api, name='test'),
    path('api/image/<str:uuid>/', views.serve_image, name='serve_image'),
]
