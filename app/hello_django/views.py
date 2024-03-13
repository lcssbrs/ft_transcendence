from django.shortcuts import render, redirect
from .forms import add_user_form
from .models import models, user_list, Tournament, Match
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.conf import settings
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.models import User
import logging
import requests

def index(request):
    return render (request, 'index.html')

def profile_view (request):
    return render(request, 'profile.html')

def ranked_view (request):
    return render(request, 'ranked.html')

def tournament_view (request):
    return render(request, 'tournament.html')

def ranking_view(request):
    return render(request, 'ranking.html')

def solo_view(request):
    return render(request, 'solo.html')

def local_view(request):
    return render(request, 'local.html')

def no_view(request):
    return render(request, 'nothing.html')

#check users status for ranked mode
def get_connected_users(request):
    connected_users = User.objects.filter(is_active=True)
    user_names = [user.username for user in connected_users]
    return JsonResponse({'user_names': user_names})


# Login / register

def register_view(request):
    error_message = None

    if request.method == 'POST':
        form = add_user_form(request.POST, request.FILES)
        if form.is_valid():
            email = form.cleaned_data['email']
            if user_list.objects.filter(email=email).exists():
                error_message = "Cet email est déjà utilisé. Veuillez en choisir un autre."
            username = form.cleaned_data['username']
            if user_list.objects.filter(username=username).exists():
                error_message = "Ce pseudo est déjà utilisé. Veuillez en choisir un autre."

            if not error_message:
                form.save()
                return redirect('index')
    else:
        form = add_user_form()

    return render(request, 'register.html', {'form': form, 'error_message': error_message})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index')
            else:
                messages.error(request, "Échec de l'authentification: Nom d'utilisateur ou mot de passe incorrect.")
                return redirect('login')
        else:
            messages.error(request, "Échec de la validation du formulaire.")
            return redirect('login')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

# API LOGIN 42

logger = logging.getLogger(__name__)

def connexion_42(request):
    return redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fa6f764441ccb32fcd2d4bd0fbef3aa90a88bc80e5fa72f6cca3db6a645560e3&redirect_uri=http%3A%2F%2Flocalhost%3A80%2Fredirection_apres_authentification&response_type=code')

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
        'redirect_uri': 'http://localhost:80/redirection_apres_authentification',
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
            user, created = User.objects.get_or_create(username=user_data['login'] + 'test')
            user.first_name = user_data.get('first_name', '')
            user.last_name = user_data.get('last_name', '')
            user.email = user_data.get('email', '')
            if created:
                image = user_data.get('image', '')
                image = image.get('versions', '')
                image = image.get('small')
                usersaved = user_list(user.id, user_data.get('first_name', ''), user_data.get('last_name', ''), user_data.get('login', ''), '', user_data.get('email', ''), image)
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
    return redirect('index')

# API

# TODO FAIRE API/ENDPOINTS

# DEV

def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})
