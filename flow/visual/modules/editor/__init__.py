from .nodes.data import DataNode

nodes = {
            'data': { 
                DataNode.title : { 
                    'structure': DataNode.structure,
                    'ins' : DataNode.ins,
                    'out' : DataNode.out,
                },
             },
            'test' : {
                'test' : { 
                    'structure': DataNode.structure,
                    'ins' : ['dataset', 'sometaing', 'else'],
                    'out' : ['else'],
                },

                'test2' : { 
                    'structure': DataNode.structure,
                    'ins' : ['sometaing', 'else'],
                    'out' : ['dataset'],
                },
            }
        }
