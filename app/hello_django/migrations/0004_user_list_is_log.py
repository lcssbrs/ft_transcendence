# Generated by Django 4.2.3 on 2024-03-21 13:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hello_django', '0003_alter_user_list_double_auth'),
    ]

    operations = [
        migrations.AddField(
            model_name='user_list',
            name='is_log',
            field=models.BooleanField(default=0),
        ),
    ]
