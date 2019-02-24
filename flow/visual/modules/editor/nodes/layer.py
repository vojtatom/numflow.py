from .base import Node
import numpy as np

from .color import ColorNode
from ..exceptions import NodeError
from visual.modules.numeric.kernels import glyph_kernel


class LayerNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'layer',
            },

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
            },
        },

        'in': {
            'plane': {
                'required': True,
                'multipart': False
            },
            'dataset': {
                'required': True,
                'multipart': False
            }
        },
        'out': {
            'layer': {
                'required': True,
                'multipart': False
            },
        },
    }

    parsing = {}
    
    title = 'layer'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

        fields = ['appearance']
        self.check_dict(fields, data, self.id, self.title)
        self._appearance = data['appearance']


    def __call__(self, indata, message):    
        """
        Call glyph kernel and perform interpolation.
            :param indata: data coming from connected nodes, can be None here.
        """   

        fields = ['dataset', 'plane']
        self.check_dict(fields, indata, self.id, self.title)

        values = glyph_kernel(indata['dataset'], indata['plane']['data'])
        points = indata['plane']['data']


        #layer meta... 
        meta = {
                'colormap': ColorNode.get_default_cm(),
                'appearance': self._appearance,
                'geometry': indata['plane']['meta'],
            }

        #return all flatenned
        return {'layer' : {'values': values, 'points': points, 'meta': meta}}


