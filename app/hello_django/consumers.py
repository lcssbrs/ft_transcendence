from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from json.decoder import JSONDecodeError

class PongConsumer(AsyncWebsocketConsumer):
    connected_clients = {}

    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.group_name = f"match_{self.match_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        if self.group_name not in self.connected_clients:
            self.connected_clients[self.group_name] = [self.channel_name]
        else:
            self.connected_clients[self.group_name].append(self.channel_name)

        await self.accept()

        await self.check_group_full()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'game_move':
            await self.game_move(data)

    async def check_group_full(self):
        if self.group_name in self.connected_clients and len(self.connected_clients[self.group_name]) >= 2:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'send_full_message'
                }
            )

    async def send_full_message(self, event):
        await self.send(text_data=json.dumps({
            'message': 'Partie complète'
        }))
        await self.send(text_data=json.dumps({
            'type': 'game_start'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        if self.group_name in self.connected_clients:
            self.connected_clients[self.group_name].remove(self.channel_name)

        await self.check_group_full()

        if len(self.connected_clients[self.group_name]) == 1:
            other_client_channel_name = self.connected_clients[self.group_name][0]
            await self.channel_layer.send(
                other_client_channel_name,
                {
                    'type': 'send_disconnect_message'
                }
            )

    async def send_disconnect_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'disconnect_message'
        }))

    async def game_move(self, event):
        data = event
        if data:
            player_id = data.get('player')
            direction = data.get('direction')
        if player_id is not None and direction is not None:
            if self.group_name in self.connected_clients:
                if len(self.connected_clients[self.group_name]) > player_id:
                    self.connected_clients[self.group_name][player_id] = direction


                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'send_game_update',
                        'data': {
                            'player': player_id,
                            'direction': direction
                        }
                    }
                )


    async def send_game_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'data': event['data']
        }))


