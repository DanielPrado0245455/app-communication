from django.db import models
import django_filters

class UserProfile(models.Model):
    username = models.CharField(max_length=100, primary_key=True)
    password = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    elobby = models.ForeignKey("Elobby", on_delete=models.CASCADE, related_name='user_profiles')
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]

    def __str__(self):
        return self.username


class Elobby(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    usuarios = models.ManyToManyField(UserProfile, related_name='elobbies', blank=True)
    chatrooms = models.ManyToManyField("Chatroom", related_name='elobbies', blank=True)
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]

    def __str__(self):
        return self.name


class Message(models.Model):
    text = models.TextField()
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='messages')
    chatroom = models.ForeignKey("Chatroom", on_delete=models.CASCADE, related_name='messages')
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]

    def __str__(self):
        return f"Message from {self.user.username} in {self.chatroom.title}"


class Chatroom(models.Model):
    creator = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='created_chatrooms')
    users = models.ManyToManyField(UserProfile, related_name='chatrooms')
    requests = models.ManyToManyField(UserProfile, related_name='chatroom_requests')
    title = models.CharField(max_length=255)
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]

    def __str__(self):
        return self.title