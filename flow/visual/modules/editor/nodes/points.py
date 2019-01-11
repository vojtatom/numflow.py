from .base import Node
from ..model import dataset
from visual.modules.numeric.geometry import vectors


class PointsNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'points',
            },
            'x_min' : {
                'type': 'input',
                'value' : '',
            },
            'y_min' : {
                'type': 'input',
                'value' : '',
            },
            'z_min' : {
                'type': 'input',
                'value' : '',
            },
            'x_max' : {
                'type': 'input',
                'value' : '',
            },
            'y_max' : {
                'type': 'input',
                'value' : '',
            },
            'z_max' : {
                'type': 'input',
                'value' : '',
            },
            'x_sampling' : {
                'type': 'input',
                'value' : '',
            },
            'y_sampling' : {
                'type': 'input',
                'value' : '',
            },
            'z_sampling' : {
                'type': 'input',
                'value' : '',
            },
        },

        'ins': [],        
        'out': ['points'],
    }

    title = 'points'
    
    def __init__(self, id, data):
        self.id = id

        #TODO perform checks...

        start = [data.x_min, data.y_min, data.z_min]
        end = [data.x_max, data.y_max, data.z_max]
        sampling = [data.x_sampling, data.y_sampling, data.z_sampling]

        self.data = vectors.location(start, end, sampling)


    def call(self, indata):
        return self.data