import math
from collections import namedtuple
from datetime import datetime
from math import isnan
from typing import Dict, Any, List, Tuple

import pm4py
from pandas import DataFrame, to_timedelta
from pandas.core.groupby import DataFrameGroupBy
from pm4py.objects.log.obj import EventLog, Trace
from pydantic import BaseModel
from datetime import timedelta
from ocpa.algo.util.filtering.log import time_filtering
from ocpa.objects.graph.extensive_constraint_graph.obj import ExtensiveConstraintGraph, ActivityNode, ObjectTypeNode, OAEdge, AAEdge, AOAEdge
import ocpa.algo.conformance.constraint_monitoring.algorithm as constraint_monitoring_factory
import json

from worker.main import app
from worker.tasks.alignments import TraceAlignment, SKIP_MOVE
from worker.tasks.dfm import START_TOKEN, STOP_TOKEN, Node, ObjectType
from worker.utils import get_ocel
from dateutil.relativedelta import relativedelta

class MonitoringResult(BaseModel):
    start: str
    end: str
    occured: bool

class MonitoringResults(BaseModel):
    results: Dict[str, List[MonitoringResult]]

@app.task()
def evaluate_constraint_graphs_task(ocel, constraint_graphs):
    ocel: DataFrame = get_ocel(ocel)
    constraint_graphs = json.loads(constraint_graphs)
    moinitoring_results = dict()
    print('start evaluating constraint graphs')
    print(constraint_graphs)
    for cg in constraint_graphs:
        cg_results = []
        constraint_name = cg['name']
        cg1 = ExtensiveConstraintGraph(constraint_name)
        
        time_window = cg['timeUnit']
        if time_window == 'hourly':
            w = timedelta(hours=1)
        elif time_window == 'daily':
            w = timedelta(days=1)
        elif time_window == 'weekly':
            w = timedelta(weeks=1)
        elif time_window == 'monthly':
            w = relativedelta(months=1)
            start_date = datetime.now()
            end_date = start_date + w
            w = end_date - start_date
        elif time_window == 'yearly':
            w = relativedelta(years=1)
            start_date = datetime.now()
            end_date = start_date + w
            w = end_date - start_date
        elif 'hours' in time_window:
            custom_hours = time_window.split(' ')[0]
            w = timedelta(hours=int(custom_hours))
        else:
            w = timedelta(days=1)
        f_in = time_filtering.spanning

        time_index = []
        l_start = ocel.log.log["event_timestamp"].min()
        l_end = ocel.log.log["event_timestamp"].max()

        
        m = int(1 + ((l_end - l_start) / w))

        edges = cg['edges']
        for edge in edges:
            edge_type = edge['edgeType']
            edge_label = edge['edgeLabel']
            operation = edge['operation']
            threshold = edge['threshold']

            if edge_type == 'AA':
                act = ActivityNode(edge['source'])
                aa_edge = AAEdge(act, act, edge_label, operation, threshold)
                cg1.add_aa_edge(aa_edge)
            elif edge_type == 'AOA':
                act1 = ActivityNode(edge['source'])
                ot = ObjectTypeNode(edge['inner'])
                act2 = ActivityNode(edge['target'])
                aoa_edge = AOAEdge(act1, ot, act2, edge_label, operation, threshold)
                cg1.add_aoa_edge(aoa_edge)
            elif edge_type == 'OA':
                ot = ObjectTypeNode(edge['source'])
                act = ActivityNode(edge['target'])
                cg1.add_nodes([ot, act])
                oa_edge = OAEdge(ot, act, edge_label, operation, threshold)
                cg1.add_oa_edge(oa_edge)

        # ignore the last time window if it is not complete
        for i in range(0, m-1):
            start = l_start + i*w
            end = l_start + (i+1)*w
            time_index.append(start)
            sublog = time_filtering.extract_sublog(ocel, start, end, f_in)
            violated, diagnostics = constraint_monitoring_factory.apply(cg1, sublog, parameters=None)
            cg_result = MonitoringResult(start=start.strftime('%Y-%m-%d %H:%M:%S'), end=end.strftime('%Y-%m-%d %H:%M:%S'), occured=violated)
            cg_results.append(cg_result)
        moinitoring_results[constraint_name] = cg_results
        print(moinitoring_results)
    return MonitoringResults(results=moinitoring_results).dict()

    # cg1 = ExtensiveConstraintGraph('Example1')
    # ot_application = ObjectTypeNode('PURCHREQ')
    # act_ca = ActivityNode('Create Purchase Requisition')
    # cg1.add_nodes([ot_application, act_ca])
    # oa1 = OAEdge(ot_application, act_ca, 'exist', '>', 0.1)
    # cg1.add_oa_edge(oa1)

    # print(ocel)
    # print(constraint_graphs)
