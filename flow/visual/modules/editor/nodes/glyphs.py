from .base import Node, check_abort
import numpy as np

from .color import ColorNode
from ..exceptions import NodeError
from visual.modules.numeric.kernels import glyph_kernel


class GlyphsNode(Node):
    """Node representing the glyphs construction."""

    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'glyphs',
            },

            'size' : {
                'type': 'input',
                'value' : '1',
            },

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
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
            'glyphs': {
                'required': True,
                'multipart': False
            },
        },
    }

    parsing = {
       'size' :  lambda x: float(x),
    }
    
    title = 'glyphs'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param self: instance of GlyphsNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """

        self.id = id

        fields = ['size', 'appearance']
        self.check_dict(fields, data, self.id, self.title)
        self._size = data['size']
        self._appearance = data['appearance']


    def __call__(self, indata, message, abort):    
        """
        Perform glyphs construction.
            :param self: instance of GlyphsNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """ 

        fields = ['dataset', 'points']
        self.check_dict(fields, indata, self.id, self.title)

        values = None
        points = None

        #interpolate per points group
        for points_group in indata['points']:
            out_values = glyph_kernel(indata['dataset'], points_group)
            check_abort(abort)
            
            if values is None:
                values = out_values
                points = points_group
            else:
                values = np.append(values, out_values, axis=0)
                points = np.append(points, points_group, axis=0)

        #glyphs meta... 
        meta = {
                'size': self._size,
                'sampling': 4,
                'geometry': 'line',
                'colormap': ColorNode.get_default_cm(),
                'appearance': self._appearance,
            }
            
        #return all flatenned
        return {'glyphs' : {'values': values, 'points': points, 'meta': meta}}

