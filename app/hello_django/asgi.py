from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from hello_django.consumers import PongConsumer, ChatConsumer
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

websocket_urlpatterns = [
    path('ws/ranked/', PongConsumer.as_asgi()),
    path('ws/chat/', ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
<<<<<<< HEAD
        URLRouter(
            websocket_urlpatterns
        )
=======
        URLRouter([
            path("ws/ranked", consumers.PongConsumer.as_asgi()),
			re_path(r'ws/match/(?P<match_id>\d+)/$', consumers.PongConsumer.as_asgi()),
            path("ws/tournament", consumers.TournamentConsumer.as_asgi()),
			re_path(r'ws/tournament/(?P<match_id>\d+)/$', consumers.TournamentConsumer.as_asgi()),
			path('ws/chat/', consumers.ChatConsumer.as_asgi()),
        ])
>>>>>>> tom
    ),
})
