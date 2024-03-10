import { SET_CONSTRAINT_INSTANCES } from "./constraintInstances.types";
import { AnyAction } from "redux";
import { MonitoringResults } from "../MonitoringQuery/monitoringquery.types";

// Assuming the initial state is an empty array
export const initialConstraintInstanceState: MonitoringResults = {
    results: {}
}

const constraintInstancesReducer = (
    state = initialConstraintInstanceState,
    action: AnyAction
) => {
    switch (action.type) {
        case SET_CONSTRAINT_INSTANCES:
            return action.payload;
        default:
            return state;
    }
};

export default constraintInstancesReducer;
