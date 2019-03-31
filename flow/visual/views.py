from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import redirect, render

from .modules.views import api, forms, models, renders


# PAGES
def register(request):
    """
    Register view, creates new user or returns
    view with register form.
        :param request: request object
    """
    if request.method == 'POST':
        form, user = forms.save_user(request)
        if user is None:
            return render(request, 'registration/register.html', {'form': form})
        login(request, user)
        return redirect('/')
    form = forms.new_user()
    return render(request, 'registration/register.html', {'form': form})


@login_required
def index(request):
    """
    Index view, returns page or component if is ajax.
        :param request: request object
    """
    return renders.index(request, forms.new_dataset(), forms.new_notebook())


@login_required
def docs(request):
    """
    Docs view, returns page or component if is ajax.
        :param request: request object
    """
    return renders.docs(request)


@login_required
def notebook(request, code=None):
    """
    Notebook view, creates new notebook or opens
    existing notebook according to code parameter
    returns page or a component.
        :param request: request object
        :param code=None: notebook code, new notebook created on None
    """

    if code is None:
        form, instance = forms.create_new_notebook(request)
    else:
        instance = models.notebook(code)
        form, instance = forms.get_notebook(instance)

    return renders.notebook(request, form, str(instance.code), code is None)


def canvas(request, code=None):
    return renders.canvas(request, code)


# API CALLS
@login_required
def upload_dataset(request):
    """
    Accepts only AJAX POST, deletes dataset
    according to posted dict in format 
    { 'code' : <code> }.
        :param request: request object 
    """
    #_ = api.api_call(request)
    form = forms.save_dataset(request)
    return renders.index(request, form, forms.new_notebook())


@login_required
def delete_dataset(request):
    """
    Accepts only AJAX POST, deletes dataset
    according to posted dict in format 
    { 'code' : <code> }.
        :param request: request object 
    """
    data = api.api_call(request)
    dataset = models.dataset(data['code'])
    dataset.delete()
    return HttpResponse('All okay')


@login_required
def rename_dataset(request):
    """
    Accepts only AJAX POST, renames dataset
    according to posted dict in format 
    { 'code' : <code>, 'title': <title> }.
        :param request: request object 
    """
    data = api.api_call(request)
    dataset = models.dataset(data['code'])
    dataset.title = data['title']
    dataset.save()
    return HttpResponse('All okay')


@login_required
def upload_notebook(request, code=None):
    """
    Accepts only AJAX POST, uploads new notebook.
        :param request: request object 
    """
    #_ = api.api_call(request)
    if code is None:
        _, instance = forms.create_new_notebook(request)
        form = forms.save_notebook(request, instance)
        return renders.index(request, forms.new_dataset(), form)
    else:
        instance = models.notebook(code)
        form = forms.save_notebook(request, instance)
        return HttpResponse('All okay')



@login_required
def get_notebook(request):
    """
    Accepts only AJAX POST, returns notebook
    according to posted dict in format 
    { 'code' : <code> }.
        :param request: request object 
    """
    data = api.api_call(request)
    notebook = models.notebook(data['code'])
    return api.notebook_data(notebook)


@login_required
def delete_notebook(request):
    """
    Accepts only AJAX POST, deletes notebook
    according to posted dict in format 
    { 'code' : <code> }.
        :param request: request object 
    """
    data = api.api_call(request)
    notebook = models.notebook(data['code'])
    notebook.delete()
    return HttpResponse('All okay')


@login_required
def rename_notebook(request):
    """
    Accepts only AJAX POST, renames notebook
    according to posted dict in format 
    { 'code' : <code>, 'title': <title> }.
        :param request: request object 
    """
    data = api.api_call(request)
    notebook = models.notebook(data['code'])
    notebook.title = data['title']
    notebook.save()
    return HttpResponse('All okay')


@login_required
def editor_nodes(request):
    """
    Accepts only AJAX POST, returns dict of nodes.
        :param request: request object 
    """
    data = api.api_call(request)
    return api.editor_nodes()


#NODES
@login_required
def node_dataset(request):
    """
    Accepts only AJAX POST, returns dict of nodes.
        :param request: request object 
    """

    data = api.api_call(request)
    try:
        dataset = models.dataset(data['code'])
    except:
        return api.dataset_description(None)
    return api.dataset_description(dataset)

