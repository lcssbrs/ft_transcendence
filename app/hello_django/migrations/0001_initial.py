# Generated by Django 4.2.3 on 2024-03-11 15:10

import django.contrib.auth.validators
from django.db import migrations, models
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
                ('games_played', models.PositiveIntegerField(default=0)),
                ('games_win', models.PositiveIntegerField(default=0)),
                ('games_loose', models.PositiveIntegerField(default=0)),
                ('games_rank', models.PositiveIntegerField(default=0)),
            ],
            options={
                'db_table': 'django_user_list',
            },
        ),
    ]
