from django import forms
from .models import user_list
from django.core.exceptions import ValidationError

class add_user_form(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    email = forms.EmailField(error_messages={'invalid': "Entrez une adresse e-mail valide."})
    username = forms.CharField(error_messages={'invalid': "Entrez un nom d'utilisateur valide."})

    class Meta:
        model = user_list
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'profile_picture']

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        email = cleaned_data.get("email")

        if user_list.objects.filter(username=username).exists():
            raise ValidationError("Ce nom d'utilisateur existe déjà.")

        if user_list.objects.filter(email=email).exists():
            raise ValidationError("Cet e-mail existe déjà.")

        return cleaned_data

class loginForm(forms.Form):
    username = forms.CharField(label='Nom d\'utilisateur', widget=forms.TextInput(attrs={'placeholder': 'Pseudonyme'}))
    password = forms.CharField(label='Mot de passe', widget=forms.PasswordInput(attrs={'placeholder': 'Mot de passe'}))
    token = forms.CharField(label='Clé d\'authentification', widget=forms.TextInput(attrs={'placeholder': 'Clé d\'authentification'}))
