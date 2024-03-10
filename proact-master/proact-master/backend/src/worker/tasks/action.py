from datetime import datetime
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel
from dataclasses import asdict
import json

from worker.main import app
from ocpa.objects.aopm.action_engine.obj import ConstraintInstance, ConstraintPattern, ActionGraph
from ocpa.algo.util.aopm.action_engine import algorithm as action_engine_factory

class ActionInstance(BaseModel):
    start: str
    end: str
    action: str

class ActionEngineResults(BaseModel):
    results: List[ActionInstance]

def get_node_by_id(id, nodes):
        return next((x for x in nodes if x['data']['id'] == id), None)

def parse_cy_contraint_pattern(name, cy_tree):
    # Create a BinaryTree object
    binary_tree = ConstraintPattern(name)

    # Get the nodes and edges from the Cytoscape.js tree
    nodes = cy_tree["elements"]["nodes"]
    edges = cy_tree["elements"]["edges"]

    # Find the root node (the one with no parent) and add it to the BinaryTree
    for node in nodes:
        if "parentNode" not in node["data"]:
            binary_tree.add_root(node["data"]["id"], node["data"]["label"])
            break

    # Helper function to find the left child of a parent node
    def is_left_child(parent, child):
        return child["position"]["x"] < parent["position"]["x"]

    # Add the remaining nodes to the BinaryTree
    for edge in edges:
        parent_id = edge["data"]["source"]
        child_id = edge["data"]["target"]
        parent = get_node_by_id(parent_id, nodes)
        child = get_node_by_id(child_id, nodes)
        if is_left_child(parent, child):
            binary_tree.add_left_child(parent_id, child_id, child["data"]["label"])
        else:
            binary_tree.add_right_child(parent_id, child_id,  child["data"]["label"])

    return binary_tree

def parse_cy_action_graph(cy_graph, constraint_patterns):
    action_graphs = []

    # Get the nodes and edges from the Cytoscape.js tree
    nodes = cy_graph["elements"]["nodes"]
    if "edges" in cy_graph["elements"]:
        edges = cy_graph["elements"]["edges"]
    else:
        return action_graphs

    for edge in edges:
        source_id = edge["data"]["source"]
        target_id = edge["data"]["target"]
        duration = int(edge["data"]['duration'])
        time_scale = edge["data"]["time_scale"]

        # Get the label of the source and target nodes
        source_label = get_node_by_id(source_id, nodes)['data']['label']
        target_label = get_node_by_id(target_id, nodes)['data']['label']

        pattern = None
        for cp in constraint_patterns:
            if source_label == cp.name:
                pattern = cp
                break

        if pattern is not None:
            action_graph = ActionGraph(pattern, target_label, duration, time_scale)
            action_graphs.append(action_graph)

    return action_graphs

def parse_cy_action_conflict(cy_graph):
    precedence_list = []

    # Get the nodes and edges from the Cytoscape.js tree
    nodes = cy_graph["elements"]["nodes"]
    if "edges" in cy_graph["elements"]:
        edges = cy_graph["elements"]["edges"]
    else:
        return precedence_list

    for edge in edges:
        source_id = edge["data"]["source"]
        target_id = edge["data"]["target"]

        # Get the label of the source and target nodes
        source_label = get_node_by_id(source_id, nodes)['data']['label']
        target_label = get_node_by_id(target_id, nodes)['data']['label']
        precedence_list.append((source_label, target_label))
        

    return precedence_list

def transform_data_to_constraints(data):
    constraint_instances = []

    for name, intervals in data['results'].items():
        for interval in intervals:
            if interval['occured'] == False:
                continue
            start = datetime.strptime(interval['start'], "%Y-%m-%d %H:%M:%S")
            end = datetime.strptime(interval['end'], "%Y-%m-%d %H:%M:%S")
            constraint_instance = ConstraintInstance(name, start, end)
            constraint_instances.append(constraint_instance)

    return constraint_instances


@app.task()
def execute_action_engine_task(json_cis, str_constraint_patterns, str_action_graph, str_action_conflict):
    cy_constraint_patterns = json.loads(str_constraint_patterns)
    print(cy_constraint_patterns)
    constraint_patterns = []
    for cp in cy_constraint_patterns:
        constraint_name = cp['name']
        cp = parse_cy_contraint_pattern(constraint_name, cp['cytoscapeGraph'])
        constraint_patterns.append(cp)
    
    cy_action_graph = json.loads(str_action_graph)
    action_graph =parse_cy_action_graph(cy_action_graph, constraint_patterns)
    
    cy_action_conflict = json.loads(str_action_conflict)
    action_conflict = parse_cy_action_conflict(cy_action_conflict)

    dict_cis = json.loads(json_cis)
    cis = transform_data_to_constraints(dict_cis)
    print(cis)
    
    ais = action_engine_factory.apply(cis,action_graph,action_conflict)
    date_format = '%Y-%m-%d %H:%M:%S'
    ais_dicts = [{k: v.strftime(date_format) if isinstance(v, datetime) else v for k, v in asdict(ai).items()} for ai in ais]
    print(ais_dicts)
    return ActionEngineResults(results=ais_dicts).dict()
