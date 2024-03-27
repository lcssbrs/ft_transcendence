from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import user_list

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    user_list.objects.update_or_create(user=user, defaults={'status': 'online'})

@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    user_list.objects.update_or_create(user=user, defaults={'status': 'offline'})
