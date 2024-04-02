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
from hello_django import consumers
from django.urls import re_path


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hello_django.settings')

application = ProtocolTypeRouter({
    "https": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/ranked", consumers.PongConsumer.as_asgi()),
			re_path(r'ws/match/(?P<match_id>\d+)/$', consumers.PongConsumer.as_asgi()),
            path("ws/tournament", consumers.TournamentConsumer.as_asgi()),
			re_path(r'ws/tournament/(?P<match_id>\d+)/$', consumers.TournamentConsumer.as_asgi()),
			path('ws/chat/', consumers.ChatConsumer.as_asgi()),
        ])
    ),
})
