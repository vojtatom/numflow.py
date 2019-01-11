import json


def load_graph(string_graph):
        graph = json.loads(string_graph)
        return graph


def detect_cycles(graph): 
    start_nodes = []
    nodes = {}

    for node in graph:
        nodes[node['id']] = node
        if len(node['in']) == 0:
            start_nodes.append(node['id'])

    for i in start_nodes:
        visited = []

        

def visit_node(nodes, node):
    pass



