import abc
from ..exceptions import NodeError

class Node(abc.ABC):
    """
    Following class properties must be implemented:
        in:        { type: { required: True | False }, ... }
        out:        type
        structure:  { key : { type: 'display'|'input', value: value of the key, ... }}
    """

    structure = {}
    parsing = {}

    @abc.abstractmethod
    def __init__(self, id, data, notebook_code, message):
        """
        Validate supplied parameters, raise exception in case of error.
        """
        pass


    @abc.abstractmethod
    def __call__(self, indata, message):
        """
        Calls node.
            :param indata: dictionary, where each key
                         is a type of supported in format
                         { type : data, ...}

        Returns:
            { type: data }
        """
        pass

    @classmethod
    def deserialize(cls, data):
        print('running deser')
        parsed = {}
        parsed['title'] = data['title']
        parsed['id'] = data['id']
        parsed['in'] = data['in']
        parsed['out'] = data['out']
        parsed['data'] = {}

        for field in cls.data['structure']:
            if field in cls.parsing:
                parsed['data'][field] = cls.parsing[field](data['data']['structure'][field]['value'])
            else:
                parsed['data'][field] = data['data']['structure'][field]['value']
            print('deser', field) 
        return parsed


    def check_dict(self, fields, data, node_id, node_title):
        for field in fields:
            if field not in data:
                raise NodeError('{} with id {} missing input {}.'.format(node_title.title(), node_id, field))
