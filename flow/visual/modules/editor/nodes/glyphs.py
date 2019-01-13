from .base import Node
from ..model import dataset

from ..exceptions import NodeError
from visual.modules.numeric.kernels import GlyphKernel


class GlyphsNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'glyphs',
            }
        },

        'in': ['points', 'dataset'],
        'out': ['glyphs'],
    }
    
    title = 'glyphs'
    
    def __init__(self, id, data):
        self.id = id

        #data should be None?

    def call(self, indata):    
        if not ('dataset' in indata or 'points' in indata):
            raise NodeError('Both dataset and points are needed for glyphs node.')

        kernel = GlyphKernel()

        kernel.data = indata['dataset']
        kernel.points = indata['points']

        glyphs = kernel.calculate()

        return  {'glyphs': glyphs}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {}
        return parsed


