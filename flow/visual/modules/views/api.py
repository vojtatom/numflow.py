import json
from django.http import JsonResponse
from django.core.exceptions import SuspiciousOperation 


def api_call(request):
    """
    Check request if is api call (with json data posted),
    returns dict with request.body data. 
    Raises SuspiciousOperation if is not ajax and POST.
        :param request: request object
    """
    if request.method == 'POST' and request.is_ajax():
        data = json.loads(request.body)
        return data
    raise SuspiciousOperation('Trying to get synchronously REST API address!')


def notebook_data(notebook):
    """
    Returns json serialized notebook data.
    """
    return JsonResponse({ 'data' : notebook.data })