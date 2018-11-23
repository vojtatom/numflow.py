from visual.models import Notebook, Dataset
from django.http import Http404, HttpResponse

def notebook(code):
    """
    Gets notebook or raises 404.
        :param code: code of desired notebook
    """
    notebooks = Notebook.objects.filter(code=code)
    if notebooks.count() == 1:
        return notebooks[0]
    raise Http404('Notebook does not exist!')

def dataset(code):
    """
    Gets datset or raises 404.
        :param code: code of desired dataset 
    """
    datasets = Dataset.objects.filter(code=code)
    if datasets.count() == 1:
        return datasets[0]
    raise Http404('Dataset does not exist!')