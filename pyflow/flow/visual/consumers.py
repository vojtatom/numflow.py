import json
import datetime
import threading

from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from visual import commands


class TerminalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Handles the client WebScoket connection
            :param self: instance of TerminalConsumer
        """   
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
        """
        Handles the client WebScoket disconnection
            :param self: instance of TerminalConsumer
            :param close_code: client close code
        """   
        # Leave group
        await self.channel_layer.group_discard(
            self.terminal_group_name,
            self.channel_name
        )

    # Receive command from WebSocket
    async def receive(self, text_data):
        """
        Receive command from WebSocket
            :param self: instance of TerminalConsumer
            :param text_data: recieved data

        """
        recdata = json.loads(text_data)
        user = self.scope['user'].username

        # basic command management
        if 'command' in recdata:
            command = recdata['command']
            data = recdata['data']

            # Send command to group
            await self.channel_layer.group_send(
                self.terminal_group_name,
                {
                    'type': 'command',
                    'text': command,
                    'sender': user,
                    'time': str(datetime.datetime.now()),
                }
            )

            output, error = await commands.command(self.terminal_group_name, self.terminal_name, command, data, user)
            await self.send_message(user, output, error)
            return

        #proecssing server message
        if 'message' in recdata:
            user = self.scope['user'].username
            message = recdata['message']
            error = recdata['error']
            await self.send_message(user, message, error)
            return

        #canvas update
        if 'canvas' in recdata:
            canvas = recdata['canvas']
            await self.channel_layer.group_send(
                self.terminal_group_name,
                {
                    'type': 'update',
                    'url': '/media/notebook/{}/output.imgflow'.format(canvas),
                    'sender': user,
                    'time': str(datetime.datetime.now()),
                }
            )
            return


    async def send_message(self, user, text, error):
        """
        Sends a custom message to the group
            :param self: instance of TerminalConsumer
            :param user: django user username
            :param text: message text
            :param error: true if the message is error info
        """
        if error:
            #in case error was recieved
            await self.channel_layer.group_send(
                self.terminal_group_name,
                {
                    'type': 'error',
                    'text': text,
                    'sender': user,
                    'time': str(datetime.datetime.now()),
                }
            )
        else:
            #standard output
            await self.channel_layer.group_send(
                self.terminal_group_name,
                {
                    'type': 'output',
                    'text': text,
                    'sender': user,
                    'time': str(datetime.datetime.now()),
                }
            )


    async def command(self, event):
        """Receive command from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'command',
            'text': event['text'],
        }))


    async def progress(self, event):
        """Receive progress from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'progress',
            'text': event['text'],
        }))


    async def output(self, event):
        """Receive output from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'output',
            'text': event['text']
        }))

    async def error(self, event):
        """Receive error from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'error',
            'text': event['text']
        }))

    async def canvas(self, event):
        """Receive output from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'canvas',
            'text': event['text']
        }))

    async def update(self, event):
        """Receive output from group
            params:
                self: instance of TerminalConsumer
                event: dict with event description
        """
        # Send command to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update',
            'url': event['url'],
        }))

