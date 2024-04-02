from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path, re_path
from hello_django.consumers import PongConsumer, ChatConsumer, TournamentConsumer
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from . import consumers

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            path('ws/ranked', PongConsumer.as_asgi()),
            path('ws/chat/', ChatConsumer.as_asgi()),
            path('ws/tournament', TournamentConsumer.as_asgi()),
        )
    ),
})
