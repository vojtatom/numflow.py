from time import sleep
from asgiref.sync import sync_to_async, async_to_sync
from channels.layers import get_channel_layer


@sync_to_async
def command(c, group):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(group, {
        "type": "command",
        "output": "Hello there!",
    })
    return 'got ' + c

