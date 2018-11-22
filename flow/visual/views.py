from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from .forms import RegistrationForm, UploadDatasetForm
from django.http import HttpResponse, Http404

from .models import Dataset
from django.utils.safestring import mark_safe
import json

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            email = form.cleaned_data.get('email')
            user = authenticate(username=username, password=raw_password, email=email)
            login(request, user)
            return redirect('/')
    else:
        form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def index(request):
    return render(request, 'visual/index.html')

@login_required
def menu(request):
    datasets = Dataset.objects.filter(owners=request.user)

    data = {'notebooks' : [], 'datasets' : datasets, 'form': UploadDatasetForm(label_suffix='')}
    return render(request, 'visual/component/menu.html', data)

@login_required
def upload(request):
    if request.method == 'POST':
        form = UploadDatasetForm(request.POST, request.FILES)
        print(form.is_valid())
        if form.is_valid():
            dataset = form.save()
            dataset.owners.add(request.user)
            return menu(request)
    return render(request, 'visual/component/upload.html', {'form': UploadDatasetForm()})

@login_required
def deleteDataset(request, id):
    dataset = Dataset.objects.filter(code=id)
    if dataset.count() == 1:
        dataset.delete()
        return HttpResponse('')
    raise Http404('Dataset does not exist')

@login_required
def renameDataset(request): 
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        dataset = Dataset.objects.filter(code=data['code'])
        if dataset.count() == 1:
            dataset = dataset[0]
            dataset.title = data['title']
            dataset.save()
            return HttpResponse('')
        raise Http404('Dataset does not exist')
    raise Http404('Nothing to do')