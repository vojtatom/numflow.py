from .base import Node
from ..exceptions import NodeError

from visual.modules.numeric.kernels import points_kernel

class PlaneNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'plane',
            },
            'norm_axis' : {
                'type': 'select',
                'choices': ['x (a = y, b = z)', 'y (a = x, b = z)', 'z (a = x, b = y)'],
                'value': 'x (a = y, b = z)',
            },
            'norm_value': {
                'type': 'input',
                'value' : '',
            },
            'a_start' : {
                'type': 'input',
                'value' : '',
            },
            'b_start' : {
                'type': 'input',
                'value' : '',
            },
            'a_end' : {
                'type': 'input',
                'value' : '',
            },
            'b_end' : {
                'type': 'input',
                'value' : '',
            },
            'a_sampling' : {
                'type': 'input',
                'value' : '2',
            },
            'b_sampling' : {
                'type': 'input',
                'value' : '2',
            },
        },

        'in': {},        
        'out': {
            'plane': {
                'required': True,
                'multipart': False
            },
        },
    }

    title = 'plane'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of points node.
            :param id: id of node
            :param data: dictionary of values from node
        """  
        self.id = id

        fields = ['normal', 'normal_value', 'start_a', 'start_b', 'end_a', 
                'end_b', 'sampling_a', 'sampling_b']
        self.check_dict(fields, data, self.id, self.title)

        index = {'x': 0, 'y': 1, 'z': 2} 
        ax = data['normal'][0]

        self._start = [data['start_a'], data['start_b']]
        self._start.insert(index[ax], data['normal_value'])
        self._end = [data['end_a'], data['end_b']]
        self._end.insert(index[ax], data['normal_value'])
        self._sampling = [data['sampling_a'], data['sampling_b']]
        self._sampling.insert(index[ax], 1)
        self._index = index[ax]
        self._value = data['normal_value']


    def __call__(self, indata, message):
        """
        Create np.ndarray of points
            :param indata: data coming from connected nodes, can be None here.
        """   
        meta = {
            'normal': self._index,
            'normal_value': self._value,
            'sampling': self._sampling,
        }

        return {'plane': {'data': points_kernel(self._start, self._end, self._sampling), 'meta': meta}}


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'normal': data['data']['structure']['norm_axis']['value'],
            'normal_value': float(data['data']['structure']['norm_value']['value']),
            'start_a': float(data['data']['structure']['a_start']['value']),
            'start_b': float(data['data']['structure']['b_start']['value']),
            'end_a': float(data['data']['structure']['a_end']['value']),
            'end_b': float(data['data']['structure']['b_end']['value']),
            'sampling_a': int(data['data']['structure']['a_sampling']['value']),
            'sampling_b': int(data['data']['structure']['b_sampling']['value']),
        }
        return parsed