from .base import Node
from ..exceptions import NodeError
import json
import copy

class ColorNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'color map',
            },
            'sampling' : {
                'type': 'select',
                'choices' : ['2', '3', '4', '5'],
                'value' : '3',
            },
            'color_0' : {
                'type': 'color',
                'value' : [0, 0.5, 1, 1],
            },
            'color_1' : {
                'type': 'color',
                'value' : [1, 1, 1, 1],
            },
            'color_2' : {
                'type': 'color',
                'value' : [1, 0.5, 0, 1],
            },
            'color_3' : {
                'type': 'color',
                'value' : [0, 0, 0, 0],
            },
            'color_4' : {
                'type': 'color',
                'value' : [0, 0, 0, 0],
            },
            'color_5' : {
                'type': 'select',
                'choices': ['scipy', 'c'],
                'value' : 'scipy',
            },
        },

        'in': {
            'glyphs': {
                'required': False,
                'multipart': True
            },
            'streamlines': {
                'required': False,
                'multipart': True
            },
            'layer': {
                'required': False,
                'multipart': True
            }
        },
        'out': {
            'glyphs': {
                'required': False,
                'multipart': True
            },
            'streamlines': {
                'required': False,
                'multipart': True
            },
            'layer': {
                'required': False,
                'multipart': True
            }
        },
    }
    
    title = 'color'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of dataset node.
            :param id: id of node
            :param data: dictionary, must contain keys 'code' and 'mode'.
        """   

        self.id = id
        fields = ['sampling', 'color_0', 'color_1', 'color_2', 'color_3', 'color_4']
        self.check_dict(fields, data, self.id, self.title)

        ## get path to dataset
        self._sampling = data['sampling']
        self._colors = []
        for field in ['color_0', 'color_1', 'color_2', 'color_3', 'color_4']:
            self._colors.append(data[field])


    def __call__(self, indata, message):
        """
        Create dataset.
            :param indata: data coming from connected nodes, can be None here.
        """   

        colormap = {
            'sampling': self._sampling,
            'colors': self._colors,
        }

        transformed_glyphs = []
        transformed_streamlines = []
        transformed_layer = []

        ### glyphs
        if 'glyphs' in indata:
            for glyphs_group in indata['glyphs']:
                new = {'values': glyphs_group['values'],'points': glyphs_group['points']}
                meta = copy.deepcopy(glyphs_group['meta'])
                meta['colormap'] = colormap
                new['meta'] = meta
                transformed_glyphs.append(new)

        ### streamlines
        if 'streamlines' in indata:
            for stream_group in indata['streamlines']:
                new = {'values': stream_group['values'],'points': stream_group['points'], 'lengths': stream_group['lengths']}
                meta = copy.deepcopy(stream_group['meta'])
                meta['colormap'] = colormap
                new['meta'] = meta
                transformed_streamlines.append(new)

        ### layer
        if 'layer' in indata:
            for layer_group in indata['layer']:
                new = {'values': layer_group['values'],'points': layer_group['points']}
                meta = copy.deepcopy(layer_group['meta'])
                meta['colormap'] = colormap
                new['meta'] = meta
                transformed_layer.append(new)

        #return all together
        out = {}
        if len(transformed_glyphs) > 0:
            out['glyphs'] = transformed_glyphs
        if len(transformed_streamlines) > 0:
            out['streamlines'] = transformed_streamlines
        if len(transformed_layer) > 0:
            out['layer'] = transformed_layer
        return out

    @staticmethod
    def get_default_cm():
        return {
                    'sampling': 3,
                    'colors': [
                        [0, 0, 1, 1], 
                        [1, 1, 1, 1], 
                        [1, 0, 0, 1], 
                        [0, 0, 0, 1],
                        [0, 0, 0, 1],
                        ]
                }


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'sampling': int(data['data']['structure']['sampling']['value'])
        }
        for field in ['color_0', 'color_1', 'color_2', 'color_3', 'color_4']:
            try:
                parsed['data'][field] = data['data']['structure'][field]['value']
            except:
                pass
        return parsed

