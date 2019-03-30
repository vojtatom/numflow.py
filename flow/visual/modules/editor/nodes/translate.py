from .base import Node, check_abort
import numpy as np
import copy

from ..exceptions import NodeError


class TranslateNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'translate',
            },
            'part' : {
                'type': 'select',
                'choices': ['values', 'points'],
                'value' : 'points',
            },
            'x_translate' : {
                'type': 'input',
                'value' : '0',
            },
            'y_translate' : {
                'type': 'input',
                'value' : '0',
            },
            'z_translate' : {
                'type': 'input',
                'value' : '0',
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
            },
        },
    }

    parsing = {
        'x_translate': lambda x: float(x),
        'y_translate': lambda x: float(x),
        'z_translate': lambda x: float(x),
    }
    
    title = 'translate'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

        fields = ['x_translate', 'y_translate', 'z_translate', 'part']
        self.check_dict(fields, data, self.id, self.title)
        self._transform = np.array([data['x_translate'], data['y_translate'], data['z_translate']])
        self._part = data['part']

    def __call__(self, indata, message, abort):    
        """
        Call glyph kernel and perform interpolation.
            :param indata: data coming from connected nodes, can be None here.
        """   

        transformed_glyphs = []
        transformed_streamlines = []
        transformed_layers = []

         ### transform function
        def transform(group, transform, part):
            if part == 'values':
                values = group['values'] + transform
                points = group['points']
            elif part == 'points':
                points = group['points'] + transform
                values = group['values']
            else:
                raise NodeError('Unknown property {} in translate node.'.format(part))
            return points, values

        ### glyphs
        if 'glyphs' in indata:
            for glyphs_group in indata['glyphs']:
                points, values = transform(glyphs_group, self._transform, self._part)
                transformed_glyphs.append({
                    'values': values,
                    'points': points,
                    'meta': glyphs_group['meta']
                    })
                check_abort(abort)

        ### streamlines
        if 'streamlines' in indata:
            for stream_group in indata['streamlines']:
                points, values = transform(stream_group, self._transform, self._part)
                transformed_streamlines.append({
                    'values': points,
                    'points': values, 
                    'lengths': stream_group['lengths'],
                    'times': stream_group['times'],
                    'meta': stream_group['meta'],
                    })
                check_abort(abort)

        ### layers
        if 'layer' in indata:
            for layer_group in indata['layer']:
                points, values = transform(layer_group, self._transform, self._part)
                
                ### in case of scaling, scale also the meta info value
                if self._part == 'points':
                    meta = copy.deepcopy(layer_group['meta'])
                    transformed = meta['geometry']['normal_value'] + self._transform[meta['geometry']['normal']]
                    meta['geometry']['normal_value'] = transformed
                else:
                    meta = layer_group['meta']

                transformed_layers.append({
                    'values': values,
                    'points': points,
                    'meta': meta
                    })
                check_abort(abort)

        #return all together
        out = {}
        if len(transformed_glyphs) > 0:
            out['glyphs'] = transformed_glyphs
        if len(transformed_streamlines) > 0:
            out['streamlines'] = transformed_streamlines
        if len(transformed_layers) > 0:
            out['layer'] = transformed_layers
        return out


