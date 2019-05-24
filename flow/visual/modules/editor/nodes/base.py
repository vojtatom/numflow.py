import abc
from ..exceptions import NodeError


def check_abort(event):
    if event.is_set():
        raise Exception('Abort!')


class Node(abc.ABC):
    """
    Following class properties must be implemented:
        data: {
            "in":        { type: { required: True | False }, ... }
            "out":        type
            "structure":  { key : { type: 'display'|'input', value: value of the key, ... }}
        }

        parsing: {} dict specifying the parsing functions for individual structural elements
    """
    data = {}
    parsing = {}

    @abc.abstractmethod
    def __init__(self, id, data, notebook_code, message):
        """
        Inicialize new instance of node.
            :param self: instance of Node
            :param id: id of node
            :param data: dictionary of node parameters, 
                   has to contain values from Node.data['structure']
            :param notebook_code: code of the notebook containing the node
            :param message: lambda with signature (string): none; 
                            has to send messages back to user
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
        """
        Deserialize the JSON string created by the client JavaScript node.
            :param cls: class inheriting from Node
            :param data: JSON string
        """
        
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
        """
        Check whether the supplied dictionary contains all of the required values.
            :param self: class inheriting from Node
            :param fields: list of required values
            :param data: checked dict
            :param node_id: id of the checking node
            :param node_title: title of the checking node
        """
        for field in fields:
            if field not in data:
                raise NodeError('{} with id {} missing input {}.'.format(node_title.title(), node_id, field))
