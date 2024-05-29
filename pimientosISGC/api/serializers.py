from rest_framework import serializers
from .models import UserProfile, Message, Chatroom, Elobby

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class MensajeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all())

    class Meta:
        model = Message
        fields = '__all__'

class ChatroomSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all())
    messages = MensajeSerializer(many=True, read_only=True)
    users = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())

    class Meta:
        model = Chatroom
        fields = '__all__'

class ElobbySerializer(serializers.ModelSerializer):
    usuarios = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())
    chatrooms = serializers.PrimaryKeyRelatedField(many=True, queryset=Chatroom.objects.all())

    class Meta:
        model = Elobby
        fields = '__all__'
