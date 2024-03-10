import { AsyncApiState } from "../../hooks";
import { QueryReducer, ResetQueryState, SetQueryState } from "../QueryState";
import { ActionEngineResults } from "./actionquery.types";

const SET_ACTION_QUERY_STATE = "SET_ACTION_ENGINE_QUERY_STATE";
const RESET_ACTION_QUERY_STATE = "RESET_ACTION_ENGINE_QUERY_STATE";

export const ActionEngineResultsInitialState: AsyncApiState<ActionEngineResults> = {
    result: null,
    preliminary: null,
    failed: false
}

export const ActionEngineResultsQueryReduce = QueryReducer(ActionEngineResultsInitialState, SET_ACTION_QUERY_STATE, RESET_ACTION_QUERY_STATE);

export const setActionQueryState = SetQueryState(SET_ACTION_QUERY_STATE);
export const resetActionQueryState = ResetQueryState(RESET_ACTION_QUERY_STATE);
