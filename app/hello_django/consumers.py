from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
from .models import user_list

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        username = self.scope['user'].username
        user_list.objects.update_or_create(username=username, defaults={'status': 'online'})
        self.accept()

    def receive(self, text_data):
        data = json.loads(text_data)
        username = self.scope['user'].username
        if 'status' in data:
            new_status = data['status']
            if new_status == 'in_game':
                user_list.objects.update_or_create(username=username, defaults={'status': 'in_game'})
            elif new_status == 'out':
                previous_status = 'online' if user_list.objects.get(username=username).status != 'offline' else 'offline'
                user_list.objects.update_or_create(username=username, defaults={'status': previous_status})

    def disconnect(self, close_code):
        username = self.scope['user'].username
        user_list.objects.update_or_create(username=username, defaults={'status': 'offline'})

class PongConsumer(WebsocketConsumer):
    connected_clients = {}

    def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.group_name = f"match_{self.match_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )

        if self.group_name not in self.connected_clients:
            self.connected_clients[self.group_name] = [self.channel_name]
        else:
            self.connected_clients[self.group_name].append(self.channel_name)

        self.accept()

        self.check_group_full()

    def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'game_move':
            self.game_move(data)
        elif message_type == 'ball_move':
            self.ball_move(data)

    def check_group_full(self):
        if self.group_name in self.connected_clients and len(self.connected_clients[self.group_name]) >= 2:
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    'type': 'send_full_message'
                }
            )

    def send_full_message(self, event):
        self.send(text_data=json.dumps({
            'message': 'Partie complète'
        }))
        self.send(text_data=json.dumps({
            'type': 'game_start'
        }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

        if self.group_name in self.connected_clients:
            self.connected_clients[self.group_name].remove(self.channel_name)

        self.check_group_full()

        if len(self.connected_clients[self.group_name]) == 1:
            other_client_channel_name = self.connected_clients[self.group_name][0]
            async_to_sync(self.channel_layer.send)(
                other_client_channel_name,
                {
                    'type': 'send_disconnect_message'
                }
            )

    def send_disconnect_message(self, event):
        self.send(text_data=json.dumps({
            'type': 'disconnect_message'
        }))

    def game_move(self, event):
        data = event
        if data:
            player_id = data.get('player')
            y = data.get('y')
        if player_id is not None and y is not None:
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    'type': 'send_game_update',
                    'data': {
                        'player': player_id,
                        'y': y
                    }
                }
            )

    def send_game_update(self, event):
        self.send(text_data=json.dumps({
            'type': 'game_move',
            'data': event['data']
        }))

    def ball_move(self, event):
        data = event
        if data:
            ball_x = data.get('x')
            ball_y = data.get('y')
            if ball_x is not None and ball_y is not None:
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {
                        'type': 'send_ball_update',
                        'x': ball_x,
                        'y': ball_y
                    }
                )

    def send_ball_update(self, event):
        self.send(text_data=json.dumps({
            'type': 'ball_move',
            'x': event['x'],
            'y': event['y']
        }))

