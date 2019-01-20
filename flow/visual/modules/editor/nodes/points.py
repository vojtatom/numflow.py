from .base import Node
from ..exceptions import NodeError

from visual.modules.numeric.kernels import points_kernel

class PointsNode(Node):
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
        'out': ['points'],
    }

    title = 'points'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of points node.
            :param id: id of node
            :param data: dictionary, must contain keys 'x_min', 'y_min', 'z_min', 'x_max', 'y_max', 
                        'z_max', 'x_sampling', 'y_sampling' and 'z_sampling'
        """  
        self.id = id

        fields = ['x_min', 'y_min', 'z_min', 'x_max', 'y_max', 
                  'z_max', 'x_sampling', 'y_sampling', 'z_sampling']
        self.check_dict(fields, data, self.id, self.title)

        self._start = [data['x_min'], data['y_min'], data['z_min']]
        self._end = [data['x_max'], data['y_max'], data['z_max']]
        self._sampling = [int(data['x_sampling']), int(data['y_sampling']), int(data['z_sampling'])]


    def __call__(self, indata, message):
        """
        Create np.ndarray of points
            :param indata: data coming from connected nodes, can be None here.
        """   
        return {'points': points_kernel(self._start, self._end, self._sampling)}


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {}
        for field in ['x_min', 'y_min', 'z_min', 'x_max', 'y_max', 'z_max', 'x_sampling', 'y_sampling', 'z_sampling']:
            try:
                parsed['data'][field] = float(data['data']['structure'][field]['value'])
            except:
                pass
        return parsed