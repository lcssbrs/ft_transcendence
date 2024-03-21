# Generated by Django 4.2.3 on 2024-03-21 14:24

import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import hello_django.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='user_list',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=15)),
                ('last_name', models.CharField(max_length=15)),
                ('username', models.CharField(max_length=12, validators=[django.contrib.auth.validators.ASCIIUsernameValidator()])),
                ('password', models.CharField(max_length=128, validators=[hello_django.models.validate_password_length])),
                ('email', models.CharField(max_length=50)),
                ('profile_picture', models.ImageField(default='photos/default-profile.jpg', upload_to='photos/')),
                ('status', models.CharField(choices=[('online', 'En ligne'), ('offline', 'Hors ligne'), ('in_game', 'En jeu')], default='offline', max_length=20)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('double_auth', models.BooleanField(default=0)),
                ('intra', models.BooleanField(default=False)),
                ('games_played', models.PositiveIntegerField(default=0)),
                ('games_win', models.PositiveIntegerField(default=0)),
                ('games_loose', models.PositiveIntegerField(default=0)),
                ('games_rank', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('friends', models.ManyToManyField(blank=True, to='hello_django.user_list')),
            ],
            options={
                'db_table': 'django_user_list',
            },
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_tournament', models.DateTimeField(blank=True, null=True)),
                ('player01', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player01_tournaments', to='hello_django.user_list')),
                ('player02', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player02_tournaments', to='hello_django.user_list')),
                ('player03', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player03_tournaments', to='hello_django.user_list')),
                ('player04', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player04_tournaments', to='hello_django.user_list')),
            ],
            options={
                'db_table': 'django_tournament',
            },
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score_player1', models.IntegerField(default=0)),
                ('score_player2', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('waiting', 'En attente de joueurs'), ('end_game', 'Fin de partie'), ('in_game', 'En jeu')], default='waiting', max_length=20)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1_matches', to='hello_django.user_list')),
                ('player2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player2_matches', to='hello_django.user_list')),
                ('player_winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='winner_matches', to='hello_django.user_list')),
            ],
        ),
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accepted', models.BooleanField(default=False)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend_requests_sent', to='hello_django.user_list')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend_requests_received', to='hello_django.user_list')),
            ],
        ),
    ]
