from django.shortcuts import render, redirect
from .forms import add_user_form
from .models import models, user_list, Tournament, Match
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.conf import settings
from django.utils.http import urlencode
from django.http import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserListSerializer, UserDetailSerializer, MatchListSerializer
import logging
import requests
import urllib.request
from PIL import Image
from django.core.files import File
from pathlib import Path
import os
from django_otp.plugins.otp_email.models import EmailDevice
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_jwt.settings import api_settings
import jwt
from django.core.mail import send_mail
#from django_two_factor_auth.utils import get_qrcode_url
#from django_two_factor_auth.utils import verify_code


def exemple_view(request):
    return render(request, 'exemple.html', {'user': request.user})

def index(request):
    return render (request, 'index.html', {'user': request.user})

def profile_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/profile.html', {'user': request.user})

    return render(request, 'profile.html', {'user': request.user})

def ranked_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/ranked.html', {'user': request.user})

    return render(request, 'ranked.html', {'user': request.user})

def tournament_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/tournament.html', {'user': request.user})

    return render(request, 'tournament.html', {'user': request.user})

def ranking_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/ranking.html', {'user': request.user})

    return render(request, 'ranking.html', {'user': request.user})

def solo_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/solo.html', {'user': request.user})

    return render(request, 'solo.html', {'user': request.user})

def local_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/local.html', {'user': request.user})

    return render(request, 'local.html', {'user': request.user})

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
                generate_qrcode(user_list.objects.get(id))
                return redirect('index')
    else:
        form = add_user_form()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/register.html', {'form': form, 'error_message': error_message})

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
                verify_user_code(user.id)
                return redirect('index')
            else:
                messages.error(request, "Échec de l'authentification: Nom d'utilisateur ou mot de passe incorrect.")
                return redirect('login')
        else:
            messages.error(request, "Échec de la validation du formulaire.")
            return redirect('login')
    else:
        form = AuthenticationForm()

    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/login.html', {'form': form})

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
            user, created = user_list.objects.get_or_create(username=user_data['login'])
            user.first_name = user_data.get('first_name', '')
            user.last_name = user_data.get('last_name', '')
            user.email = user_data.get('email', '')
            if created:
                image = user_data.get('image', '')
                image = image.get('versions', '')
                image = image.get('medium')
                filename, headers = urllib.request.urlretrieve(image)
                photos_directory = 'media/photos/'
                if not os.path.exists(photos_directory):
                    os.makedirs(photos_directory)
                with open(filename, 'rb') as image_file:
                    image_data = image_file.read()
                output_filename = os.path.join(photos_directory, user.username.removesuffix('test') + '.png')
                with open(output_filename, 'wb') as output_file:
                    output_file.write(image_data)
                    user.image = output_filename
            user.save()
            logger.error("Échec de la récupération des informations utilisateur. Code d'erreur : %d", user_response.status_code)
    else:
        logger.error("Échec de la récupération du jeton d'accès. Code d'erreur : %d", response.status_code)
    return redirect('index')

# API

# TODO FAIRE API/ENDPOINTS

class api_user_list(APIView):
    def get(self, request):
        users = user_list.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)

class api_user_details(APIView):
    def get(self, request, id):
        try:
            user = user_list.objects.get(pk=id)
        except user_list.DoesNotExist:
            return Response({"message": "L'utilisateur n'existe pas."}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserDetailSerializer(user)
        return Response(serializer.data)

class api_match_list(APIView):
    def get(self, request):
        matchs = Match.objects.all()
        serializer = MatchListSerializer(matchs, many=True)
        return Response(serializer.data)

class api_match_details(APIView):
    def get(self, request, id):
        try:
            match = Match.objects.get(pk=id)
        except Match.DoesNotExist:
            return Response({"message": "Le match n'existe pas."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MatchListSerializer(match)
        return Response(serializer.data)

# DEV

def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})


#2fa google

#def generate_qrcode(request, user_id):
#    user = user_list.objects.get(pk=user_id)
#    qrcode_url = get_qrcode_url(user)
#    qrcode = qrcode.make(qrcode_url)
#    qrcode.save(user.username + '_qrcode.png')
#    return render(request, 'register.html', {'qrcode_url': qrcode_url})
#
#def verify_user_code(request, user_id):
#    user = user = user_list.objects.get(pk=user_id)
#    if verify_code(user, user.id):
#        return render('profile.html')
#    else:
#        return render('login.html')
#
