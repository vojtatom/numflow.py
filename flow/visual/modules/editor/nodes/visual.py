from .base import Node
from ..model import dataset
import numpy as np

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
            'points': {
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
        'out': [],
    }
    
    title = 'visual'
    
    def __init__(self, id, data, message):
        """
        Inicialize new instance of visual node.
            :param id: id of node
            :param data: dictionary, can be None here.
        """   
        self.id = id

    def __call__(self, indata, message):    
        """
        Send all data via websockets to display clients
            :param indata: data coming from connected nodes.
        """   
        raise NodeError('Not implemented')
        #return {}

    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {}
        return parsed


