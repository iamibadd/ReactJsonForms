import math
from collections import namedtuple
from datetime import datetime
from math import isnan
from typing import Dict, Any, List, Tuple

import pm4py
from pandas import DataFrame, Timedelta, Timestamp
from pandas.core.groupby import DataFrameGroupBy
from pm4py.objects.log.obj import EventLog, Trace
from pydantic import BaseModel

from worker.main import app
from worker.tasks.alignments import TraceAlignment, SKIP_MOVE
from worker.tasks.dfm import START_TOKEN, STOP_TOKEN, Node, ObjectType
from worker.utils import get_projected_event_log, get_ocel

OCELEventId = int
ProjectedEventTime = namedtuple("ProjectedEventTimes", ['aligned_time', 'model_move_counter'])
AlignedEdgeTimes = namedtuple("AlignedEdgeTimes", ['previous_activity', 'activation_time', 'execution_time'])

from ocpa.objects.log.importer.ocel import factory as ocel_import_factory
from ocpa.algo.discovery.ocpn import algorithm as ocpn_discovery_factory
from ocpa.visualization.oc_petri_net import factory as ocpn_vis_factory



@app.task()
def ocpn_discovery_task(ocel: str, aligned_times: Dict[ObjectType, Dict[str, Dict[str, ProjectedEventTime]]]):
    ocel: DataFrame = get_ocel(ocel)
    ocpn = ocpn_discovery_factory.apply(ocel, parameters={"debug": False})
    # gviz = ocpn_vis_factory.apply(ocpn, parameters={'format': 'svg'})
    # ocpn_vis_factory.view(gviz)
    # return aggregate_times_to_frontend_friendly(collected_times).dict()
