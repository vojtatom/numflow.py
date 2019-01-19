from .base import Node
from ..model import dataset
import numpy as np

from ..exceptions import NodeError
from visual.modules.numeric.kernels import stream_kernel


class StreamlinesNode(Node):
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
        'out': ['streamlines'],
    }
    
    title = 'streamlines'
    
    def __init__(self, id, data, message):
        """
        Inicialize new instance of streamlines node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   

        self.id = id
        fields = ['mode', 't_0', 't_bound']
        self.check_dict(fields, data, self.id, self.title)
        
        self._t0 = data['t_0']
        self._tbound = data['t_bound']
        self._mode = data['mode']

    def __call__(self, indata, message):    
        """
        Call stream kernel and perform integrations.
            :param indata: data coming from connected nodes, can be None here.
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

        #integrate per points group
        for points_group in indata['points']:
            p, v, l = stream_kernel(indata['dataset'], self._t0, self._tbound, points_group, self._mode)
            
            if p is None:
                raise NodeError('Integration failed.')

            if points is None:
                points = p
                values = v
                lengths = l
            else:
                points = np.append(points, p, axis=0)
                values = np.append(values, v, axis=0)
                lengths = np.append(lengths, l, axis=0)

        #return all flatenned
        return {'streamlines' : {'values': values, 'points': points, 'lengths': lengths}}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'mode' : data['data']['structure']['mode']['value'],
            't_0' : float(data['data']['structure']['t_0']['value']),
            't_bound' : float(data['data']['structure']['t_bound']['value']),
        }
        return parsed


