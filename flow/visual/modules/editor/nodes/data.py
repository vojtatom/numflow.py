from .base import Node
from ..model import dataset
from ..exceptions import NodeError
from visual.modules.numeric.kernels import dataset_kernel


class DataNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'dataset',
            },
            'code' : {
                'type': 'input',
                'value' : '',
                'dynamic' : '/node/dataset',
            },
            'mode' : {
                'type': 'select',
                'choices': ['scipy', 'c'],
                'value' : 'scipy',
            },
        },

        'in': {},
        'out': {
            'dataset': {
                'required': True,
                'multipart': False
            },
        },
    }
    
    title = 'dataset'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of dataset node.
            :param id: id of node
            :param data: dictionary, must contain keys 'code' and 'mode'.
        """   

        self.id = id
        fields = ['code', 'mode']
        self.check_dict(fields, data, self.id, self.title)

        ## get path to dataset
        self._path = dataset(data['code'])
        self._mode = data['mode']


    def __call__(self, indata, message):
        """
        Create dataset.
            :param indata: data coming from connected nodes, can be None here.
        """   
        return {'dataset' : dataset_kernel(self._path, self._mode)}
