from rest_framework.routers import DefaultRouter
from .viewsets import UsuarioViewSet, MensajeViewSet, ChatroomViewSet, ElobbyViewSet


router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'mensajes', MensajeViewSet)
router.register(r'chatrooms', ChatroomViewSet)
router.register(r'elobbies', ElobbyViewSet)