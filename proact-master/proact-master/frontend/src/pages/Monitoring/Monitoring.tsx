
import { RootState } from "../../redux/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AsyncApiState, useAsyncAPI, useAsyncAPITriggered } from "../../hooks";
import { DirectlyFollowsMultigraph } from '../../components/cytoscape-dfm/cytodfm';
import { setDfmQueryState } from "../../redux/DFMQuery/dfmquery";
import { setMonitoringQueryState } from "../../redux/MonitoringQuery/monitoringquery";
import { connect } from "react-redux";
import { ProActNavbar } from "../../components/ProActNavbar/ProActNavbar";
import React, { useState, useEffect } from "react";
import '../../components/ProActNavbar/NavbarButton/NavbarButton.css';
import './Monitoring.css';
import ConstraintGraphEditor, { ConstraintGraph, Edge } from "../../components/ConstraintGraphEditor/ConstraintGraphEditor";
import ConstraintGraphTable from "../../components/ConstraintGraphTable/ConstraintGraphTable";
import {
    setConstraintGraphState, deleteConstraintGraph
} from "../../redux/UserSession/userSession.actions";
import { MonitoringResults } from "../../redux/MonitoringQuery/monitoringquery.types";
import ConstraintInstanceChart from "../../components/ConstraintInstanceChart/ConstraintInstanceChart";
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faShareFromSquare, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { downloadBlob } from "../../pages/Alignments/Alignments";
import Button from "@mui/material/Button";
import { EventLogMetadata } from "../../redux/EventLogs/eventLogs.types";


type MonitoringProps = {}

