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
from .views import user_list_view, index, solo_view, login_view, register_view, local_view, ranking_view, ranked_view, tournament_view, profile_view

urlpatterns = [
    path('', index, name='index'),
    path('solo', solo_view, name='solo'),
    path('login', login_view, name='login'),
    path('register', register_view, name='register'),
    path('local/', local_view, name='local'),
    path('ranking', ranking_view, name='ranking'),
    path('ranked', ranked_view, name='ranked'),
    path('tournament', tournament_view, name='tournament'),
    path('profile', profile_view, name='profile'),
    # admin
    path('admin/', admin.site.urls),
    path('django/', lambda request: redirect('http://localhost:8000/admin'), name='django_redirect'),
    path('adminer/', lambda request: redirect('http://localhost:8080/'), name='adminer_redirect'),
    # dev
    path('users/', user_list_view, name='user_list'),
]
