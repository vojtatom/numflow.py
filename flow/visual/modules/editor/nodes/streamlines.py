from .base import Node
import numpy as np

from .color import ColorNode
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

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
            },

            'thickness' : {
                'type': 'input',
                'value' : '0',
            },

            'scale' : {
                'type': 'select',
                'choices': ['normal', 'log'],
                'value' : 'normal',
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
    
    title = 'streamlines'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of streamlines node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   

        self.id = id
        fields = ['mode', 't_0', 't_bound', 'appearance', 'thickness', 'scale']
        self.check_dict(fields, data, self.id, self.title)
        
        self._t0 = data['t_0']
        self._tbound = data['t_bound']
        self._mode = data['mode']
        self._appearance = data['appearance']
        self._thickness = data['thickness']
        self._sampling = data['thickness']
        self._scale = data['scale']


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
        times = None

        #integrate per points group
        for points_group in indata['points']:
            p, v, l, t = stream_kernel(indata['dataset'], self._t0, self._tbound, points_group, self._mode)
            
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

        meta = {
            'colormap': ColorNode.get_default_cm(),
            'appearance': self._appearance,
            'thickness': self._thickness,
            'scale': self._scale,
            't0': self._t0,
            'tbound': self._tbound,
            'sampling': 6,
        }

        #return all flatenned
        return {'streamlines' : {'values': values, 'points': points, 'lengths': lengths, 'times': times, 'meta': meta}}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'mode' : data['data']['structure']['mode']['value'],
            't_0' : float(data['data']['structure']['t_0']['value']),
            't_bound' : float(data['data']['structure']['t_bound']['value']),
            'appearance' : data['data']['structure']['appearance']['value'],
            'thickness' : float(data['data']['structure']['thickness']['value']),
            'scale' : data['data']['structure']['scale']['value'],
        }
        return parsed


