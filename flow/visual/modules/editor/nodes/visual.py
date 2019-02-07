from .base import Node
from ..model import notebook
import numpy as np
from numpy.linalg import norm
import json
import base64
from ..exceptions import NodeError


def cleanup_streamline(streamlines):
    offset = 0
    to_delete = []
    lengths_diff = np.zeros(streamlines['lengths'].shape)

    ### take each streamline
    for i, streamline_length in enumerate(streamlines['lengths']):
        local_values = streamlines['values'][offset:offset + streamline_length,:] 
        norms = norm(local_values, axis=1)

        ### take only those wehre norm is zero
        delete_index = np.where(norms < 10 ** -5)[0]
        
        ### if there are any zero length
        if delete_index.size > 0:
            subseq = np.diff(delete_index)
            subseq = np.insert(subseq, 0, 1)
            delete_index = delete_index[subseq == 1]

            ### if there are any disposable
            if delete_index.size > 0:
                to_delete.extend(offset + delete_index)
                lengths_diff[i] = delete_index.size

        offset += streamline_length

    return {
        'points': np.delete(streamlines['points'], to_delete, axis=0),
        'values': np.delete(streamlines['values'], to_delete, axis=0),
        'times': np.delete(streamlines['times'], to_delete, axis=0),
        'lengths': streamlines['lengths'] - lengths_diff,
        'meta': streamlines['meta'],
    }





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


        def boundries(values):
            bounds = {}
            start = np.amin(values, axis=0)
            bounds['start'] = serialize_array(start, np.float32)
            bounds['dim'] = serialize_array(np.amax(values, axis=0) - start, np.float32)
            return bounds

        content = {}
        if 'layer' in indata:
            ### indata['layer'] = [{'points': array, 'values': array}, ...]
            layer_encoded = []
            for layer in indata['layer']:
                layer_group = {}
                layer_group['points'] = serialize_array(layer['points'], np.float32)
                layer_group['values'] = serialize_array(layer['values'], np.float32)
                layer_group['meta'] = layer['meta']
                layer_group['meta']['bounds'] = boundries(layer['points'])
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
                glyphs_group['meta']['bounds'] = boundries(glyphs['points'])
                glyphs_encoded.append(glyphs_group)
            
            content['glyphs'] = glyphs_encoded

        if 'streamlines' in indata:
            ### indata['streamlines'] = [{'points': array, 'values': array, 'lengths': array}, ...]
            stream_encoded = []
            for stream in indata['streamlines']:
                ##postproc, cleanup zero speeds
                stream = cleanup_streamline(stream)

                stream_group = {}
                stream_group['points'] = serialize_array(stream['points'], np.float32)
                stream_group['values'] = serialize_array(stream['values'], np.float32)
                stream_group['lengths'] = serialize_array(stream['lengths'], np.int32)
                stream_group['times'] = serialize_array(stream['times'], np.float32)
                stream_group['meta'] = stream['meta']
                stream_group['meta']['bounds'] = boundries(stream['points'])
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


