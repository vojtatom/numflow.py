import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django.utils.safestring import mark_safe

from .forms import RegistrationForm, UploadDatasetForm, NotebookForm
from .models import Dataset, Notebook
from .processing import processing


def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            email = form.cleaned_data.get('email')
            user = authenticate(username=username,
                                password=raw_password, email=email)
            login(request, user)
            return redirect('/')
    else:
        form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


# PAGES

@login_required
def page_index(request):
    datasets = Dataset.objects.filter(owners=request.user)
    notebooks = Notebook.objects.filter(authors=request.user)

    data = {'notebooks': notebooks, 'datasets': datasets,
            'form': UploadDatasetForm(label_suffix='')}
    return render(request, 'visual/pages/index.html', data)


@login_required
def page_notebook(request, code):
    notebook = Notebook.objects.filter(code=code)
    if notebook.count() == 1:
        data = {'form': NotebookForm(
            instance=notebook[0]), 'code': code}
        return render(request, 'visual/pages/notebook.html', data)
    raise Http404('Notebook not found')


# MAIN COMPONENTS


@login_required
def menu(request):
    datasets = Dataset.objects.filter(owners=request.user)
    notebooks = Notebook.objects.filter(authors=request.user)
    data = {'notebooks': notebooks, 'datasets': datasets,
            'form': UploadDatasetForm(label_suffix='')}
    return render(request, 'visual/components/menu.html', data)


@login_required
def notebook(request, code):
    if request.method == 'POST':
        notebook = Notebook.objects.filter(code=code)
        if notebook.count() == 1:
            data = {'form': NotebookForm(
                instance=notebook[0]), 'code': code}
            return render(request, 'visual/components/notebook.html', data)
        raise Http404('Notebook not found')
    return redirect('page_notebook', code=code)


# API for REST


@login_required
def create_notebook(request):
    new_notebook = Notebook()
    new_notebook.save()
    new_notebook.authors.add(request.user)

    if request.method == 'POST':
        return notebook(request, new_notebook.code)
    return redirect('visual:notebook', code=str(new_notebook.code))


@login_required
def upload_dataset(request):
    if request.method == 'POST':
        form = UploadDatasetForm(request.POST, request.FILES)
        print(form.is_valid())
        if form.is_valid():
            dataset = form.save()
            dataset.owners.add(request.user)
            processing.process(dataset)
            return menu(request)
    raise Http404('Data corrupted')


@login_required
def delete_dataset(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        dataset = Dataset.objects.filter(code=data['code'])
        if dataset.count() == 1:
            dataset.delete()
            return HttpResponse('All okay')
    raise Http404('Dataset does not exist')


@login_required
def rename_dataset(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        dataset = Dataset.objects.filter(code=data['code'])
        if dataset.count() == 1:
            dataset = dataset[0]
            dataset.title = data['title']
            dataset.save()
            return HttpResponse('All okay')
        raise Http404('Dataset does not exist')
    raise Http404('Nothing to do')


@login_required
def delete_notebook(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        notebook = Notebook.objects.filter(code=data['code'])
        if notebook.count() == 1:
            notebook.delete()
            return HttpResponse('All okay')
    raise Http404('Dataset does not exist')


@login_required
def rename_notebook(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        notebook = Notebook.objects.filter(code=data['code'])
        if notebook.count() == 1:
            notebook = notebook[0]
            notebook.title = data['title']
            notebook.save()
            return HttpResponse('All okea')
        raise Http404('Dataset does not exist')
    raise Http404('Nothing to do')


# DATA FETCH
