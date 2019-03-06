import json
import gc

from .exceptions import EditorError
from .nodes import DataNode, GlyphsNode, PointsNode, nodes
from .model import notebook

def load_graph(string_graph):
    """
    Loads graph, filters data 
        :param string_graph: 
    """
    
    graph = json.loads(string_graph)
    parsed_graph = []
    for node in graph:
        if node['title'] not in nodes:
            raise EditorError('Unknown type of node while parsing graph')

        parsed_graph.append(nodes[node['title']].deserialize(node))
    return parsed_graph


def topological_sort(graph): 
    # List of indices of starting nodes
    start_nodes = []
    # dict of nodes
    nodes = {}

    for node in graph:
        nodes[node['id']] = node
        if len(node['in']) == 0:
            start_nodes.append(node['id'])

    ##recursive routine
    def visit_node(nodes, id, visited):
        if id not in visited:
            visited.append(id)
            for neighbour_id in nodes[id]['out']:
                visit_node(nodes, neighbour_id, visited.copy())
        else:
            raise EditorError('Cycle detected at node {}!'.format(id))

    for i in start_nodes:
        visit_node(nodes, i, [])

    order = start_nodes
    for id in order:
        for neighbour_id in nodes[id]['out']:
            
            ### additional chack for requirement satisfication
            satisfied = True
            for requirements in nodes[neighbour_id]['in']:
                if requirements not in order:
                    satisfied = False

            if neighbour_id not in order and satisfied:
                order.append(neighbour_id)    
    return order
            

def compute(notebook_code, graph, order, message):
    n = notebook(notebook_code)
    n.clear_output()
    data = {}
    dgraph = {}

    for node in graph:
        dgraph[node['id']] = node

    for node_id in order:
        node = dgraph[node_id]
        in_data = {}
        node_class = nodes[node['title']]

        #construct in node dict
        for in_node in node['in']:
            #each datatype in output of incoming nodes
            for datatype in data[in_node]:
                #if node requires this datatype
                if datatype in node_class.data['in']:
                    #if node has multipart input
                    d = data[in_node][datatype]
                    if node_class.data['in'][datatype]['multipart']:
                        if datatype in in_data:
                            #some nodes have multipart output
                            if type(d) is list:
                                in_data[datatype].extend(d)
                            else:
                                in_data[datatype].append(d)
                        else:
                            if type(d) is list:
                                in_data[datatype] = d
                            else:
                                in_data[datatype] = [d]
                    #or not:
                    else:
                        if type(d) is list:
                            raise EditorError('Multipart output into non-multipart input!')
                        elif datatype in in_data:
                            raise EditorError('Multiple smae-type inputs into non-multipart input!')
                        in_data[datatype] = data[in_node][datatype]  


        message('Running node #{}: {}'.format(node_id, node['title']))
        node_obj = node_class(node_id, node['data'], notebook_code, message)
        data[node_id] = node_obj(in_data, message)
    
    message('<a href="/media/notebook/{}/output.imgflow" download>download result</a>'.format(notebook_code))
    
    del data, dgraph
    gc.collect()







