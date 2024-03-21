from django.shortcuts import render, redirect
from .forms import add_user_form
from .models import models, user_list, Tournament, Match, Friendship
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.conf import settings
from django.http import HttpResponse
from django.http import JsonResponse
from django.http import HttpResponseNotFound
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserListSerializer, UserDetailSerializer, MatchListSerializer, TournoiListSerializer
import os
import urllib
import logging
import requests
from .backends import CustomAuthenticationBackend

def index(request):
    return render (request, 'index.html', {'user': request.user})

def profile_view (request):
    return render(request, 'profile.html', {'user': request.user})

def ranked_view (request):
    return render(request, 'ranked.html', {'user': request.user})

def tournament_view (request):
    return render(request, 'tournament.html', {'user': request.user})

def ranking_view(request):
    top_players = user_list.objects.order_by('-games_rank')[:10]

    context = {
        'top_players': top_players
    }

    return render(request, 'ranking.html', context, {'user': request.user})


def solo_view(request):
    return render(request, 'solo.html', {'user': request.user})

def local_view(request):
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
                return redirect('login')
    else:
        form = add_user_form()

    return render(request, 'register.html', {'form': form, 'error_message': error_message})

def login_view(request):
    error_message = ''
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
                error_message = "Nom d'utilisateur ou mot de passe incorrect."
                messages.error(request, "Nom d'utilisateur ou mot de passe incorrect.")
                return redirect('login')
        else:
            error_message = "Échec de la validation du formulaire."
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
            user_info = user_response.json()
            username = user_info.get('login')
            email = user_info.get('email')
            first_name = user_info.get('first_name')
            last_name = user_info.get('last_name')

            user, created = user_list.objects.get_or_create(username=username, email=email)
            user.first_name = first_name
            user.last_name = last_name
            user.password = " "
            user.intra = True

            if created:
                image = user_info.get('image', '')
                image = image.get('versions', '')
                image = image.get('medium')
                filename, headers = urllib.request.urlretrieve(image)
                photos_directory = 'media/photos/'
                if not os.path.exists(photos_directory):
                    os.makedirs(photos_directory)
                with open(filename, 'rb') as image_file:
                    image_data = image_file.read()
                output_filename = os.path.join(photos_directory, user.username + '.png')
                with open(output_filename, 'wb') as output_file:
                    output_file.write(image_data)
                user.profile_picture = 'photos/' + user.username + '.png'
            user.save()
            user_login = authenticate(request, username=username, password=" ")
            if user_login is not None:
                login(request, user_login)
                return redirect('index')
            else:
                return redirect('login')
    return redirect('index')

# API

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

class api_tournois_list(APIView):
    def get(self, request):
        tournoi = Tournament.objects.all()
        serializer = TournoiListSerializer(tournoi, many=True)
        return Response(serializer.data)

class api_tournois_details(APIView):
    def get(self, request, id):
        try:
            tournoi = Tournament.objects.get(pk=id)
        except Tournament.DoesNotExist:
            return Response({"message": "Le tournoi n'existe pas."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TournoiListSerializer(tournoi)
        return Response(serializer.data)

# Friend

def add_friend(request, friend_id):
    if request.method == 'POST':
        from_user = request.user
        to_user = user_list.objects.get(pk=friend_id)
        existing_friendship = Friendship.objects.filter(from_user=from_user, to_user=to_user)
        if existing_friendship.exists():
            return JsonResponse({'error': 'Vous avez déjà envoyé une demande d\'ami à cet utilisateur.'}, status=400)
        else:
            if from_user.friends.filter(pk=to_user.pk).exists() or to_user.friends.filter(pk=from_user.pk).exists():
                return JsonResponse({'error': 'Cet utilisateur est déjà dans votre liste d\'amis.'}, status=400)
            Friendship.objects.create(from_user=from_user, to_user=to_user)
            return JsonResponse({'success': 'Demande d\'ami envoyée avec succès.'})

def add_friend_username(request, username):
    if request.method == 'POST':
        from_user = request.user
        try:
            to_user = user_list.objects.get(username=username)
            if from_user == to_user:
                return JsonResponse({'error': 'Vous ne pouvez pas vous ajouter vous-même comme ami'}, status=400)
            existing_friendship = Friendship.objects.filter(from_user=from_user, to_user=to_user)
            if existing_friendship.exists():
                return JsonResponse({'error': 'Vous avez déjà envoyé une demande d\'ami à cet utilisateur.'}, status=400)
            if from_user.friends.filter(pk=to_user.pk).exists() or to_user.friends.filter(pk=from_user.pk).exists():
                return JsonResponse({'error': 'Cet utilisateur est déjà dans votre liste d\'amis.'}, status=400)
            Friendship.objects.create(from_user=from_user, to_user=to_user)
            return JsonResponse({'success': 'Demande d\'ami envoyée avec succès.'})
        except user_list.DoesNotExist:
            return JsonResponse({'error': 'Utilisateur non trouvé.'}, status=404)
    return JsonResponse({'error': 'Méthode non autorisé.'}, status=404)

def accept_friend_request(request, request_id):
    if request.method == 'POST':
        try:
            friend_request = Friendship.objects.get(id=request_id)
            if not friend_request.accepted:
                from_user = friend_request.from_user
                to_user = friend_request.to_user
                from_user.friends.add(to_user)
                to_user.friends.add(from_user)
                friend_request.accepted = True
                friend_request.delete()
                return JsonResponse({'success': 'Demande d\'ami acceptée avec succès.'})
            else:
                return JsonResponse({'error': 'Cette demande d\'ami a déjà été acceptée.'}, status=400)
        except Friendship.DoesNotExist:
            return HttpResponseNotFound("Cette demande d'ami n'existe pas.")

def reject_friend_request(request, request_id):
    if request.method == 'POST':
        try:
            friend_request = Friendship.objects.get(id=request_id)
            friend_request.delete()
            return JsonResponse({'success': 'Demande d\'ami rejetée avec succès.'})
        except Friendship.DoesNotExist:
            return HttpResponseNotFound("Cette demande d'ami n'existe pas.")


def get_friends(request):
    if request.user.is_authenticated:
        user = request.user
        friends = user.friends.all()
        friends_data = [{'id': friend.id, 'username': friend.username, 'status': friend.status} for friend in friends]
        return JsonResponse({'friends': friends_data})
    else:
        return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

def remove_friend(request):
    if request.method == 'POST':
        friend_id = request.POST.get('friend_id')
        user = request.user
        try:
            friend = user_list.objects.get(pk=friend_id)
            user.friends.remove(friend)
            friend.friends.remove(user)
            return JsonResponse({'message': 'Ami supprimé avec succès'})
        except user_list.DoesNotExist:
            return JsonResponse({'message': 'Ami non trouvé'}, status=404)
    else:
        return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

def get_friend_requests(request):
    if request.method == 'GET':
        user = request.user
        friend_requests = Friendship.objects.filter(to_user=user, accepted=False)
        friend_requests_data = [{'id': request.id, 'from_user': request.from_user.username} for request in friend_requests]
        return JsonResponse({'friend_requests': friend_requests_data})
    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)


# DEV

def exemple_view(request):
    list = user_list.objects.all()
    return render(request, 'exemple.html', {'user': request.user, 'list': list})

def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})
