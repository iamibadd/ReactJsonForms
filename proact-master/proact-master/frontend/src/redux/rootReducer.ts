import { combineReducers } from "redux";
import discoveredDFMReducer from "./DiscoveredDFM/discoveredDFM.reducer";
import eventLogsReducer from "./EventLogs/eventLogs.reducer";
import startAutoSavingReducer from "./StartAutoSaving/startAutoSaving.reducer";
import sessionStateReducer from "./UserSession/userSession.reducer";
import constraintInstancesReducer from "./ConstraintInstances/constraintInstances.reducer";

const rootReducer = combineReducers({
    session: sessionStateReducer,
    listOfEventLogs: eventLogsReducer,
    // startAutosaving: startAutoSavingReducer,
    discoveredDFM: discoveredDFMReducer,
    constraintInstances: constraintInstancesReducer
})

export default rootReducer
