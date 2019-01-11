import datetime

from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer

from . import pipeline


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
        if command in commands:
            commands[command](group, command, data, username)
        else:
            ##command not found
            send(group, 'command not found', 1, username, done=True)
    except Exception as e:
        send(group, str(e), status=1, username=username, done=True)


def send(group, text, status=0, username=None, done=False):
    """
    Sends text to layers group with status.
        :param group: channel layers group name
        :param text: text to be sent
        :param status: status of the response
        :param username: author of the command
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(group, {
        'type': 'output' if done else 'progress',
        'text': text,
        'status': status,
        'sender': username,
        'time': str(datetime.datetime.now()),
    })




def help_command(group, command, data, username):
    help_text = """usefull commands:

run     run nodes
help    show this help
"""

    send(group, help_text, username=username, done=True)



def run_command(group, command, data, username):
    graph = pipeline.load_graph(data)
    pipeline.detect_cycles(graph)
    send(group, 'No cycles detected', username=username)


commands = { 'help': help_command, 'run': run_command }



