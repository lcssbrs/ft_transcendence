from django.shortcuts import render, redirect, get_object_or_404
from .models import models, user_list, Tournament, Match, Friendship, Match
from .forms import add_user_form, loginForm, UserProfileForm
from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.conf import settings
import json
from django.utils.http import urlencode
from django.http import HttpResponse
from django.http import JsonResponse
from django.http import HttpResponseNotFound
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserListSerializer, UserDetailSerializer, MatchListSerializer, TournoiListSerializer, UserSerializer
import os
import urllib
import logging
import requests
import jwt
import urllib.request
from PIL import Image
from django.core.files import File
from pathlib import Path
import os
from django.conf import settings
from rest_framework_jwt.settings import api_settings
import jwt
from django.core.mail import send_mail
from io import BytesIO
from django.http import HttpResponse
from qrcode import make
from django.contrib.auth.decorators import login_required
from qrcode.image.pil import PilImage
from .backends import CustomAuthenticationBackend
from django.db.models import Q

def afficher_qr_code(request):
    if (request.user.is_authenticated == False):
        return redirect ('login')
    return render(request, 'qr_code.html', {'user': request.user})

def index(request):
    return render (request, 'index.html', {'user': request.user})

class MatchHistory:
    def __init__(self, ranked, profile_user):
        if (profile_user.username == ranked.player_winner.username):
            self.gain = '+25 LP'
            self.status = 'Victoire'
        else:
            self.gain = '-25 LP'
            self.status = 'Défaite'
        if (ranked.player1.username == profile_user.username):
            self.challenger = ranked.player2
            self.userScore = ranked.score_player1
            self.challScore = ranked.score_player2
        else:
            self.challenger = ranked.player1
            self.userScore = ranked.score_player2
            self.challScore = ranked.score_player1

class TournamentHistory:
    def __init__(self, tournament, profile_user):
        final = Match.objects.get(id=tournament.final_id)
        if (final.player1.username == profile_user.username or final.player2.username == profile_user.username):
            if (tournament.player_winner.username == profile_user.username):
                self.rank = 1
            else :
                self.rank = 2
            if (final.player1.username == profile_user.username):
                self.lastChall = final.player2.username
                self.lastUserScore = final.score_player1
                self.lastChallScore = final.score_player2
            else:
                self.lastChall = final.player2.username
                self.lastUserScore = final.score_player2
                self.lastChallScore = final.score_player1
        else:
            match1 = Match.objects.get(id=tournament.match1_id)
            match2 = Match.objects.get(id=tournament.match2_id)
            if (match1.player1.username == profile_user.username):
                self.lastChall = match1.player2.username
                self.lastUserScore = match1.score_player1
                self.lastChallScore = match1.score_player2
            elif (match1.player2.username == profile_user.username):
                self.lastChall = match1.player2.username
                self.lastUserScore = match1.score_player2
                self.lastChallScore = match1.score_player1
            elif (match2.player1.username == profile_user.username):
                self.lastChall = match2.player2.username
                self.lastUserScore = match2.score_player1
                self.lastChallScore = match2.score_player2
            elif (match2.player2.username == profile_user.username):
                self.lastChall = match2.player2.username
                self.lastUserScore = match2.score_player2
                self.lastChallScore = match2.score_player1
            self.rank = 4
        self.date = tournament.date_tournament

