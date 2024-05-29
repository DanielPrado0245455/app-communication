from rest_framework import viewsets
from .models import UserProfile, Message, Chatroom, Elobby
from .serializers import UsuarioSerializer, MensajeSerializer, ChatroomSerializer, ElobbySerializer
import django_filters.rest_framework

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UsuarioSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = '__all__'

class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MensajeSerializer

class ChatroomViewSet(viewsets.ModelViewSet):
    queryset = Chatroom.objects.all()
    serializer_class = ChatroomSerializer

class ElobbyViewSet(viewsets.ModelViewSet):
    queryset = Elobby.objects.all()
    serializer_class = ElobbySerializer
