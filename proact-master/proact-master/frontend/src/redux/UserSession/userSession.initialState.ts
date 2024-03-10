import { SessionState } from "./userSession.types";
import { v4 as uuidv4 } from "uuid";

const currentOcel = localStorage.getItem("proact-currentOcel") || "uploaded/demo_ocel.jsonocel";

const USER_SESSION_INITIAL_STATE = {
    ocel: currentOcel,
    threshold: 100.0,
    selectedObjectTypes: [],
    alreadySelectedAllObjectTypesInitially: false,
    highlightingMode: "none",
    graphHorizontal: false,
    alignmentMode: "none",
    legendPosition: "top-left",
    edgeLabelMode: {
        metric: "count",
        aggregate: "sum"
    },
    constraintGraphState: [],
    constraintPatternState: []
} as SessionState

export default USER_SESSION_INITIAL_STATE