def profile_view(request):
    id_value = request.GET.get('id', None)
    profile_user = user_list.objects.get(id=id_value)
    top_players = sortranking()
    user_rank = None
    for user in top_players:
        if user.id == profile_user.id:
            user_rank = user.position
            break
    if profile_user.games_rank <= 30:
        ranksrc = '/static/images/bronze.png'
        rank = 'Bronze'
    elif profile_user.games_rank <= 60:
        ranksrc = '/static/images/emerald.png'
        rank = 'Emeraude'
    elif profile_user.games_rank <= 90:
        ranksrc = '/static/images/master.png'
        rank = 'Master'
    else:
        ranksrc = '/static/images/challenger.png'
        rank = 'Challenger'

    tournaments_ended = Tournament.objects.filter(status='end_game')
    matches_ended = Match.objects.filter(status='end_game')
    unique_matches = []
    for match in matches_ended:
        match_id = match.id
        if not any(match_id in (t.match1_id, t.match2_id, t.final_id) for t in tournaments_ended):
            unique_matches.append(match)
    matches_participated = [match for match in unique_matches if match.player1 == profile_user.id or match.player2 == profile_user.id]
    matches_participated = matches_participated[::-1][:5]
    rankedHistory = []
    for i in matches_participated:
        rankedHistory.append(MatchHistory(i, profile_user))

    tournaments_participated = tournaments_ended.filter(Q(player01=profile_user.id) | Q(player02=profile_user.id) | Q(player03=profile_user.id) | Q(player04=profile_user.id))
    tournaments_participated = tournaments_participated[::-1][:5]
    tournamentHistory = []
    for i in tournaments_participated:
        tournamentHistory.append(TournamentHistory(i, profile_user))

    context = {
        'profile_user': profile_user,
        'user_rank': user_rank,
        'user': request.user,
        'rank': rank,
        'ranksrc': ranksrc,
        'rankedHistory': rankedHistory,
        'tournamentHistory': tournamentHistory
    }
    return render(request, 'profile.html', context)

def ranked_view (request):
    return render(request, 'ranked.html', {'user': request.user})

def tournament_view (request):
    return render(request, 'tournament.html', {'user': request.user})


class UserWithPosition:
    def __init__(self, user, position):
        self.username = user.username
        self.games_rank = user.games_rank
        self.games_win = user.games_win
        self.games_loose = user.games_loose
        self.id = user.id
        self.position = position

def sortranking():
    users = user_list.objects.all()
    users_sorted = sorted(users, key=lambda x: (x.games_rank, x.games_win - x.games_loose), reverse=True)

    users_with_position = []
    current_position = 1
    prev_user = None
    for user in users_sorted:
        if prev_user and user.games_rank == prev_user.games_rank and user.games_win - user.games_loose == prev_user.games_win - prev_user.games_loose:
            users_with_position.append(UserWithPosition(user, users_with_position[-1].position))
        else:
            users_with_position.append(UserWithPosition(user, current_position))
            current_position += 1
        prev_user = user

    users_with_position_sorted = sorted(users_with_position, key=lambda x: x.position)
    return users_with_position_sorted

def ranking_view(request):
    top_players = sortranking()

    context = {
        'top_players': top_players,
        'user': request.user
    }

    return render(request, 'ranking.html', context)

def solo_view(request):
    return render(request, 'solo.html', {'user': request.user})

def local_view(request):
    return render(request, 'local.html', {'user': request.user})

def edit_profile(request):
    user = request.user
    userpr = user_list.objects.get(username=user.username)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():

            userpr.first_name = form.cleaned_data['first_name']
            userpr.last_name = form.cleaned_data['last_name']
            if 'profile_picture' in request.FILES:
                user.profile_picture = request.FILES['profile_picture']
            user.save()
            return JsonResponse({'success': True, 'id': user.id})
        else:
            return JsonResponse({'success': False, 'error_message': 'Échec de la validation du formulaire.'})
    else:
        form = UserProfileForm(instance=user)

    return render(request, 'edit_profile.html', {'form': form})

#WEBSOCKETS

def check_match(request):
    try:
        # Vérifier si un match existe dans la base de données
        match_exists = Match.objects.exists()
    except Exception as e:
        # Gérer les exceptions comme vous le souhaitez
        return JsonResponse({'error': str(e)}, status=500)

    # Envoyer le résultat au client
    return JsonResponse({'exists': match_exists})

class JoinMatch(APIView):
    def post(self, request):
        match = Match.objects.filter(status='waiting', player2__isnull=True).exclude(player1=request.user).first()

        if match:
            match.player2 = request.user
            match.status = 'in_game'
            match.save()
            serializer = MatchListSerializer(match)
            return Response(serializer.data)
        else:
            new_match = Match(player1=request.user)
            new_match.save()
            serializer = MatchListSerializer(new_match)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class CreateMatch(APIView):
    def post(self, request):
        new_match = Match(player1=request.user)
        new_match.save()
        serializer = MatchListSerializer(new_match)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Login / register

