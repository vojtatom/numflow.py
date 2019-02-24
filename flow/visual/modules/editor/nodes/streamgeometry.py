from .base import Node
import numpy as np
import copy

from ..exceptions import NodeError


class StreamGeometryNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'streamline geometry',
            },

            'size' : {
                'type': 'input',
                'value' : '1',
            },

            'sampling' : {
                'type': 'input',
                'value' : '4',
            },

            'divisions' : {
                'type': 'input',
                'value' : '10',
            },

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
            },
        },

        'in': {
            'streamlines': {
                'required': True,
                'multipart': True
            },
        },
        'out': {
            'streamlines': {
                'required': True,
                'multipart': True
            },
        },
    }
    
    parsing = {
       'size' :  lambda x: float(x),
       'sampling' : lambda x: int(x),
       'divisions' : lambda x: int(x),
    }

    title = 'stream geometry'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary with input values
        """   
        self.id = id

        fields = ['size', 'sampling',  'divisions', 'appearance']
        self.check_dict(fields, data, self.id, self.title)
        self._sampling = data['sampling']
        self._size = data['size']
        self._divisions = data['divisions']
        self._appearance = data['appearance']


    def __call__(self, indata, message):    
        """
        Call glyph kernel and perform interpolation.
            :param indata: data coming from connected nodes
        """   

        fields = ['streamlines']
        self.check_dict(fields, indata, self.id, self.title)

        transformed_streams = []

        #modify per group
        for stream_group in indata['streamlines']:
                new = {
                    'values': stream_group['values'],
                    'points': stream_group['points'],
                    'times': stream_group['times'],
                    'lengths': stream_group['lengths'],
                    }

                meta = copy.deepcopy(stream_group['meta'])
                meta['sampling'] = self._sampling
                meta['size'] = self._size
                meta['divisions'] = self._divisions
                meta['appearance'] = self._appearance
                new['meta'] = meta

                transformed_streams.append(new)

        #return all flatenned
        return {'streamlines' : transformed_streams}

