from .base import Node
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


    def __call__(self, indata, message):    
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

        #return all flatenned
        return {'glyphs' : transformed_glyphs}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'size': float(data['data']['structure']['size']['value']),
            'appearance': data['data']['structure']['appearance']['value'],
            'geometry': data['data']['structure']['geometry']['value'],
            'sampling': int(data['data']['structure']['sampling']['value']),
        }
        return parsed


