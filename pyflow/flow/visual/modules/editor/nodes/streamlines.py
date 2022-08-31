from .base import Node, check_abort
import numpy as np

from .color import ColorNode
from ..exceptions import NodeError
from visual.modules.numeric.kernels import stream_kernel


class StreamlinesNode(Node):
    """Node represents the streamline integration operation."""

    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'streamlines',
            },

            'mode' : {
                'type': 'select',
                'choices': ['scipy', 'c'],
                'value' : 'scipy',
            },

            't_0' : {
                'type': 'input',
                'value' : '0',
            },

            't_bound' : {
                'type': 'input',
                'value' : '1',
            },

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
            },

            'size' : {
                'type': 'input',
                'value' : '0',
            },
        },

        'in': {
            'points': {
                'required': True,
                'multipart': True
            },
            'dataset': {
                'required': True,
                'multipart': False
            }
        },
        'out': {
            'streamlines': {
                'required': True,
                'multipart': False
            },
        },
    }

    parsing = {
        't_0' : lambda x: float(x),
        't_bound' : lambda x: float(x),
        'size' : lambda x: float(x),
    }
    
    title = 'streamlines'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of streamline node.
            :param self: instance of StreamlinesNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """ 

        self.id = id
        fields = ['mode', 't_0', 't_bound', 'appearance', 'size']
        self.check_dict(fields, data, self.id, self.title)
        
        self._t0 = data['t_0']
        self._tbound = data['t_bound']
        self._mode = data['mode']
        self._appearance = data['appearance']
        self._size = data['size']


    def __call__(self, indata, message, abort):    
        """
        Perform streamline integration.
            :param self: instance of StreamlinesNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """ 

        fields = ['dataset', 'points']
        self.check_dict(fields, indata, self.id, self.title)

        # check for unsupported combinations
        if self._mode == 'c' and indata['dataset'].mode == 'scipy':
            self._mode = 'scipy'
            message('Unsupported combination of scipy dataset and c kernel, falling on scipy kernel.')


        points = None
        values = None
        lengths = None
        times = None

        #integrate per points group
        for points_group in indata['points']:
            p, v, l, t = stream_kernel(indata['dataset'], self._t0, self._tbound, points_group, self._mode, abort)
            
            if p is None:
                raise NodeError('Integration failed.')

            if points is None:
                points = p
                values = v
                lengths = l
                times = t
            else:
                points = np.append(points, p, axis=0)
                values = np.append(values, v, axis=0)
                lengths = np.append(lengths, l, axis=0)
                times = np.append(times, t, axis=0)
            
            check_abort(abort)

        meta = {
            'colormap': ColorNode.get_default_cm(),
            'appearance': self._appearance,
            'size': self._size,
            't0': self._t0,
            'tbound': self._tbound,
            'sampling': 6,
            'divisions': 10,
        }

        #return all flatenned
        return {'streamlines' : {'values': values, 'points': points, 'lengths': lengths, 'times': times, 'meta': meta}}



