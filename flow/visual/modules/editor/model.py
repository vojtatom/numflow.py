from visual.models import Notebook, Dataset
from .exceptions import EditorError

def dataset(code):
    """
    Gets datset or raises 404.
        :param code: code of desired dataset 
    """

    try:
        datasets = Dataset.objects.filter(code=code)
        count = datasets.count()
    except:
        raise EditorError('Dataset code "{}" not valid'.format(code))
    
    if count != 1:
        raise EditorError('Dataset "{}" not found'.format(code))
    return datasets[0].data.path