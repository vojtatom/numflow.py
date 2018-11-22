import json
import datetime

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Chatroom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name'].replace('"', '')
        self.room_group_name = self.room_name


        print(self.room_group_name)

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        print(self.room_group_name, self.scope['user'], message)

        await self.create_chat_message(message, self.scope['user'], self.room_group_name)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.scope['user'].username,
                'time': str(datetime.datetime.now()),
            }
        )

    # Receive message from room group
    async def chat_message(self, event):

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'text': event['message'],
            'sender': event['sender'],
            'time':event['time']
        }))

    @database_sync_to_async
    def create_chat_message(self, message, sender, groupname):
        room = Chatroom.objects.get(name=groupname)
        message = Message(text=message, sender=sender, chatroom=room)
        message.save()
