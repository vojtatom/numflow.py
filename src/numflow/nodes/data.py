from .base import Node, check_abort
from ..model import dataset
from ..exceptions import NodeError
from visual.modules.numeric.kernels import dataset_kernel


class DataNode(Node):
    """Node representing loading a dataset."""

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
        Inicialize new instance of DataNode.
            :param self: instance of DataNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """ 

        self.id = id
        fields = ['code', 'mode']
        self.check_dict(fields, data, self.id, self.title)

        ## get path to dataset
        self._path = dataset(data['code'])
        self._mode = data['mode']


    def __call__(self, indata, message, abort):
        """
        Load the specified dataset.
            :param self: instance of DataNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """ 
        return {'dataset' : dataset_kernel(self._path, self._mode)}
