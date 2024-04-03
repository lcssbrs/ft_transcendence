import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from hello_django import consumers
from django.urls import re_path


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hello_django.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/ranked", consumers.PongConsumer.as_asgi()),
            path('ws/chat/', consumers.ChatConsumer.as_asgi()),
        ])
    ),
})
