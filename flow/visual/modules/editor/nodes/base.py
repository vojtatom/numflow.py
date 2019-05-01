import abc
from ..exceptions import NodeError


def check_abort(event):
    if event.is_set():
        raise Exception('Abort!')


class Node(abc.ABC):
    """
    Following class properties must be implemented:
        in:        { type: { required: True | False }, ... }
        out:        type
        structure:  { key : { type: 'display'|'input', value: value of the key, ... }}
    """

    #structure = {}
    parsing = {}
    data = {}

    @abc.abstractmethod
    def __init__(self, id, data, notebook_code, message):
        """
        Validate supplied parameters, raise exception in case of error.
        """
        pass


    @abc.abstractmethod
    def __call__(self, indata, message, abort):
        """
        Calls node.
            :param self: instance of Node
            :param indata: dictionary, where each key
                         is a type of supported in format
                         { type : data, ...}
            :param message: lambda function message(text)
            :param abort: Event signalling to abort

        Returns:
            { type: data }
        """ 
        pass

    @classmethod
    def deserialize(cls, data):
        parsed = {}
        parsed['title'] = data['title']
        parsed['id'] = data['id']
        parsed['in'] = data['in']
        parsed['out'] = data['out']
        parsed['data'] = {}

        try:
            for field in cls.data['structure']:
                if field in cls.parsing:
                    parsed['data'][field] = cls.parsing[field](data['data']['structure'][field]['value'])
                else:
                    parsed['data'][field] = data['data']['structure'][field]['value']
            return parsed
        except:
            raise NodeError('Error while parsing contents of node {}, perhaps a missing value or wrong type?'.format(cls.__name__))


    def check_dict(self, fields, data, node_id, node_title):
        for field in fields:
            if field not in data:
                raise NodeError('{} with id {} missing input {}.'.format(node_title.title(), node_id, field))
