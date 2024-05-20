from django.urls import path
from . import views

urlpatterns = [
    path('token/', views.set_csrf_cookie, name='send_csrf_cookie'),
    path('media/', views.get_all_media, name='get_all_media'),
    path('query/', views.query_media, name='query_media'),
    path('size/', views.get_media_size, name='get_media_size'),
    path('test/', views.test_api, name='test'),
    path('image/<str:uuid>/', views.serve_image, name='serve_image'),
]
