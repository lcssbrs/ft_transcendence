from django.shortcuts import render, redirect
from .forms import add_user_form
from .models import user_list
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.http import HttpResponse

def profile_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/profile.html')

    return render(request, 'profile.html')

def ranked_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/ranked.html')

    return render(request, 'ranked.html')

def tournament_view (request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/tournament.html')

    return render(request, 'tournament.html')

def ranking_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/ranking.html')

    return render(request, 'ranking.html')

def register_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/register.html')

    return render(request, 'register.html')

def login_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/login.html')

    return render(request, 'login.html')

def solo_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/solo.html')

    return render(request, 'solo.html')

def local_view(request):
    if request.META.get("HTTP_HX_REQUEST") != 'true':
        return render(request, 'full/local.html')

    return render(request, 'local.html')

def index(request):
    error_message = None
    form = None

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
                error_message = "Échec de l'authentification: Nom d'utilisateur ou mot de passe incorrect."
    else:
        form = AuthenticationForm()

    add_user_form_instance = add_user_form()
    if request.method == 'POST':
        add_user_form_instance = add_user_form(request.POST, request.FILES)
        if add_user_form_instance.is_valid():
            email = add_user_form_instance.cleaned_data['email']
            if user_list.objects.filter(email=email).exists():
                error_message = "Cet email est déjà utilisé. Veuillez en choisir un autre."
            else:
                username = add_user_form_instance.cleaned_data['username']
                if user_list.objects.filter(username=username).exists():
                    error_message = "Ce pseudo est déjà utilisé. Veuillez en choisir un autre."
                else:
                    add_user_form_instance.save()
                    return redirect('index')

    return render(request, 'index.html', {'form': form, 'add_user_form': add_user_form_instance, 'error_message': error_message})


def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})
