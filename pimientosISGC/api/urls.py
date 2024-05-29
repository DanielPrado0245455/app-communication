# urls.py

from django.urls import path, include
from .router import router

from .views import UsuarioViewSet

usuario_viewset = UsuarioViewSet.as_view({
    'get': 'handle_request',
    'post': 'handle_request'
})

urlpatterns = [
    path('', include(router.urls)),
    path('test', usuario_viewset),
]
