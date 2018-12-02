import json
import datetime

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from visual.modules.terminal import commands


class TerminalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.terminal_name = self.scope['url_route']['kwargs']['code']
        self.terminal_group_name = 'terminal_{}'.format(self.terminal_name)

        # Join group
        await self.channel_layer.group_add(
            self.terminal_group_name,
            self.channel_name
        )

        #accept connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.terminal_group_name,
            self.channel_name
        )

    # Receive command from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        command = text_data_json['command']
        data = text_data_json['data']

        # Send command to group
        await self.channel_layer.group_send(
            self.terminal_group_name,
            {
                'type': 'command',
                'text': command,
                'sender': self.scope['user'].username,
                'time': str(datetime.datetime.now()),
            }
        )

        await commands.command(self.terminal_group_name, command, data, self.scope['user'].username)


    # Receive command from group
    async def command(self, event):
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'command',
            'text': event['text'],
        }))

    # Receive output from group
    async def output(self, event):
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'output',
            'text': event['text'],
            'status': event['status'],
        }))
