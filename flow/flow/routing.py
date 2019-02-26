from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.staticfiles import StaticFilesWrapper
import chat.routing, visual.routing

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
            + visual.routing.websocket_urlpatterns
        )
    ),
})

