"""
ASGI config for hello_django project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from . import consumers
from consumers import PongConsumer, ChatConsumer, TournamentConsumer
from django.urls import re_path



websocket_urlpatterns = [
    path('ws/ranked', PongConsumer.as_asgi()),
	path('ws/chat/', ChatConsumer.as_asgi()),
    path('ws/tournament', TournamentConsumer.as_asgi()),
	path('ws/tournament/<match_id>/', consumers.TournamentConsumer.as_asgi()),
	path('ws/match/<match_id>/', PongConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
	"http": get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
