import { AsyncApiState } from "../../hooks";
import { QueryReducer, ResetQueryState, SetQueryState } from "../QueryState";
import { ImpactAnalysisResult } from "./impactquery.types";

const SET_IMPACT_QUERY_STATE = "SET_IMPACT_ANALYSIS_QUERY_STATE";
const RESET_IMPACT_QUERY_STATE = "RESET_IMPACT_ANALYSIS_QUERY_STATE";

export const ImpactAnalysisResultInitialState: AsyncApiState<ImpactAnalysisResult> = {
    result: null,
    preliminary: null,
    failed: false
}

export const ImpactAnalysisResultQueryReduce = QueryReducer(ImpactAnalysisResultInitialState, SET_IMPACT_QUERY_STATE, RESET_IMPACT_QUERY_STATE);

export const setImpactQueryState = SetQueryState(SET_IMPACT_QUERY_STATE);
export const resetImpactQueryState = ResetQueryState(RESET_IMPACT_QUERY_STATE);
