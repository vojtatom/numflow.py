from .base import Node, check_abort
from ..exceptions import NodeError

from visual.modules.numeric.kernels import points_kernel

class PointsNode(Node):
    """Node represents a 3D slice seeding points."""
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'points',
            },
            'x_min' : {
                'type': 'input',
                'value' : '',
            },
            'y_min' : {
                'type': 'input',
                'value' : '',
            },
            'z_min' : {
                'type': 'input',
                'value' : '',
            },
            'x_max' : {
                'type': 'input',
                'value' : '',
            },
            'y_max' : {
                'type': 'input',
                'value' : '',
            },
            'z_max' : {
                'type': 'input',
                'value' : '',
            },
            'x_sampling' : {
                'type': 'input',
                'value' : '',
            },
            'y_sampling' : {
                'type': 'input',
                'value' : '',
            },
            'z_sampling' : {
                'type': 'input',
                'value' : '',
            },
        },

        'in': {},        
        'out': {
            'points': {
                'required': True,
                'multipart': False
            },
        },
    }

    parsing = {
        'x_min': lambda x: float(x),
        'y_min': lambda x: float(x),
        'z_min': lambda x: float(x),
        'x_max': lambda x: float(x),
        'y_max': lambda x: float(x),
        'z_max': lambda x: float(x),
        'x_sampling': lambda x: float(x),
        'y_sampling': lambda x: float(x),
        'z_sampling': lambda x: float(x),
    }

    title = 'points'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of points node.
            :param self: instance of PointsNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """
        self.id = id

        fields = ['x_min', 'y_min', 'z_min', 'x_max', 'y_max', 
                  'z_max', 'x_sampling', 'y_sampling', 'z_sampling']
        self.check_dict(fields, data, self.id, self.title)

        self._start = [data['x_min'], data['y_min'], data['z_min']]
        self._end = [data['x_max'], data['y_max'], data['z_max']]
        self._sampling = [int(data['x_sampling']), int(data['y_sampling']), int(data['z_sampling'])]


    def __call__(self, indata, message, abort):
        """
        Construct 3D slice seeding points.
            :param self: instance of PointsNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """   
        check_abort(abort)
        return {'points': points_kernel(self._start, self._end, self._sampling)}