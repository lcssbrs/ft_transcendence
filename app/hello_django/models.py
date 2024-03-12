from django.db import models
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# TODO LIST :
    # historique tournoi: position, date, résultat dernier match, adversaire dernier match
    # historique ranked: résultat (victoire ou défaite), score, adversaire, gain de lp

def validate_password_length(value):
    if len(value) < 8:
        raise ValidationError("Le mot de passe doit contenir au moins 8 caractères.")

class tournament(models.Model):
    ID_tournament =  models.PositiveIntegerField(default=0)
    date_tournament =  models.DateTimeField(null=True, blank=True)
    player1 = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    player2 = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    player3 = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    player4 = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    match1 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])
    match2 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])
    match3 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])
    result1 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])
    result2 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])
    result3 = models.CharField(max_length=25, validators=[ASCIIUsernameValidator()])

    class Meta:
        db_table = 'django_tournament'



class user_list(models.Model):
    first_name = models.CharField(max_length=15)
    last_name = models.CharField(max_length=15)
    username = models.CharField(max_length=12, validators=[ASCIIUsernameValidator()])
    password = models.CharField(max_length=128, validators=[validate_password_length])
    email = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='photos/', default='photos/default-profile.jpg')
    status = models.CharField(max_length=20, default='offline', choices=[('online', 'En ligne'), ('offline', 'Hors ligne'), ('in_game', 'En jeu')])
    last_login = models.DateTimeField(null=True, blank=True)
    double_auth = models.BooleanField(default=0)
    # Tournoi:
    last_tournament_position = models.PositiveIntegerField(default=0)
    last_tournament_date = models.DateTimeField(null=True, blank=True)
    last_match_tournament_result = models.CharField(max_length=15)
    last_match_tournament_opponent = models.CharField(max_length=15)
    # Ranked:
    user_score = models.PositiveIntegerField(default=0)



    def __str__(self):
        return self.username

    class Meta:
        db_table = 'django_user_list'

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

