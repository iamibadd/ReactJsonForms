import math
from collections import namedtuple
from datetime import datetime
from math import isnan
from typing import Dict, Any, List, Tuple
from dateutil.parser import parse

from pandas import DataFrame
from pydantic import BaseModel
from dataclasses import asdict
import json
import networkx as nx

from worker.main import app
from worker.tasks.alignments import TraceAlignment, SKIP_MOVE
from worker.utils import get_ocel
from ocpa.algo.util.aopm.impact_analysis import algorithm as impact_analysis_factory
from ocpa.algo.discovery.ocpn import algorithm as ocpn_discovery_factory
from ocpa.objects.aopm.action_interface_model.obj import ActionInterfaceModel
from ocpa.objects.aopm.impact.obj import ActionChange

class ImpactAnalysisResult(BaseModel):
    results: Dict[str, Any]

@app.task()
def execute_impact_analysis_task(ocel, str_ai, str_change, performance_analysis_window):
    ocel: DataFrame = get_ocel(ocel)
    ocpn = ocpn_discovery_factory.apply(ocel, parameters={"debug": False})
    aim = ActionInterfaceModel(ocpn, set(), set(), set())
    change = json.loads(str_change)
    changed_transitions = []
    performance_analysis_window = json.loads(performance_analysis_window)
    perf_start = parse(performance_analysis_window['start'])
    perf_end = parse(performance_analysis_window['end'])
    for activity in change:
        changed_transitions.append(aim.ocpn.find_transition(activity))
    ai = json.loads(str_ai)
    ai_start = parse(ai['start'])
    ai_end = parse(ai['end'])
    ac = ActionChange(aim, changed_transitions, (ai_start,ai_end))
    # ac = ActionChange()
    results = impact_analysis_factory.apply(ac, ocel, [perf_start, perf_end])
    print(results)
    return ImpactAnalysisResult(results=results).dict()
