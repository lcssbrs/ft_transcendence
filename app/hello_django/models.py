from django.db import models
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password

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
    profile_picture = models.ImageField(upload_to='photos/', default='default-profile.jpg')
    status = models.CharField(max_length=20, choices=[('online', 'En ligne'), ('offline', 'Hors ligne'), ('in_game', 'En jeu')])
    last_login = models.DateTimeField(null=True, blank=True)
    # Parties:
    games_played = models.PositiveIntegerField(default=0)
    games_win = models.PositiveIntegerField(default=0)
    games_loose = models.PositiveIntegerField(default=0)
    games_rank = models.PositiveIntegerField(default=0)

    # hash le mdp
    def save(self, *args, **kwargs):
        self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'django_user_list'
