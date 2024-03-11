from django.shortcuts import render
from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.conf import settings
import requests
from django.contrib.auth import get_user_model
import logging
from .models import user_list

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'index.html')

def home(request):
    return render(request, 'home.html')

def connexion_42(request):
    return redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fa6f764441ccb32fcd2d4bd0fbef3aa90a88bc80e5fa72f6cca3db6a645560e3&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fredirection_apres_authentification&response_type=code')

def redirection_apres_authentification(request):
    code_autorisation = request.GET.get('code')
    if code_autorisation:
        return redirect('exchange_code_for_access_token', code=code_autorisation)
    else:
        return HttpResponse("Erreur: Code d'autorisation manquant")

def exchange_code_for_access_token(request, code):
    token_url = 'https://api.intra.42.fr/oauth/token'
    redirect_uri = settings.LOGIN_REDIRECT_URL
    data = {
        'grant_type': 'authorization_code',
        'client_id': settings.SOCIAL_AUTH_42_KEY,
        'client_secret': settings.SOCIAL_AUTH_42_SECRET,
        'code': code,
        'redirect_uri': 'http://localhost:8000/redirection_apres_authentification',
    }
    response = requests.post(token_url, data=data)

    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access_token')

        user_info_url = 'https://api.intra.42.fr/v2/me'
        head = {'Authorization': f'Bearer {token}'}
        user_response = requests.get(user_info_url, headers=head)

        if user_response.status_code == 200:
            user_data = user_response.json()
            User = get_user_model()
            user, created = User.objects.get_or_create(username=user_data['login'])
            user.first_name = user_data.get('first_name', '')
            user.last_name = user_data.get('last_name', '')
            user.email = user_data.get('email', '')
            if created:
                image = user_data.get('image', '')
                image = image.get('versions', '')
                image = image.get('small')
                usersaved = user_list(user.id ,user_data.get('first_name', ''), user_data.get('last_name', ''), user_data.get('login', ''), '', user_data.get('email', ''), image)
                usersaved.save()
                user.save()
            else:
                image = user_data.get('image', '')
                image = image.get('versions', '')
                image = image.get('small')
                print(user_data.get('first_name', ''), user_data.get('last_name', ''), user_data.get('email', ''), image)
        else:
            logger.error("Échec de la récupération des informations utilisateur. Code d'erreur : %d", user_response.status_code)
    else:
        logger.error("Échec de la récupération du jeton d'accès. Code d'erreur : %d", response.status_code)
    return redirect('home')


def double_auth(request):
    if (request == 'POST'):
        print('on tente')
    else:
        print ('je pense pas que ca marche')
    return (redirect('home'))

