import { RootState } from "../../redux/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { ProActNavbar } from "../../components/ProActNavbar/ProActNavbar";
import { setDfmQueryState } from "../../redux/DFMQuery/dfmquery";
import React, { useState, useEffect, useRef } from "react";
import { parse } from 'papaparse';
import { ActionEngineResults, ActionInstance } from '../../redux/ActionQuery/actionquery.types';
import { AsyncApiState, useAsyncAPI, useAsyncAPITriggered } from "../../hooks";
import Button from "@mui/material/Button";
import ActionInstanceChart from "../../components/ActionInstanceChart/ActionInstanceChart";
import { ImpactAnalysisResult } from "../../redux/ImpactQuery/impactquery.types";
import { setImpactQueryState } from "../../redux/ImpactQuery/impactquery";
import ImpactChart from "../../components/ImpactChart/ImpactChart";
import TimelineComponent from "../../components/TimelineComponent/TimelineComponent";
import { getURI } from "../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faMagnifyingGlass, faCircleDown } from "@fortawesome/free-solid-svg-icons";
import { CytoDFMMethods, DirectlyFollowsMultigraph, SimpleCytoDFM } from '../../components/cytoscape-dfm/cytodfm';
import { NO_HIGHLIGHTING } from "../../components/cytoscape-dfm/EdgeHighlighters";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { EventLogMetadata } from "../../redux/EventLogs/eventLogs.types";
import './ImpactAnalysis.css';


type ImpactAnalysisProps = {}

