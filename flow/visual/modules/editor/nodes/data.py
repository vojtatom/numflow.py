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
            'type' : {
                'type': 'select',
                'choices': ['scipy', 'c'],
                'value' : 'scipy',
            },
        },

        'in': {},
        'out': ['dataset'],
    }
    
    title = 'dataset'
    multiinput = False
    
    def __init__(self, id, data):
        """
        Inicialize new instance of dataset node.
            :param id: id of node
            :param data: dictionary, must contain keys 'code' and 'type'.
        """   

        self.id = id
        if 'code' not in data or 'type' not in data:
            raise NodeError('Dataset node missing value.')

        ## get path to dataset
        self._path = dataset(data['code'])
        self._mode = data['type']


    def __call__(self, indata):
        """
        Create dataset.
            :param indata: data coming from connected nodes, can be None here.
        """   
        return {'dataset' : dataset_kernel(self._path, self._mode)}


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'code' : data['data']['structure']['code']['value'],
            'type' : data['data']['structure']['type']['value']
        }
        return parsed

