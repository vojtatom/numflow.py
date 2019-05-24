from .base import Node, check_abort
import numpy as np

from .color import ColorNode
from ..exceptions import NodeError
from visual.modules.numeric.kernels import glyph_kernel


class LayerNode(Node):
    """The node represents the construction of a 2D slice."""
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
        Inicialize new instance of layer node.
            :param self: instance of LayerNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """
        self.id = id

        fields = ['appearance']
        self.check_dict(fields, data, self.id, self.title)
        self._appearance = data['appearance']


    def __call__(self, indata, message, abort):    
        """
        Construct the 2D slice.
            :param self: instance of LayerNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
        """  

        fields = ['dataset', 'plane']
        self.check_dict(fields, indata, self.id, self.title)

        check_abort(abort)
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


