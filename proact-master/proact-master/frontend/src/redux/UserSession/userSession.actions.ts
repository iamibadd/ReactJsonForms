import getUuid from 'uuid-by-string'
import { getURI } from '../../hooks'
import USER_SESSION_INITIAL_STATE from './userSession.initialState'
import {
    CREATE_USER_SESSION,
    RESTORE_USER_SESSION,
    NO_CHANGE_USER_SESSION,
    UPDATE_USER_SESSION,
    SessionState,
    SET_THRESHOLD,
    SET_SELECTED_OBJECT_TYPES,
    SET_HIGHLIGHTING_MODE,
    SET_GRAPH_HORIZONTAL,
    SET_ALIGNMENT_MODE,
    SET_LEGEND_POSITION,
    SET_EDGE_LABEL_MODE, EdgeLabelMode,
    SET_CONSTRAINT_GRAPH_STATE,
    ADD_CONSTRAINT_GRAPH,
    DELETE_CONSTRAINT_GRAPH,
    SET_CONSTRAINT_PATTERN_STATE
} from './userSession.types'
import { ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Action } from "./userSession.reducer";
import { ConstraintGraph } from "../../components/ConstraintGraphEditor/ConstraintGraphEditor";
import { ConstraintPattern } from "../../components/ConstraintPatternEditor/ConstraintPatternEditor";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function logStoring(name: string) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        console.log("Storing of session " + name + " successful!");
    }, 1000)
}

export const saveUserSession = (session: SessionState) => async (dispatch: ThunkDispatch<RootState, void, Action>) => {
    const sessionName = "autosave-" + getUuid(session.ocel)
    const uri = getURI("/session/store", {})

    const sessionState = {
        base_ocel: session.ocel,
        threshold: session.threshold,
        object_types: session.selectedObjectTypes,
        highlighting_mode: session.highlightingMode,
        graph_horizontal: session.graphHorizontal,
        alignment_mode: session.alignmentMode,
        edge_label: session.edgeLabelMode,
        constraint_graph_state: session.constraintGraphState,
        constraint_pattern_state: session.constraintPatternState
    }

    await fetch(uri, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            name: sessionName,
            session: sessionState,
        })
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.status === "successful") {
                logStoring(sessionName)
                //console.log("Storing of session " + sessionName + " successful!");
            }
        })
        .catch(err => console.log("Error in uploading ..."));

    const action = {
        type: NO_CHANGE_USER_SESSION,
        payload: {}
    }

    return dispatch(action)
}

export const createUserSession = (fullOcelPath: string) => async (dispatch: Function) => {
    const action = {
        type: CREATE_USER_SESSION,
        payload: {
            ...USER_SESSION_INITIAL_STATE,
            currentSelected: fullOcelPath
        }
    }
    return dispatch(action)
}

export const modifyUserSession = (session: SessionState) => (dispatch: Function) => {
    const action = {
        type: UPDATE_USER_SESSION,
        payload: { ...session }
    }

    if ("ocel" in session) {
        localStorage.setItem("proact-currentOcel", session["ocel"]);
    }

    return dispatch(action)
}

export const restoreUserSession = (fullOcelPath: string) =>
    async (dispatch: Function) => {
        const sessionName = "autosave-" + getUuid(fullOcelPath)
        const uri = getURI("/session/restore", { name: sessionName });

        const result = await (await fetch(uri)).json();

        if (result.base_ocel) {
            return dispatch({
                type: RESTORE_USER_SESSION,
                payload: {
                    ocel: result.base_ocel,
                    threshold: result.threshold,
                    selectedObjectTypes: result.object_types,
                    // Set `alreadySelectedAllObjectTypesInitially` to true as we're in the process of restoring a session
                    // which implies an existing object type selection which we don't want to overwrite!
                    alreadySelectedAllObjectTypesInitially: true,
                    highlightingMode: result.highlighting_mode || "none",
                    graphHorizontal: result.graph_horizontal,
                    edgeLabelMode: result.performance_mode,
                    alignmentMode: result.alignment_mode,
                    constraintGraphState: result.constraint_graph_state,
                    constraintPatternState: result.constraint_pattern_state
                } as SessionState
            });
        }
        else {
            throw new Error("No session associated with this OCEL exists.");
        }
    }

export const restoreSavedUserSession = (sessionState: SessionState) =>
    async (dispatch: Function) => {
        return dispatch({
            type: RESTORE_USER_SESSION,
            payload: sessionState
        });
    }


export const setThreshold = (newThreshold: number) => (dispatch: Function) => {
    dispatch({
        type: SET_THRESHOLD,
        payload: newThreshold
    })
}

export const setSelectedObjectTypes = (selectedObjectTypes: string[]) => (dispatch: Function) => {
    dispatch({
        type: SET_SELECTED_OBJECT_TYPES,
        payload: selectedObjectTypes,
        alreadySelectedAllObjectTypesInitially: true
    });
}

export const setHighlightedMode = (mode: string) => (dispatch: Function) => {
    dispatch({
        type: SET_HIGHLIGHTING_MODE,
        payload: mode,
    });
}

export const setGraphHorizontal = (horizontal: boolean) => (dispatch: Function) => {
    dispatch({
        type: SET_GRAPH_HORIZONTAL,
        payload: horizontal,
    });
}

export const setAlignmentMode = (mode: string) => (dispatch: Function) => {
    dispatch({
        type: SET_ALIGNMENT_MODE,
        payload: mode,
    })
}

export const setLegendPosition = (position: string) => (dispatch: Function) => {
    dispatch({
        type: SET_LEGEND_POSITION,
        payload: position,
    })
}

export const setEdgeLabelMode = (mode: EdgeLabelMode) => (dispatch: Function) => {
    dispatch({
        type: SET_EDGE_LABEL_MODE,
        payload: mode,
    })
}


export const setConstraintGraphState = (graphs: ConstraintGraph[]) => (dispatch: Function) => {
    dispatch({
        type: SET_CONSTRAINT_GRAPH_STATE,
        payload: graphs,
    })
}

export const addConstraintGraph = (graph: ConstraintGraph) => (dispatch: Function) => {
    dispatch({
        type: ADD_CONSTRAINT_GRAPH,
        payload: graph,
    })
}

export const deleteConstraintGraph = (graphs: ConstraintGraph[]) => (dispatch: Function) => {
    dispatch({
        type: DELETE_CONSTRAINT_GRAPH,
        payload: graphs,
    })
}

export const setConstraintPatternState = (patterns: ConstraintPattern[]) => (dispatch: Function) => {
    dispatch({
        type: SET_CONSTRAINT_PATTERN_STATE,
        payload: patterns,
    })
}