const mapStateToProps = (state: RootState, props: ImpactAnalysisProps) => ({
    session: state.session,
    impactQueryState: state.impactQuery,
    currentListOfEventLogs: state.listOfEventLogs,
    dfmState: state.dfmQuery
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, _: ImpactAnalysisProps) => ({
    setImpactQueryState: (state: AsyncApiState<ImpactAnalysisResult>) => {
        dispatch(setImpactQueryState(state));
    },
    setDfmState: (state: AsyncApiState<DirectlyFollowsMultigraph>) => {
        dispatch(setDfmQueryState(state))
    }
});

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = ImpactAnalysisProps & StateProps & DispatchProps;

export const ImpactAnalysisPage = connect<StateProps, DispatchProps, ImpactAnalysisProps, RootState>(mapStateToProps, mapDispatchToProps)((props: Props) => {
    const [actionInstanceDisplay, setActionInstanceDisplay] = useState<React.ReactNode | null>(null);
    const [selectedActionInstanceDisplay, setSelectedActionInstanceDisplay] = useState<React.ReactNode | null>(null);
    const [structuralImpactDisplay, setStructuralImpactDisplay] = useState<React.ReactNode | null>(null);
    const [operationalImpactDisplay, setOperationalImpactDisplay] = useState<React.ReactNode | null>(null);
    const [performanceImpactDisplay, setPerformanceImpactDisplay] = useState<React.ReactNode | null>(null);
    const [computeImpactButtonClicked, SetComputeImpactButtonClicked] = useState(false);
    const [actionInstanceState, setActionInstanceState] = useState<ActionEngineResults>(
        () => {
            // Retrieve the state from localStorage, if available
            const storedState = localStorage.getItem('actionInstanceState');
            if (storedState) {
                return JSON.parse(storedState);
            }
            return { results: [] };
        }
    );
    const [selectedActionInstance, setSelectedActionInstance] = useState<ActionInstance | null>(
        () => {
            // Retrieve the state from localStorage, if available
            const storedState = localStorage.getItem('selectedActionInstance');
            if (storedState) {
                return JSON.parse(storedState);
            }
            return null;
        }
    );
    const [ocelTimeline, setOcelTimeline] = useState<OcelTimeline | null>(null);
    const aisImportRef = useRef<HTMLInputElement>(null);
    const dfmQuery = useAsyncAPI<DirectlyFollowsMultigraph>("/pm/dfm", { ocel: props.session.ocel },
        { state: props.dfmState, setState: props.setDfmState });
    const graphRef = useRef<CytoDFMMethods>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedActivityLabel, setSelectedActivityLabel] = useState<string>(
        () => {
            // Retrieve the state from localStorage, if available
            const storedState = localStorage.getItem('selectedActivityLabel');
            if (storedState) {
                return storedState;
            }
            return "";
        }
    );
    const [openSelectImpactOcel, setOpenSelectImpactOcel] = useState(false);
    const [selectedImpactOcel, setSelectedImpactOcel] = useState<string | null>(
        () => {
            // Retrieve the state from localStorage, if available
            const storedState = localStorage.getItem('selectedImpactOcel');
            if (storedState) {
                return JSON.parse(storedState);
            }
            return null;
        }
    );
    const [performanceAnalysisWindow, setPerformanceAnalysisWindow] = useState<{ start: Date; end: Date } | null>(null);


    type OcelTimeline = {
        start: string;
        end: string;
    };

    type ActionInstanceRecord = {
        action: string;
        start: string;
        end: string;
    };

    const parseActionInstanceFromCSV = (csvContent: string) => {
        parse<ActionInstanceRecord>(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const actionInstances = importActionInstancesFromCSV(results.data);
                setActionInstanceState(actionInstances);
            },
        });
    };

    const parseActionInstanceFromJSON = (jsonContent: string) => {
        const data = JSON.parse(jsonContent);
        const actionInstances = importActionInstancesFromJSON(data);
        console.log(actionInstances)
        setActionInstanceState(actionInstances);
    };

    const importActionInstancesFromJSON = (data: ActionInstanceRecord[]): ActionEngineResults => {
        const results: ActionInstance[] = data.map((row) => {
            const { action, start, end } = row;
            return {
                action: action,
                start: start,
                end: end,
            };
        });

        const newState = { results };
        // Save the new state to localStorage
        localStorage.setItem('actionInstanceState', JSON.stringify(newState));
        return newState;
    };

    const importActionInstancesFromCSV = (data: ActionInstanceRecord[]): ActionEngineResults => {
        const results: ActionInstance[] = data.map((row) => {
            const { action, start, end } = row;
            return {
                action: action,
                start: start,
                end: end,
            };
        });

        const newState = { results };
        // Save the new state to localStorage
        localStorage.setItem('actionInstanceState', JSON.stringify(newState));
        return newState;
    };

    const handleActionInstanceFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            parseActionInstanceFromJSON(content);
        };
        reader.readAsText(file);
    };

    const handleActionInstanceClick = (ai: ActionInstance) => {
        setSelectedActionInstance(ai);
        localStorage.setItem('selectedActionInstance', JSON.stringify(ai));
        setDialogOpen(true);
    };

    const changedActivities = ["Create Purchase Order", "Verify Material"];

    const impactAnalysisResults = useAsyncAPITriggered<ImpactAnalysisResult>(
        "/pm/impact",
        { ocel: selectedImpactOcel as string, ai: JSON.stringify(selectedActionInstance), change: JSON.stringify([selectedActivityLabel]), performance_analysis_window: JSON.stringify(performanceAnalysisWindow) },
        { state: props.impactQueryState, setState: props.setImpactQueryState },
        computeImpactButtonClicked // Pass computeImpactButtonClicked as the trigger
    );

    async function deriveImpactOcelTimeline(eventLog: string) {
        const uri: string = getURI("/logs/timeline", { file_path: eventLog });
        const data: string[] = await (await fetch(uri)).json();
        setOcelTimeline({ start: data[0], end: data[1] });
    }

    const handleSelectActivityLabel = (label: string) => {
        setSelectedActivityLabel(label);
        localStorage.setItem('selectedActivityLabel', label);
        setDialogOpen(false);
    };

    const handleSelectOcelOpen = () => {
        setOpenSelectImpactOcel(true);
    };

    const handleSelectOcelClose = () => {
        setOpenSelectImpactOcel(false);
    };

    const handleSelectOcelSelect = (ocel: EventLogMetadata) => {
        setSelectedImpactOcel(ocel.full_path);
        localStorage.setItem('selectedImpactOcel', JSON.stringify(ocel.full_path));
        setOpenSelectImpactOcel(false);
    };

    useEffect(() => {
        SetComputeImpactButtonClicked(false);
    }, [props.impactQueryState]);

    useEffect(() => {
        if (Object.keys(actionInstanceState.results).length !== 0) {
            setActionInstanceDisplay(
                <div>
                    <ActionInstanceChart results={actionInstanceState} onCellClick={handleActionInstanceClick} />
                </div>
            );
        } else {
            setActionInstanceDisplay(null);
        }
    }, [actionInstanceState]);

    useEffect(() => {
        if (selectedActionInstance) {
            setSelectedActionInstanceDisplay(
                <div className="SelectedCellInfo">
                    {actionInstanceState ? (
                        <>
                            <p>
                                We analyze the impact of <em>{selectedActionInstance.action}</em> that <strong>changes</strong> <em>{selectedActivityLabel}</em>
                                <strong> starting from</strong> <em>{new Date(selectedActionInstance.start).toLocaleString('en-DE')}</em> and
                                <strong> ending at</strong> <em>{new Date(selectedActionInstance.end).toLocaleString('en-DE')}</em>.
                            </p>
                        </>
                    ) : (
                        <p>No cell selected</p>
                    )}
                </div>
            );
        }
    }, [selectedActionInstance, selectedActivityLabel]);

    useEffect(() => {
        if (props.impactQueryState.failed) {
            setStructuralImpactDisplay(<div>Error: Failed to fetch monitoring results.</div>);
        } else if (props.impactQueryState.result) {
            setStructuralImpactDisplay(
                <div className="charts-container">
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Function-Wise Structural Impact</h3>
                        <div>
                            <ImpactChart impactQueryState={props.impactQueryState.result.results['SA']['Function']} kind='FSA' />
                        </div>
                    </div>
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Object-Wise Structural Impact</h3>
                        <div>
                            <ImpactChart impactQueryState={props.impactQueryState.result.results['SA']['Object']} kind='OSA' />
                        </div>
                    </div>
                </div>
            );
        } else if (props.impactQueryState.preliminary) {
            setStructuralImpactDisplay(
                <div>
                    <h3>Preliminary Results:</h3>
                </div>
            );
        } else {
            setStructuralImpactDisplay(null);
        }
    }, [props.impactQueryState.result]);

    useEffect(() => {
        if (props.impactQueryState.failed) {
            setOperationalImpactDisplay(<div>Error: Failed to fetch monitoring results.</div>);
        } else if (props.impactQueryState.result) {
            setOperationalImpactDisplay(
                <div className="charts-container">
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Prior Operational Impact</h3>
                        <ImpactChart impactQueryState={props.impactQueryState.result.results['OIA']} kind='OIA-Prior' />
                    </div>
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Posterior Operational Impact</h3>
                        <ImpactChart impactQueryState={props.impactQueryState.result.results['OIA']} kind='OIA-Posterior' />
                    </div>
                </div>
            );
        } else if (props.impactQueryState.preliminary) {
            setOperationalImpactDisplay(
                <div>
                    <h3>Preliminary Results:</h3>
                </div>
            );
        } else {
            setOperationalImpactDisplay(null);
        }
    }, [props.impactQueryState.result]);

    useEffect(() => {
        if (props.impactQueryState.failed) {
            setPerformanceImpactDisplay(<div>Error: Failed to fetch monitoring results.</div>);
        } else if (props.impactQueryState.result) {
            setPerformanceImpactDisplay(
                <div className="charts-container">
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Functional Performance Impact</h3>
                        <ImpactChart impactQueryState={props.impactQueryState.result.results['FPA']} kind='FPA' />
                    </div>
                    <div className="chart">
                        <h3 className="Alignments-Card-Title">Object Performance Impact</h3>
                        <ImpactChart impactQueryState={props.impactQueryState.result.results['OPA']} kind='OPA' />
                    </div>
                </div>
            );
        } else if (props.impactQueryState.preliminary) {
            setPerformanceImpactDisplay(
                <div>
                    <h3>Preliminary Results:</h3>
                </div>
            );
        } else {
            setPerformanceImpactDisplay(null);
        }
    }, [props.impactQueryState.result]);

    useEffect(() => {
        if (selectedImpactOcel) {
            deriveImpactOcelTimeline(selectedImpactOcel);
        }
    }, [selectedImpactOcel]);

    useEffect(() => {
    }, [props.currentListOfEventLogs]);




    return (<div className="DefaultLayout-Container">
        <ProActNavbar />
        <React.Fragment>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Setup
                    </h2>
                </div>
                <div className="charts-container">
                    <div className="chart chart-constraint-instance">
                        <div className="Alignments-Card-Title-Container">
                            <h2 className="Alignments-Card-Title">
                                Action Instance
                            </h2>
                            <div className={'NavbarButton'}
                                onClick={() =>
                                    aisImportRef.current && aisImportRef.current.click()
                                }
                                title={"Export alignment data as json file."}>
                                <FontAwesomeIcon icon={faUpload} className="NavbarButton-Icon" />
                                <input
                                    ref={aisImportRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".json"
                                    onChange={handleActionInstanceFileUpload}
                                    hidden
                                />
                                Upload Action Instance
                            </div>
                        </div>
                        {actionInstanceDisplay}
                    </div>
                    {selectedActionInstanceDisplay}
                    <div className="chart chart-action-instance">
                        <div className="Alignments-Card-Title-Container">
                            <h2 className="Alignments-Card-Title">
                                Timeline
                            </h2>
                            <div className={'NavbarButton'}
                                onClick={handleSelectOcelOpen}
                                title={"Export alignment data as json file."}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="NavbarButton-Icon" />
                                Select OCEL
                            </div>
                        </div>
                        <TimelineComponent
                            selectedActionInstance={selectedActionInstance}
                            ocelTimeline={ocelTimeline}
                            onPerformanceAnalysisWindowChange={(start, end) => {
                                setPerformanceAnalysisWindow({ start, end });
                            }}
                        />

                    </div>
                </div>
            </div>
            <div className={'Graph-Editor-Button'}
                onClick={() => SetComputeImpactButtonClicked(true)}
                title={"Export alignment data as json file."}>
                <FontAwesomeIcon icon={faCircleDown} style={{ color: "#000000", }} />
                Analyze
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Structural Impact
                    </h2>
                </div>
                {structuralImpactDisplay}
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Operational Impact
                    </h2>
                </div>
                {operationalImpactDisplay}
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Performance Impact
                    </h2>
                </div>
                {performanceImpactDisplay}
            </div>
        </React.Fragment >
        <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>Process Model</DialogTitle>
            <DialogContent>
                <div
                    style={{
                        width: '100%',
                        height: '80vh',
                        overflow: 'auto',
                    }}
                >
                    <SimpleCytoDFM
                        dfm={dfmQuery.result}
                        performanceMetrics={null}
                        threshold={props.session.threshold / 100}
                        selectedObjectTypes={props.session.selectedObjectTypes}
                        positionsFrozen={false}
                        highlightingMode={NO_HIGHLIGHTING}
                        graphHorizontal={props.session.graphHorizontal}
                        alignmentMode="none"
                        legendPosition={props.session.legendPosition}
                        edgeLabelMode={props.session.edgeLabelMode}
                        infoboxEnabled={false}
                        ref={graphRef}
                        onNodeSelect={handleSelectActivityLabel}
                    />
                </div>
                {!dfmQuery.result && !dfmQuery.failed && (
                    <Box
                        sx={{
                            display: 'flex',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
        <Dialog open={openSelectImpactOcel} onClose={handleSelectOcelClose}>
            <DialogTitle>Select an Ocel</DialogTitle>
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
