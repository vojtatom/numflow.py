from .base import Node, check_abort
import numpy as np
import copy

from ..exceptions import NodeError


class GlyphGeometryNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'glyph geometry',
            },

            'geometry' : {
                'type': 'select',
                'choices': ['line', 'cone'],
                'value' : 'line',
            },

            'size' : {
                'type': 'input',
                'value' : '1',
            },

            'sampling' : {
                'type': 'input',
                'value' : '4',
            },

            'appearance' : {
                'type': 'select',
                'choices': ['solid', 'transparent'],
                'value' : 'solid',
            },
        },

        'in': {
            'glyphs': {
                'required': True,
                'multipart': True
            },
        },
        'out': {
            'glyphs': {
                'required': True,
                'multipart': True
            },
        },
    }

    parsing = {
       'size' :  lambda x: float(x),
       'sampling' : lambda x: int(x),
    }
    
    title = 'glyph geometry'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

        fields = ['geometry', 'size', 'sampling', 'appearance']
        self.check_dict(fields, data, self.id, self.title)
        self._geometry = data['geometry']
        self._sampling = data['sampling']
        self._size = data['size']
        self._appearance = data['appearance']


    def __call__(self, indata, message, abort):    
        """
        Call glyph kernel and perform interpolation.
            :param indata: data coming from connected nodes, can be None here.
        """   

        fields = ['glyphs']
        self.check_dict(fields, indata, self.id, self.title)

        transformed_glyphs = []

        #modify per group
        for glyphs_group in indata['glyphs']:
                new = {
                    'values': glyphs_group['values'],
                    'points': glyphs_group['points']
                    }

                meta = copy.deepcopy(glyphs_group['meta'])
                meta['geometry'] = self._geometry
                meta['sampling'] = self._sampling
                meta['size'] = self._size
                meta['appearance'] = self._appearance
                new['meta'] = meta

                transformed_glyphs.append(new)
                check_abort(abort)

        #return all flatenned
        return {'glyphs' : transformed_glyphs}