def register_view(request):
    error_message = None
    response_data = {}

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
                response_data['success'] = True
                response_data['message'] = "Utilisateur enregistré avec succès."
                password = form.cleaned_data.get('password')
                user = authenticate(request, username=username, password=password)
                login(request, user)
                generer_qr_code(user)
                return JsonResponse(response_data)
            else:
                response_data['success'] = False
                response_data['error_message'] = error_message
                return JsonResponse(response_data, status=400)
        else:
            response_data['success'] = False
            response_data['error_message'] = "Données invalides."
            return JsonResponse(response_data, status=400)
    else:
        form = add_user_form()

    return render(request, 'register.html', {'form': form, 'error_message': error_message})

def login_view(request):
    if request.method == 'POST':
        form = loginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            token = form.cleaned_data['token']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                user2 = user_list.objects.get(username=username)
                if (user2.jwt_token != 'b\'' + token + '\''):
                    return JsonResponse({'success': False, 'error_message': 'Token de sécurité invalide'})
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error_message': 'Nom d\'utilisateur ou mot de passe incorrect ou clé d\'authentification incorrecte.'})
        else:
            return JsonResponse({'success': False, 'error_message': 'Échec de la validation du formulaire.'})
    else:
        form = loginForm()

    return render(request, 'login.html', {'form': form})


# API LOGIN 42

logger = logging.getLogger(__name__)

def connexion_42(request):
    return redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fa6f764441ccb32fcd2d4bd0fbef3aa90a88bc80e5fa72f6cca3db6a645560e3&redirect_uri=http%3A%2F%2Flocalhost%2Fredirection_apres_authentification&response_type=code')

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
        'redirect_uri': 'http://localhost/redirection_apres_authentification',
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
            if (user_list.objects.filter(username=username).exists() and user_list.objects.get(username=username).intra == False):
                return redirect('login')
            email = user_info.get('email')
            first_name = user_info.get('first_name')
            last_name = user_info.get('last_name')

            user, created = user_list.objects.get_or_create(username=username, email=email)
            user.first_name = first_name
            user.last_name = last_name
            user.password = " "

            if created:
                user.intra = True
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

