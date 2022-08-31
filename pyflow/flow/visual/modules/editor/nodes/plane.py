from .base import Node, check_abort
from ..exceptions import NodeError
import numpy as np
from visual.modules.numeric.kernels import points_kernel

class PlaneNode(Node):
    """Node representing the construction of 2D slice seeding points."""

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

    parsing = {
        'norm_value': lambda x: float(x),
        'a_start': lambda x: float(x),
        'b_start': lambda x: float(x),
        'a_end': lambda x: float(x),
        'b_end': lambda x: float(x),
        'a_sampling': lambda x: int(x),
        'b_sampling': lambda x: int(x),
    }

    title = 'plane'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of plane node.
            :param self: instance of PlaneNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """

        self.id = id

        fields = ['norm_axis', 'norm_value', 'a_start', 'b_start', 'a_end', 
                'b_end', 'a_sampling', 'b_sampling']
        self.check_dict(fields, data, self.id, self.title)

        index = {'x': 0, 'y': 1, 'z': 2} 
        ax = data['norm_axis'][0]

        self._start = [data['a_start'], data['b_start']]
        self._start.insert(index[ax], data['norm_value'])
        self._end = [data['a_end'], data['b_end']]
        self._end.insert(index[ax], data['norm_value'])
        self._sampling = [data['a_sampling'], data['b_sampling']]
        self._sampling.insert(index[ax], 1)
        self._index = index[ax]
        self._value = data['norm_value']


    def __call__(self, indata, message, abort):
        """
        Construct 2D slice seeding points.
            :param self: instance of PlaneNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """ 

        meta = {
            'normal': self._index,
            'normal_value': self._value,
            'sampling': self._sampling,
        }
        
        check_abort(abort)
        return {'plane': {'data': points_kernel(self._start, self._end, self._sampling), 'meta': meta}}