const mapStateToProps = (state: RootState, props: MonitoringProps) => ({
    modelOcel: state.session.ocel,
    constraintGraphs: state.session.constraintGraphState,
    queryState: state.monitoringQuery,
    currentListOfEventLogs: state.listOfEventLogs,
    dfmState: state.dfmQuery
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, _: MonitoringProps) => ({
    setConstraintGraphs: (constraintGraphs: ConstraintGraph[]) => dispatch(setConstraintGraphState(constraintGraphs)),
    deleteConstraintGraphs: (constraintGraphs: ConstraintGraph[]) => dispatch(deleteConstraintGraph(constraintGraphs)),
    setQueryState: (state: AsyncApiState<MonitoringResults>) => {
        dispatch(setMonitoringQueryState(state));
    },
    setDfmState: (state: AsyncApiState<DirectlyFollowsMultigraph>) => {
        dispatch(setDfmQueryState(state))
    }
});

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = MonitoringProps & StateProps & DispatchProps;

export const MonitoringPage = connect<StateProps, DispatchProps, MonitoringProps, RootState>(mapStateToProps, mapDispatchToProps)((props: Props) => {

    const [queryStateDisplay, setQueryStateDisplay] = useState<React.ReactNode | null>(null);
    const [constraintMonitoringButtonClicked, setConstraintMonitoringconstraintMonitoringButtonClicked] = useState(false);

    const [openSelectMonitoringOcel, setOpenSelectImpactOcel] = useState(false);
    const [selectedMonitoringOcel, setSelectedMonitoringOcel] = useState<string | null>(
        () => {
            // Retrieve the state from localStorage, if available
            const storedState = localStorage.getItem('selectedMonitoringOcel');
            if (storedState) {
                return JSON.parse(storedState);
            }
            return null;
        }
    );

    const handleSelectOcelOpen = () => {
        setOpenSelectImpactOcel(true);
    };

    const handleSelectOcelClose = () => {
        setOpenSelectImpactOcel(false);
    };

    const handleSelectOcelSelect = (ocel: EventLogMetadata) => {
        setSelectedMonitoringOcel(ocel.full_path);
        localStorage.setItem('selectedMonitoringOcel', JSON.stringify(ocel.full_path));
        setOpenSelectImpactOcel(false);
    };

    useEffect(() => {
        if (props.queryState.failed) {
            setQueryStateDisplay(<div>Error: Failed to fetch monitoring results.</div>);
        } else if (props.queryState.result) {
            setQueryStateDisplay(
                <div>
                    <ConstraintInstanceChart results={props.queryState.result} />
                </div>
            );
        } else if (props.queryState.preliminary) {
            setQueryStateDisplay(
                <div>
                    <h3>Preliminary Results:</h3>
                </div>
            );
        } else {
            setQueryStateDisplay(null);
        }
    }, [props.queryState.result]);



    // We need the possible object types. Therefore, we fetch the graph from the Redux state.
    const dfmQuery = useAsyncAPI<DirectlyFollowsMultigraph>("/pm/dfm", { ocel: props.modelOcel },
        { state: props.dfmState, setState: props.setDfmState });

    const availableObjectTypes: string[] = dfmQuery.result ? Object.keys(dfmQuery.result.subgraphs) : [];
    const availableActivities: string[] = dfmQuery.result ? dfmQuery.result.nodes.map(node => node.label) : [];

    const monitoringResults = useAsyncAPITriggered<MonitoringResults>(
        "/pm/monitoring",
        { ocel: selectedMonitoringOcel as string, constraint_graphs: JSON.stringify(props.constraintGraphs) },
        { state: props.queryState, setState: props.setQueryState },
        constraintMonitoringButtonClicked // Pass constraintMonitoringButtonClicked as the trigger
    );

    useEffect(() => {
        setConstraintMonitoringconstraintMonitoringButtonClicked(false);
    }, [props.queryState]);

    useEffect(() => {
    }, [props.currentListOfEventLogs]);


    const onGraphReady = (newGraph: ConstraintGraph) => {
        props.setConstraintGraphs([...props.constraintGraphs, newGraph]);
    };

    const exportJSON = () => {
        const json = JSON.stringify(props.queryState.result?.results);
        const blob = new Blob([json], { type: 'application/json' })

        downloadBlob(blob, "constraint-instance-data-" + props.modelOcel + ".json");
    };

    return (<div className="DefaultLayout-Container">
        <ProActNavbar />
        <React.Fragment>
            <div className="DefaultLayout-Content Alignments-Card">
                <ConstraintGraphEditor onGraphReady={onGraphReady} availableObjectTypes={availableObjectTypes} availableActivities={availableActivities} />
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Constraint Graph Repository
                    </h2>
                </div>
                <ConstraintGraphTable data={props.constraintGraphs} setData={props.setConstraintGraphs} onDeleteGraph={props.deleteConstraintGraphs} />
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Constraint Monitoring
                    </h2>
                    <div className="NavbarButtonGroup">
                        <div className={'NavbarButton'}
                            onClick={handleSelectOcelOpen}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="NavbarButton-Icon" />
                            Select OCEL
                        </div>
                        <div className={'NavbarButton'}
                            onClick={() => {
                                setConstraintMonitoringconstraintMonitoringButtonClicked(true);
                            }}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faPlay} className="NavbarButton-Icon" />
                            Start Monitoring
                        </div>
                        <div className={'NavbarButton'}
                            onClick={() => exportJSON()}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faShareFromSquare} className="NavbarButton-Icon" />
                            Export
                        </div>
                    </div>
                </div>
                {queryStateDisplay}
            </div>
        </React.Fragment >
        <Dialog open={openSelectMonitoringOcel} onClose={handleSelectOcelClose}>
            <DialogTitle>Select an OCEL for constraint monitoring</DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Size</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.currentListOfEventLogs.map((ocel) => (
                            <TableRow key={ocel.id} onClick={() => handleSelectOcelSelect(ocel)} style={{ cursor: 'pointer' }}>
                                <TableCell>{ocel.name}</TableCell>
                                <TableCell>{ocel.type}</TableCell>
                                <TableCell>{ocel.size}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSelectOcelClose} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    </div >)
});
