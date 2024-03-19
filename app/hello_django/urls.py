"""
URL configuration for hello_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views
from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from django.conf.urls.static import static
from .views import user_list_view, index, solo_view, login_view, register_view, local_view, ranking_view, ranked_view, tournament_view, profile_view

urlpatterns = [
    path('', index, name='index'),
    path('solo/', solo_view, name='solo'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('local/', local_view, name='local'),
    path('ranking/', ranking_view, name='ranking'),
    path('ranked/', ranked_view, name='ranked'),
    path('tournament/', tournament_view, name='tournament'),
    path('profile/', profile_view, name='profile'),
	# Friend
	path('add_friend/<int:friend_id>/', views.add_friend, name='add_friend'),
    path('remove_friend/<int:friend_id>/', views.remove_friend, name='remove_friend'),
	path('accept_friend/<int:request_id>/', views.accept_friend_request, name='accept_friend'),
    path('reject_friend/<int:request_id>/', views.reject_friend_request, name='reject_friend'),
    path('api/get_friends/', views.get_friends, name='get_friends'),
	path('api/remove_friend/', views.remove_friend, name='remove_friend'),
	path('api/get_friend_requests/', views.get_friend_requests, name='get_friend_requests'),
	# API 42
	path('connexion_42/', views.connexion_42, name='connexion_42'),
	path('redirection_apres_authentification/', views.redirection_apres_authentification, name='redirection_apres_authentification'),
    path('exchange_code_for_access_token/<str:code>/', views.exchange_code_for_access_token, name='exchange_code_for_access_token'),
	# API
    path('api/users/', views.api_user_list.as_view(), name='user-list'),
	path('api/users/<int:id>/', views.api_user_details.as_view(), name='user-details'),
	path('api/match/', views.api_match_list.as_view(), name='match-list'),
	path('api/match/<int:id>/', views.api_match_details.as_view(), name='match-details'),
	path('api/tournaments/', views.api_tournois_list.as_view(), name='match-list'),
	path('api/tournaments/<int:id>/', views.api_tournois_details.as_view(), name='match-details'),
    # ADMIN
    path('adminer/', lambda request: redirect('http://localhost:8080/'), name='adminer_redirect'),
    # DEV
    path('users/', user_list_view, name='user_list'),
	path('exemple', views.exemple_view, name='exemple'),
	# path('connected-users/', views.get_connected_users, name='get_connected_users'),
]
