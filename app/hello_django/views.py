from django.shortcuts import render, redirect
from .forms import add_user_form
from .models import user_list

def index(request):
    return render(request, 'index.html')

def add_user_view(request):
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
                return render(request, 'index.html')
    else:
        form = add_user_form()

    return render(request, 'add_user.html', {'form': form, 'error_message': error_message})

def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})
