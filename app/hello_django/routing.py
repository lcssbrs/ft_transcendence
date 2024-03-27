from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from hello_django.consumers import PongConsumer, ChatConsumer
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

websocket_urlpatterns = [
    path('wss/ranked/', PongConsumer.as_asgi()),
    path('wss/chat/', ChatConsumer.as_asgi()),
    # Vous pouvez ajouter d'autres patterns ici si nécessaire
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
    # "https": AllowedHostsOriginValidator(
    #     AuthMiddlewareStack(
    #         URLRouter(
    #             websocket_urlpatterns
    #         )
    #     )
    # ),
})
