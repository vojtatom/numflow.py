from visual.models import Notebook, Dataset
from .exceptions import EditorError

def dataset(code):
    """
    Gets datset or raises 404.
        :param code: code of desired dataset 
    """
    datasets = Dataset.objects.filter(code=code)
    if datasets.count() == 1:
        return datasets[0].data.path
    raise EditorError('Dataset {} not found'.format(code))