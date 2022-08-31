from .base import Node, check_abort
from ..exceptions import NodeError
import json
import copy

class ColorNode(Node):
    """Node representing the colorbar.""" 

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
                'type': 'color',
                'value' : [0, 0, 0, 0],
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

    parsing = {
        'sampling' : lambda x : int(x),
    }
    
    title = 'color'


    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of color node.
            :param self: instance of ColorNode
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
        """

        self.id = id
        fields = ['sampling', 'color_0', 'color_1', 'color_2', 'color_3', 'color_4']
        self.check_dict(fields, data, self.id, self.title)

        ## get path to dataset
        self._sampling = data['sampling']
        self._colors = []
        for field in ['color_0', 'color_1', 'color_2', 'color_3', 'color_4']:
            self._colors.append(data[field])


    def __call__(self, indata, message, abort):
        """
        Apply the specified colormap on the input data objects.
            :param self: instance of ColorNode
            :param indata: data coming from connected nodes
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
            :param abort: object for chacking the abort flag,
                          check is done by using the check_abort method
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
                check_abort(abort)

        ### streamlines
        if 'streamlines' in indata:
            for stream_group in indata['streamlines']:
                new = {
                    'values': stream_group['values'],
                    'points': stream_group['points'], 
                    'lengths': stream_group['lengths'],
                    'times': stream_group['times'],
                    }
                meta = copy.deepcopy(stream_group['meta'])
                meta['colormap'] = colormap
                new['meta'] = meta
                transformed_streamlines.append(new)
                check_abort(abort)

        ### layer
        if 'layer' in indata:
            for layer_group in indata['layer']:
                new = {'values': layer_group['values'],'points': layer_group['points']}
                meta = copy.deepcopy(layer_group['meta'])
                meta['colormap'] = colormap
                new['meta'] = meta
                transformed_layer.append(new)
                check_abort(abort)

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
        """
        Supply default colormap.
        """   

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

