from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import json

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        if text_data == 'check_match':
            await self.check_match()

    async def check_match(self):
        try:
            # Vérifier si un match existe dans la base de données
            match = Match.objects.get()
            match_exists = True
        except ObjectDoesNotExist:
            match_exists = False

        # Envoyer le résultat au client
        await self.send(text_data=str(match_exists))
