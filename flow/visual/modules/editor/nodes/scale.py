from .base import Node
import numpy as np

from ..exceptions import NodeError


class ScaleNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'scale',
            },
            'part' : {
                'type': 'select',
                'choices': ['values', 'points'],
                'value' : 'values',
            },
            'x_scale' : {
                'type': 'input',
                'value' : '1',
            },
            'y_scale' : {
                'type': 'input',
                'value' : '1',
            },
            'z_scale' : {
                'type': 'input',
                'value' : '1',
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
    
    title = 'scale'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of glyph node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

        fields = ['x_scale', 'y_scale', 'z_scale', 'part']
        self.check_dict(fields, data, self.id, self.title)
        self._transform = np.array([data['x_scale'], data['y_scale'], data['z_scale']])
        self._part = data['part']

    def __call__(self, indata, message):    
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
                values = group['values'] * transform
                points = group['points']
            elif part == 'points':
                points = group['points'] * transform
                values = group['values']
            else:
                raise NodeError('Unknown property {} in scale node.'.format(part))
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

        ### streamlines
        if 'streamlines' in indata:
            for stream_group in indata['streamlines']:
                points, values = transform(stream_group, self._transform, self._part)
                transformed_streamlines.append({
                    'values': values,
                    'points': points, 
                    'lengths': stream_group['lengths'],
                    'times': stream_group['times'],
                    'meta': stream_group['meta']
                    })

        ### layers
        if 'layer' in indata:
            for layer_group in indata['layer']:
                points, values = transform(layer_group, self._transform, self._part)
                transformed_layers.append({
                    'values': values,
                    'points': points,
                    'meta': layer_group['meta']
                    })

        #return all together
        out = {}
        if len(transformed_glyphs) > 0:
            out['glyphs'] = transformed_glyphs
        if len(transformed_streamlines) > 0:
            out['streamlines'] = transformed_streamlines
        if len(transformed_layers) > 0:
            out['layer'] = transformed_layers

        return out


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'x_scale': float(data['data']['structure']['x_scale']['value']),
            'y_scale': float(data['data']['structure']['y_scale']['value']),
            'z_scale': float(data['data']['structure']['z_scale']['value']),
            'part': data['data']['structure']['part']['value'],
        }
        return parsed


