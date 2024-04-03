from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from .models import user_list

class CustomAuthenticationBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = user_list.objects.get(username=username)
            if user.intra:
                return user
            elif not user.intra and check_password(password, user.password):
                return user
        except user_list.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return user_list.objects.get(pk=user_id)
        except user_list.DoesNotExist:
            return None
