from django import forms

class CreateChatForm(forms.Form):
    users = forms.CharField(
    widget=forms.TextInput(attrs={'placeholder':'usernames','name':'users','id':'users', 'autocomplete':'off'}))
    
    message = forms.CharField(
    widget=forms.Textarea(attrs={'placeholder':'message','name':'message','id':'message', 'autocomplete':'off'}))
