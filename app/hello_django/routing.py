from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
<<<<<<< HEAD
from hello_django.consumers import PongConsumer, ChatConsumer

websocket_urlpatterns = [
    path('ws/ranked/', PongConsumer.as_asgi()),
    path('ws/chat/', ChatConsumer.as_asgi()),
    path('ws/match/<match_id>/', PongConsumer.as_asgi()),
=======
from django.urls import path
from hello_django.consumers import PongConsumer, ChatConsumer, TournamentConsumer
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

websocket_urlpatterns = [
    path('ws/ranked', PongConsumer.as_asgi()),
	path('ws/chat/', ChatConsumer.as_asgi()),
    path('ws/tournament', TournamentConsumer.as_asgi()),
>>>>>>> tom
]

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
