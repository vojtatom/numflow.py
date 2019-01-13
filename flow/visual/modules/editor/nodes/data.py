from .base import Node
from ..model import dataset
from visual.modules.numeric.io import data, cdata


class DataNode(Node):
    data = {
        'structure': {
            'title' : {
                'type': 'display',
                'value' : 'dataset',
            },
            'code' : {
                'type': 'input',
                'value' : '',
            },
            'type' : {
                'type': 'input',
                'value' : 'scipy',
            },
        },

        'in': [],
        'out': ['dataset'],
    }
    
    title = 'dataset'
    
    def __init__(self, id, data):
        self.id = id

        #TODO perform checks...

        ## get path to dataset
        path = dataset(data['code'])

        if data['type'] == 'scipy':
            self.data = data(path)
        else:
            self.data = cdata(path)

    def call(self, indata):
        return self.data


    @staticmethod
    def deserialize(data):
        parsed = Node.deserialize(data)
        parsed['data'] = {
            'code' : data['data']['structure']['code']['value'],
            'type' : data['data']['structure']['type']['value']
        }
        return parsed

