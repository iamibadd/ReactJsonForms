import { SET_CONSTRAINT_INSTANCES } from "./constraintInstances.types";
import { MonitoringResults } from "../MonitoringQuery/monitoringquery.types";

export const setConstraintInstances = (constraintInstances: MonitoringResults) => (dispatch: Function) => {
    return dispatch({
        type: SET_CONSTRAINT_INSTANCES,
        payload: constraintInstances
    });
}
