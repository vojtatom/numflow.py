import uuid

from django.contrib.auth.models import User
from django.db import models


class Chatroom(models.Model):
    name = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    users = models.ManyToManyField(User, related_name="users")

    objects = models.Manager()

    def __str__(self):
        return str(self.name)


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    chatroom = models.ForeignKey(Chatroom, on_delete=models.CASCADE)
    text = models.TextField(max_length=500, blank=True)
    time = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()

    def get_json(self):
        return {'text': self.text, 'sender': self.sender.username, 'time': self.time}
