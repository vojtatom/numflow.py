import abc

class Node(abc.ABC):
    """
    Following class properties must be implemented:
        ins:        { type: { required: True | False }, ... }
        out:        type
        structure:  { key : { type: 'display'|'input', value: value of the key, ... }}
    """


    @abc.abstractmethod
    def __init__(self, id, data):
        """
        Validate supplied parameters, raise exception in case of error.
        """
        pass


    @abc.abstractmethod
    def call(self, indata):
        """
        Calls node.
            :param indata: dictionary, where each key
                         is a type of supported in format
                         { type : data, ...}

        Returns:
            { type: data }
        """
        pass

