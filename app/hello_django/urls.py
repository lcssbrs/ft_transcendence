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
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from .views import user_list_view, login_view
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='index'),
	# api
    path('home', views.home, name='home'),
	path('connexion_42/', views.connexion_42, name='connexion_42'),
	path('redirection_apres_authentification/', views.redirection_apres_authentification, name='redirection_apres_authentification'),
    path('exchange_code_for_access_token/<str:code>/', views.exchange_code_for_access_token, name='exchange_code_for_access_token'),
    # admin
    path('admin/', admin.site.urls),
    path('django/', lambda request: redirect('http://localhost:8000/admin'), name='django_redirect'),
    path('adminer/', lambda request: redirect('http://localhost:8080/'), name='adminer_redirect'),
    # dev
    path('login/', login_view, name='login'),
    path('users/', user_list_view, name='user_list'),
]
