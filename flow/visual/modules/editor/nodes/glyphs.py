from .base import Node
from ..model import dataset
import numpy as np

from ..exceptions import NodeError
from visual.modules.numeric.kernels import glyph_kernel


class GlyphsNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'glyphs',
            }
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
        'out': ['glyphs'],
    }
    
    title = 'glyphs'
    
    def __init__(self, id, data, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

    def __call__(self, indata, message):    
        """
        Call glyph kernel and perform interpolation.
            :param indata: data coming from connected nodes, can be None here.
        """   

        fields = ['dataset', 'points']
        self.check_dict(fields, indata, self.id, self.title)

        values = None
        points = None

        #interpolate per points group
        for points_group in indata['points']:
            out_values = glyph_kernel(indata['dataset'], points_group)
            
            if values is None:
                values = out_values
                points = points_group
            else:
                values = np.append(values, out_values, axis=0)
                points = np.append(points, points_group, axis=0)

        #return all flatenned
        return {'glyphs' : {'values': values, 'points': points}}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {}
        return parsed


