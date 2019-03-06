from visual.models import Dataset, Notebook
from visual.forms import UploadDatasetForm, NotebookForm, RegistrationForm
from django.contrib.auth import authenticate, login

from visual.modules.processing import processing


def new_user():
    """
    Creates new registration form.
    """
    form = RegistrationForm()
    return form


def save_user(request):
    """
    Creates user if form from request is valid,
    oteherwise the same form is returned. 
        :param request: request object
    """
    form = RegistrationForm(request.POST)
    if form.is_valid():
        form.save()
        username = form.cleaned_data.get('username')
        raw_password = form.cleaned_data.get('password1')
        email = form.cleaned_data.get('email')
        user = authenticate(username=username,
                            password=raw_password, email=email)
        return form, user
    return form, None


def new_dataset():
    """
    Creates new dataset form.
    """
    form = UploadDatasetForm(label_suffix='')
    return form


def save_dataset(request):
    """
    Gets data from requests, checks validity and saves.
        :param request: request object
    """
    form = UploadDatasetForm(request.POST, request.FILES)
    if form.is_valid():
        dataset = form.save()
        dataset.owners.add(request.user)
        processing.process(dataset)
        return UploadDatasetForm(label_suffix='')
    return form


def create_new_notebook(request):
    """
    Create new notebook and returns a form for this notebook.
    Retruns form and notebook isntance.
        :param request: request object
    """
    notebook = Notebook()
    notebook.save()
    notebook.authors.add(request.user)
    form = NotebookForm(instance=notebook)
    return form, notebook


def new_notebook():
    """
    Create new notebook and returns a form for this notebook.
    Retruns form and notebook isntance.
        :param request: request object
    """
    form = NotebookForm(label_suffix='')
    return form


def get_notebook(notebook):
    """
    Create new notebook form notebook object.
    Retruns form and notebook isntance.
        :param notebook: notebook model
    """
    form = NotebookForm(instance=notebook)
    return form, notebook


def save_notebook(request, notebook):
    """
    Gets data from request, checks validity and saves.
    Returns form.
        :param request: request object
        :param notebook: notebook model
    """
    form = NotebookForm(request.POST, instance=notebook)
    if form.is_valid():
        notebook = form.save()
        notebook.save_nodefile()
        return form
    return form
