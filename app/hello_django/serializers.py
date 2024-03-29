from rest_framework import serializers
from .models import user_list, Match, Tournament

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

class TournoiListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'date_tournament', 'player01', 'player02', 'player03', 'player04', 'status', 'player_winner', 'match1_id', 'match2_id', 'final_id']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_list
        fields = '__all__'
