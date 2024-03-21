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
        await self.send(text_data=json.dumps({"message": "pong"}))


# class PongConsumer(WebsocketConsumer):
#     def connect(self):
#         self.accept()
#         # Ajouter le client au groupe 'pong_game'
#         channel_layer = get_channel_layer()
#         async_to_sync(channel_layer.group_add)('pong_game', self.channel_name)

#     def disconnect(self, close_code):
#         # Supprimer le client du groupe 'pong_game' lors de la déconnexion
#         channel_layer = get_channel_layer()
#         async_to_sync(channel_layer.group_discard)('pong_game', self.channel_name)

#     def receive(self, text_data):
#         data = json.loads(text_data)
#         if data['type'] == 'game_update':
#             # Traitez les données de mouvement de la palette
#             player_id = data['data']['playerId']
#             paddle_y = data['data']['paddle_y']

            # Mettez à jour l'état du jeu en conséquence
            # ...

            # Envoyez les mises à jour du jeu à tous les clients connectés
            # self.send_game_update(player_id, paddle_y)

    # def send_game_update(self, player_id, paddle_y):
    #     # Mettez à jour l'état du jeu avec les nouvelles données
    #     # ...

    #     # Créez un dictionnaire d'événement avec les données de mise à jour du jeu
    #     event = {
    #         'type': 'game_update',
    #         'data': {
    #             'ball_x': ball_x,
    #             'ball_y': ball_y,
    #             'paddle1_y': paddle1_y,
    #             'paddle2_y': paddle2_y,
    #             'player1_score': player1_score,
    #             'player2_score': player2_score,
    #         }
    #     }

    #     # Envoyez l'événement à tous les clients connectés
    #     async_to_sync(self.channel_layer.group_send)(
    #         'pong_game',
    #         {
    #             'type': 'game_update',
    #             'event': event,
    #         }
    #     )

    # def send_game_update(self, event):
    #     # Envoyez les mises à jour du jeu à ce client spécifique
    #     self.send(text_data=json.dumps(event))

    # def game_update(self, event):
    #     # Envoyez les mises à jour du jeu au client spécifique
    #     self.send_game_update(event['event'])
#
            # consumers.py
