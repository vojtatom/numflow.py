from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Dataset

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(max_length=200, help_text='Required')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

class UploadDatasetForm(forms.ModelForm):
    class Meta:
        model = Dataset
        fields = ['title', 'data']
        widgets = {
            'title': forms.TextInput({'placeholder': 'Dataset name'}),
            'data': forms.FileInput({'id': 'upload_form_file'})
        }

        labels = {
            'data' : 'Select file'
        }
