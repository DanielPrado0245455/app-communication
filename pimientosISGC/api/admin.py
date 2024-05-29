from django.contrib import admin

# Register your models here.
from .models import UserProfile, Message, Chatroom, Elobby

admin.site.register(UserProfile)
admin.site.register(Message)
admin.site.register(Chatroom)
admin.site.register(Elobby)