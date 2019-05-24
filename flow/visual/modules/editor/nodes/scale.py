from .base import Node, check_abort
import numpy as np
import copy

from ..exceptions import NodeError


class ScaleNode(Node):
    """Node represents scaling operations."""
    
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
    
    parsing = {
        'x_scale': lambda x: float(x),
        'y_scale': lambda x: float(x),
        'z_scale': lambda x: float(x),
    }

    title = 'scale'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of scale node.
            :param self: instance of ScaleNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """

        self.id = id

        fields = ['x_scale', 'y_scale', 'z_scale', 'part']
        self.check_dict(fields, data, self.id, self.title)
        self._transform = np.array([data['x_scale'], data['y_scale'], data['z_scale']])
        self._part = data['part']


    def __call__(self, indata, message, abort):    
        """
        Scale the input values according to the node parameters.
            :param self: instance of ScaleNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
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
                check_abort(abort)

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
                check_abort(abort)

        ### layers
        if 'layer' in indata:
            for layer_group in indata['layer']:
                points, values = transform(layer_group, self._transform, self._part)

                ### in case of scaling, scale also the meta info value
                if self._part == 'points':
                    meta = copy.deepcopy(layer_group['meta'])
                    transformed = meta['geometry']['normal_value'] * self._transform[meta['geometry']['normal']]
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