class api_user_view(APIView):
    def get(self, request):
        user = user_list.objects.get(id=request.user.id)
        serializer = UserSerializer(user)
        return Response(serializer.data)

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
    def patch(self, request, id):
        try:
            match = Match.objects.get(pk=id)
        except Match.DoesNotExist:
            return Response({"message": "Le match n'existe pas."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MatchListSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if match.status != 'cancel':
                match.update_scores()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def patch(self, request, id):
        try:
            tournoi = Tournament.objects.get(pk=id)
        except Tournament.DoesNotExist:
            return Response({"message": "Le tournoi n'existe pas."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TournoiListSerializer(tournoi, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
                return JsonResponse({'error': 'Ces utilisateurs sont déjà amis.'}, status=400)
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
                return JsonResponse({'error': 'Ces utilisateurs sont déjà amis.'}, status=400)
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
                return JsonResponse({'success': True, 'message': 'Demande d\'ami acceptée avec succès.'})
            else:
                return JsonResponse({'success': False, 'message': 'Cette demande d\'ami a déjà été acceptée.'}, status=400)
        except Friendship.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Cette demande d\'ami n\'existe pas.'})

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
        friends_requests = Friendship.objects.filter(to_user=user, accepted=False)
        friends_requests_data = [{'id': friend_request.id, 'from_user': friend_request.from_user.username} for friend_request in friends_requests]
        return JsonResponse({'friend_requests': friends_requests_data})
    else:
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

# DEV

class JoinMatch(APIView):
    def post(self, request):
        match = Match.objects.filter(status='waiting', player2__isnull=True).exclude(player1=request.user).first()

        if match:
            match.player2 = request.user
            match.status = 'in_game'
            match.save()
            serializer = MatchListSerializer(match)
            return Response({"match_exists": True, "match_data": serializer.data})
        else:
            new_match = Match(player1=request.user)
            new_match.save()
            serializer = MatchListSerializer(new_match)
            return Response({"match_exists": False, "match_data": serializer.data}, status=status.HTTP_201_CREATED)

            from rest_framework.views import APIView

class JoinTournament(APIView):
    def post(self, request):
        user_tournament = Tournament.objects.filter(
            status='waiting',
            player01=request.user
        ).first()

        if user_tournament:
            serializer = TournoiListSerializer(user_tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)

        tournament = Tournament.objects.filter(status='waiting').first()

        if tournament:
            if tournament.player02 == request.user or tournament.player03 == request.user or tournament.player04 == request.user:
                serializer = TournoiListSerializer(tournament)
                return Response(serializer.data, status=status.HTTP_200_OK)

            if tournament.player01 is None:
                tournament.player01 = request.user
            elif tournament.player02 is None:
                tournament.player02 = request.user
            elif tournament.player03 is None:
                tournament.player03 = request.user
            elif tournament.player04 is None:
                tournament.player04 = request.user

            if all([tournament.player01, tournament.player02, tournament.player03, tournament.player04]):
                tournament.status = 'in_game'
                tournament.create_matches()

            tournament.save()

            serializer = TournoiListSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            user_tournament_in_game = Tournament.objects.filter(
                status='waiting',
                player01=request.user
            ).first()

            if user_tournament_in_game:
                serializer = TournoiListSerializer(user_tournament_in_game)
                return Response(serializer.data, status=status.HTTP_200_OK)

            new_tournament = Tournament.objects.create(player01=request.user, status='waiting')

            serializer = TournoiListSerializer(new_tournament)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class CreateFinalMatch(APIView):
    def post(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
            tournament.check_and_create_final()
            return Response("Tournoi crée", status=status.HTTP_201_CREATED)
        except Tournament.DoesNotExist:
            return Response("Ce tournoi n\'exite pas", status=status.HTTP_404_NOT_FOUND)

class CreateMatch(APIView):
    def post(self, request):
        new_match = Match(player1=request.user)
        new_match.save()
        serializer = MatchListSerializer(new_match)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

def exemple_view(request):
    list = user_list.objects.all()
    return render(request, 'exemple.html', {'user': request.user, 'list': list})

def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})

def generer_qr_code(user):
    buffer = BytesIO()
    payload = {
        'user_id': user.id,
    }
    jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    user.jwt_token = jwt_token
    user.save()
    qr_code = make(jwt_token)
    img = qr_code.convert('RGB')
    img.save(buffer, format='PNG')
    image_bytes = buffer.getvalue()
    user.qr_code.save(f'{user.username}_qr_code.png', ContentFile(image_bytes))
    return HttpResponse(json.dumps({'jwt_token': jwt_token.decode('utf-8')}), content_type='application/json')

def decode_jwt_token(request):
    # Récupérer le token depuis la requête (par exemple depuis les paramètres GET ou POST)
    token = request.POST.get('token')

    # Clé secrète utilisée pour signer le token
    secret_key = 'test'

    try:
        # Décoder le token en utilisant la clé secrète
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        # Payload contient les informations décodées du token
        return JsonResponse({'success': True, 'payload': payload})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'success': False, 'error': 'Token expiré'})
    except jwt.InvalidTokenError:
        return JsonResponse({'success': False, 'error': 'Token invalide'})

def edit_profile(request):
    user = request.user
    userpr = user_list.objects.get(username=user.username)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            # Mettre à jour les informations de l'utilisateur dans la base de données
            userpr.first_name = form.cleaned_data['first_name']
            userpr.last_name = form.cleaned_data['last_name']
            if 'profile_picture' in request.FILES:
                user.profile_picture = request.FILES['profile_picture']
            user.save()
            return JsonResponse({'success': True, 'id': user.id})
        else:
            return JsonResponse({'success': False, 'error_message': 'Échec de la validation du formulaire.'})
    else:
        form = UserProfileForm(instance=user)

    return render(request, 'edit_profile.html', {'form': form})

class CurrentUser(APIView):
    def get(self, request):
        current_user = request.user
        if current_user.is_authenticated:
            try:
                user_info = user_list.objects.get(username=current_user.username)
                serializer = UserDetailSerializer(user_info)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except user_list.DoesNotExist:
                return Response({"message": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"message": "Aucun utilisateur connecté"}, status=status.HTTP_401_UNAUTHORIZED)
