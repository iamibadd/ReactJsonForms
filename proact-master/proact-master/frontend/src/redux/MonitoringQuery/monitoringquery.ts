import { AsyncApiState } from "../../hooks";
import { QueryReducer, ResetQueryState, SetQueryState } from "../QueryState";
import { MonitoringResults } from "./monitoringquery.types";

const SET_MONITORING_QUERY_STATE = "SET_MONITORING_QUERY_STATE";
const RESET_MONITORING_QUERY_STATE = "RESET_MONITORING_QUERY_STATE";

export const MonitoringResultsInitialState: AsyncApiState<MonitoringResults> = {
    result: null,
    preliminary: null,
    failed: false
}

export const MonitoringResultsQueryReduce = QueryReducer(MonitoringResultsInitialState, SET_MONITORING_QUERY_STATE, RESET_MONITORING_QUERY_STATE);

export const setMonitoringQueryState = SetQueryState(SET_MONITORING_QUERY_STATE);
export const resetMonitoringQueryState = ResetQueryState(RESET_MONITORING_QUERY_STATE);
