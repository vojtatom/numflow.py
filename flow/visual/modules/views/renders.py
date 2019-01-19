import json

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django.utils.safestring import mark_safe

from visual.forms import RegistrationForm, UploadDatasetForm, NotebookForm
from visual.models import Dataset, Notebook
from visual.modules.processing import processing


def index(request, form):
    """
    Renders index component or page.
        :param request: request object
        :param form: upload dataset form object
    """
    datasets = Dataset.objects.filter(owners=request.user)
    notebooks = Notebook.objects.filter(authors=request.user)
    data = {'notebooks': notebooks, 'datasets': datasets, 'form': form}
    
    if request.is_ajax():
        return render(request, 'visual/components/index.html', data)
    return render(request, 'visual/pages/index.html', data)
    

def notebook(request, form, code, is_new_notebook = False):
    """
    Renders notebook component or page.
        :param request: request object
        :param form: notebook form object
        :param code: notebook code
        :param is_new_notebook=False: set True if notebook is new
    """
    data = {'form': form, 'code': code}

    if request.is_ajax():
        return render(request, 'visual/components/notebook.html', data)

    if is_new_notebook:
        return redirect('visual:notebook', code=code)
    return render(request, 'visual/pages/notebook.html', data)


def docs(request):
    """
    Renders docs component or page.
        :param request: request object
    """

    if request.is_ajax():
        return render(request, 'visual/components/docs.html')

    return render(request, 'visual/pages/docs.html')


def canvas(request, code):
     return render(request, 'visual/pages/canvas.html', code)