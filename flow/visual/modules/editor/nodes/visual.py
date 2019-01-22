from .base import Node
from ..model import notebook
import numpy as np
import json
import base64
from ..exceptions import NodeError


class VisualNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'visual',
            }
        },

        'in': {
            'layer': {
                'required': False,
                'multipart': True
            },
            'streamlines': {
                'required': False,
                'multipart': True
            },
            'glyphs': {
                'required': False,
                'multipart': True
            },
        },
        'out': {},
    }
    
    title = 'visual'
    
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of visual node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id
        self.notebook_code = notebook_code

    def __call__(self, indata, message):    
        """
        Send all data via websockets to display clients
            :param indata: data coming from connected nodes.
        """   

        def serialize_array(array, dtype):
                a = np.ascontiguousarray(dtype(array), dtype=dtype)
                a = base64.b64encode(a.data)
                return a.decode('utf-8')

        content = {}
        if 'layer' in indata:
            ### indata['points'] = [array, array, ...]
            layer_encoded = []
            for layer in indata['layer']:
                layer_group = {}
                layer_group['points'] = serialize_array(layer['points'], np.float32)
                layer_group['values'] = serialize_array(layer['values'], np.float32)
                layer_group['meta'] = layer['meta']
                layer_encoded.append(layer_group)
            
            content['layer'] = layer_encoded

        if 'glyphs' in indata:
            ### indata['glyphs'] = [{'points': array, 'values': array}, ...]
            glyphs_encoded = []
            for glyphs in indata['glyphs']:
                glyphs_group = {}
                glyphs_group['points'] = serialize_array(glyphs['points'], np.float32)
                glyphs_group['values'] = serialize_array(glyphs['values'], np.float32)
                glyphs_group['meta'] = glyphs['meta']
                glyphs_encoded.append(glyphs_group)
            
            content['glyphs'] = glyphs_encoded

        if 'streamlines' in indata:
            ### indata['streamlines'] = [{'points': array, 'values': array, 'lengths': array}, ...]
            stream_encoded = []
            for stream in indata['streamlines']:
                stream_group = {}
                stream_group['points'] = serialize_array(stream['points'], np.float32)
                stream_group['values'] = serialize_array(stream['values'], np.float32)
                stream_group['lengths'] = serialize_array(stream['lengths'], np.int32)
                stream_group['meta'] = stream['meta']
                stream_encoded.append(stream_group)
            
            content['streamlines'] = stream_encoded
                
        n = notebook(self.notebook_code)
        n.save_output(json.dumps(content, sort_keys=True, indent=4))
        return {}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {}
        return parsed


