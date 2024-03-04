from django.shortcuts import render
from .models import user_list

def index(request):
    return render(request, 'index.html')


def user_list_view(request):
    users = user_list.objects.all()
    return render(request, 'user_list.html', {'users': users})
