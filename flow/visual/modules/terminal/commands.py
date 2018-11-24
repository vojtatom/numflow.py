import datetime

from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer


@sync_to_async
def command(group, command, data, username):
    """
    Executes command and sends response to group.
        :param group: channel layers group name
        :param command: command to be executed 
        :param data: data of opened notebook
        :param username: author of the command
    """
    try:
        pass
    except Exception as e:
        send(group, str(e), 1, username)


def send(group, text, status, username):
    """
    Sends text to layers group with status.
        :param group: channel layers group name
        :param text: text to be sent
        :param status: status of the response
        :param username: author of the command
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(group, {
        'type': 'output',
        'text': text,
        'status': 0,
        'sender': username,
        'time': str(datetime.datetime.now()),
    })
