from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Dataset, Notebook

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
            'data': forms.FileInput({'id': 'dataset_upload_form_file'})
        }

        labels = {
            'data' : 'Select file'
        }


class NotebookForm(forms.ModelForm):
    class Meta:
        model = Notebook
        fields = ['title', 'data']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Title', 'id': 'notebook_form_title', 'autocomplete': 'off'}),
        }