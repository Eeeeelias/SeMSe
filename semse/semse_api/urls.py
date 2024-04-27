from django.urls import path
from . import views

urlpatterns = [
    path('media/', views.get_all_media, name='get_all_media'),
    path('query/', views.query_media, name='query_media'),
    path('test/', views.test_api, name='test'),
]
