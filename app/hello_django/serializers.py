from rest_framework import serializers
from .models import user_list, Match


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_list
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'status', 'profile_picture']

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_list
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'status', 'profile_picture', 'games_played', 'games_win', 'games_loose', 'games_rank', 'last_login']

class MatchListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['id', 'player1', 'player2', 'score_player1', 'score_player2', 'player_winner', 'status']
