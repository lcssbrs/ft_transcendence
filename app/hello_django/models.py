from django.db import models
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from pathlib import Path
import os
from django.core.files import File
import urllib.request
from PIL import Image
from django.db import transaction

# TODO LIST :
    # historique tournoi: position, date, résultat dernier match, adversaire dernier match
    # historique ranked: résultat (victoire ou défaite), score, adversaire, gain de lp

def validate_password_length(value):
    if len(value) < 8:
        raise ValidationError("Le mot de passe doit contenir au moins 8 caractères.")

class user_list(models.Model):
    first_name = models.CharField(max_length=15)
    last_name = models.CharField(max_length=15)
    username = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    password = models.CharField(max_length=128, validators=[validate_password_length])
    email = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='photos/', default='photos/default-profile.jpg')
    status = models.CharField(max_length=20, default='offline', choices=[('online', 'En ligne'), ('offline', 'Hors ligne'), ('in_game', 'En jeu')])
    last_login = models.DateTimeField(null=True, blank=True)
    double_auth = models.BooleanField(default=1)
    is_log = models.BooleanField(default=0)
    intra = models.BooleanField(default=False)
    qr_code = models.ImageField(upload_to='qr_codes/')
    jwt_token = models.CharField(max_length=500, blank=True, null=True)
    # Parties:
    games_played = models.PositiveIntegerField(default=0)
    games_win = models.PositiveIntegerField(default=0)
    games_loose = models.PositiveIntegerField(default=0)
    games_rank = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    # Friend:
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def is_authenticated(self):
        return True

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'django_user_list'

# Friend

class Friendship(models.Model):
    from_user = models.ForeignKey(user_list, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(user_list, related_name='friend_requests_received', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

@receiver(post_save, sender=user_list)
def sync_user_to_auth_user(sender, instance, created, **kwargs):
    if created:
        User.objects.create_user(
            username=instance.username,
            password=instance.password,
            email=instance.email,
            first_name=instance.first_name,
            last_name=instance.last_name
        )

class Match(models.Model):
    player1 = models.ForeignKey('user_list', related_name='player1_matches', on_delete=models.CASCADE)
    player2 = models.ForeignKey('user_list', related_name='player2_matches', on_delete=models.CASCADE, null=True)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    player_winner = models.ForeignKey('user_list', related_name='winner_matches', on_delete=models.CASCADE, null=True)
    status = models.CharField(max_length=20, default='waiting', choices=[('waiting', 'En attente de joueurs'), ('end_game', 'Fin de partie'), ('in_game', 'En jeu'), ('cancel', 'Annulé')])
    locked = models.BooleanField(default=False)

    def update_scores(self):
        if not self.locked:
            with transaction.atomic():
                self.locked = True
                self.player1.games_played += 1
                self.player2.games_played += 1
                if self.score_player1 > self.score_player2:
                    self.player1.games_win += 1
                    self.player2.games_loose += 1
                    self.player1.games_rank += 25
                    if self.player2.games_rank >= 25:
                        self.player2.games_rank -= 25
                elif self.score_player1 < self.score_player2:
                    self.player2.games_win += 1
                    self.player1.games_loose += 1
                    self.player2.games_rank += 25
                    if self.player1.games_rank >= 25:
                        self.player1.games_rank -= 25
                self.player1.save()
                self.player2.save()
                self.save()

class Tournament(models.Model):
    date_tournament = models.DateTimeField(null=True, blank=True)
    player01 = models.ForeignKey('user_list', related_name='player01_tournaments', on_delete=models.CASCADE)
    player02 = models.ForeignKey('user_list', related_name='player02_tournaments', on_delete=models.CASCADE)
    player03 = models.ForeignKey('user_list', related_name='player03_tournaments', on_delete=models.CASCADE)
    player04 = models.ForeignKey('user_list', related_name='player04_tournaments', on_delete=models.CASCADE)

    def create_matches(self):
        Match.objects.create(player1=self.player01, player2=self.player02)
        Match.objects.create(player1=self.player03, player2=self.player04)
        # TODO les 2 winners doivent s'affronter

    class Meta:
        db_table = 'django_tournament'

# appelle de méthode :
#   tournoi.create_matches()
