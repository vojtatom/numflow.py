import json
from .exceptions import EditorError
from .nodes import DataNode, GlyphsNode, PointsNode


def load_graph(string_graph):
    """
    Loads graph 
        :param string_graph: 
    """

    deserializers = {
        DataNode.title: DataNode.deserialize,
        GlyphsNode.title: GlyphsNode.deserialize,
        PointsNode.title: PointsNode.deserialize,
    }
    
    graph = json.loads(string_graph)
    parsed_graph = []
    for node in graph:
        if node['title'] not in deserializers:
            raise EditorError('Unknown type of node while parsing graph')
        parsed_graph.append(deserializers[node['title']](node))
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
            neighbour_id = neighbour_id
            if neighbour_id not in order:
                order.append(neighbour_id)    
    return order
            

def compute(graph, order, message):
    print(graph)






