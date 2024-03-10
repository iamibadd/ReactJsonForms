import { parse } from 'papaparse';
import { RootState } from "../../redux/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AsyncApiState, useAsyncAPI, useAsyncAPITriggered } from "../../hooks";
import { setActionQueryState } from "../../redux/ActionQuery/actionquery";
import { connect } from "react-redux";
import { ProActNavbar } from "../../components/ProActNavbar/ProActNavbar";
import React, { useState, useEffect, useRef } from "react";
import '../../components/ProActNavbar/NavbarButton/NavbarButton.css';
import './ActionEngine.css';
import ConstraintPatternEditor from "../../components/ConstraintPatternEditor/ConstraintPatternEditor";
import ActionGraphEditor from "../../components/ActionGraphEditor/ActionGraphEditor";
import { setConstraintPatternState } from "../../redux/UserSession/userSession.actions";
import { setConstraintInstances } from "../../redux/ConstraintInstances/constraintInstances.actions";
import ActionInstanceChart from "../../components/ActionInstanceChart/ActionInstanceChart";
import { MonitoringResult, MonitoringResults } from "../../redux/MonitoringQuery/monitoringquery.types";
import ConstraintInstanceChart from "../../components/ConstraintInstanceChart/ConstraintInstanceChart";
import { ConstraintPattern } from "../../components/ConstraintPatternEditor/ConstraintPatternEditor";
import { ActionEngineResults } from "../../redux/ActionQuery/actionquery.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faUpload, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";
import { downloadBlob } from "../../pages/Alignments/Alignments";


type ActionEngineProps = {}

const mapStateToProps = (state: RootState, props: ActionEngineProps) => ({
    modelOcel: state.session.ocel,
    constraintGraphs: state.session.constraintGraphState,
    constraintPatterns: state.session.constraintPatternState,
    actionQueryState: state.actionQuery,
    dfmState: state.dfmQuery,
    constraintInstances: state.constraintInstances
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, _: ActionEngineProps) => ({
    setConstraintPatterns: (constraintPatterns: ConstraintPattern[]) => dispatch(setConstraintPatternState(constraintPatterns)),
    setActionQueryState: (state: AsyncApiState<ActionEngineResults>) => {
        dispatch(setActionQueryState(state));
    },
    setConstraintInstanceState: (constraintInstances: MonitoringResults) => dispatch(setConstraintInstances(constraintInstances)),
});

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = ActionEngineProps & StateProps & DispatchProps;

export const ActionEnginePage = connect<StateProps, DispatchProps, ActionEngineProps, RootState>(mapStateToProps, mapDispatchToProps)((props: Props) => {
    const [buttonClicked, setButtonClicked] = useState(false);
    const [defaultActionDate, setDefaultActionDate] = useState(new Date(2030, 0, 1));
    const [queryStateDisplay, setQueryStateDisplay] = useState<React.ReactNode | null>(null);
    const [constraintInstanceDisplay, setConstraintInstanceDisplay] = useState<React.ReactNode | null>(null);

    const onConstraintPatternReady = (newConstraintPattern: ConstraintPattern) => {
        props.setConstraintPatterns([...props.constraintPatterns, newConstraintPattern]);
    };

    const onConstraintPatternUpdate = (newConstraintPatterns: ConstraintPattern[]) => {
        props.setConstraintPatterns(newConstraintPatterns);
    };
    const cisImportRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setButtonClicked(false);
    }, [props.actionQueryState]);

    useEffect(() => {
        if (props.actionQueryState.failed) {
            setQueryStateDisplay(<div>Error: Failed to fetch monitoring results.</div>);
        } else if (props.actionQueryState.result) {
            setQueryStateDisplay(
                <div>
                    <ActionInstanceChart results={props.actionQueryState.result} />
                </div>
            );
        } else if (props.actionQueryState.preliminary) {
            setQueryStateDisplay(
                <div>
                    <h3>Preliminary Results:</h3>
                </div>
            );
        } else {
            setQueryStateDisplay(null);
        }
    }, [props.actionQueryState.result]);

    useEffect(() => {
        if (Object.keys(props.constraintInstances.results).length !== 0) {
            console.log(props.constraintInstances);
            setConstraintInstanceDisplay(
                <div>
                    <ConstraintInstanceChart results={props.constraintInstances} />
                </div>
            );
        } else {
            setConstraintInstanceDisplay(null);
        }
    }, [props.constraintInstances]);

    type ConstraintInstanceCSVRow = {
        name: string;
        start_timestamp: string;
        end_timestamp: string;
    };

    function getLatestEndDate(monitoringResults: MonitoringResults): string {
        let latestEndDate: string = '';
        Object.values(monitoringResults.results).forEach((monitoringResultArray) => {
            monitoringResultArray.forEach((monitoringResult) => {
                if (!latestEndDate || new Date(monitoringResult.end) > new Date(latestEndDate)) {
                    latestEndDate = monitoringResult.end;
                }
            });
        });
        return latestEndDate;
    }

    const parseConstraintInstanceFromCSV = (csvContent: string) => {
        parse<ConstraintInstanceCSVRow>(csvContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const constraintInstances = importConstraintInstancesFromCSV(results.data);
                const latestEndDate = getLatestEndDate(constraintInstances);
                setDefaultActionDate(new Date(latestEndDate));
                props.setConstraintInstanceState(constraintInstances);
            },
        });
    };

    const parseConstraintInstanceFromJSON = (jsonContent: string) => {
        const data = JSON.parse(jsonContent);
        const constraintInstances = importConstraintInstancesFromJSON(data);
        const latestEndDate = getLatestEndDate(constraintInstances);
        setDefaultActionDate(new Date(latestEndDate));
        props.setConstraintInstanceState(constraintInstances);
    };

    const exportJSON = () => {
        const json = JSON.stringify(props.actionQueryState.result?.results);
        const blob = new Blob([json], { type: 'application/json' })

        downloadBlob(blob, "action-instance-data-" + props.modelOcel + ".json");
    };

    const importConstraintInstancesFromCSV = (data: ConstraintInstanceCSVRow[]): MonitoringResults => {
        const results: { [key: string]: MonitoringResult[] } = {};
        data.forEach((row) => {
            const { name, start_timestamp, end_timestamp } = row;
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push({
                start: start_timestamp,
                end: end_timestamp,
                occured: true,
            });
        });
        return { results };
    };

    const importConstraintInstancesFromJSON = (data: { [key: string]: { start: string, end: string, occured: boolean }[] }): MonitoringResults => {
        const results: { [key: string]: MonitoringResult[] } = {};
        for (const key in data) {
            results[key] = data[key].map((row) => {
                return {
                    start: row.start,
                    end: row.end,
                    occured: row.occured
                };
            });
        }
        return { results };
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonContent = e.target?.result as string;
            parseConstraintInstanceFromJSON(jsonContent);
        };
        reader.readAsText(file);
    };

    const actionEngineResults = useAsyncAPITriggered<ActionEngineResults>(
        "/pm/action",
        { cis: JSON.stringify(props.constraintInstances), constraint_patterns: JSON.stringify(props.constraintPatterns), action_graph: localStorage.getItem('savedActionGraphState') ?? '', action_conflicts: localStorage.getItem('savedActionConflictGraphState') ?? '' },
        { state: props.actionQueryState, setState: props.setActionQueryState },
        buttonClicked // Pass buttonClicked as the trigger
    );


    return (<div className="DefaultLayout-Container">
        <ProActNavbar />
        <React.Fragment>
            <div className="DefaultLayout-Content Alignments-Card">
                <ConstraintPatternEditor onConstraintPatternReady={onConstraintPatternReady} onConstraintPatternUpdate={onConstraintPatternUpdate} constraintGraphs={props.constraintGraphs} constraintPatterns={props.constraintPatterns} />
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Action Graph/Conflict Editor
                    </h2>
                </div>
                <ActionGraphEditor constraintPatterns={props.constraintPatterns} />
            </div>
            <div className="DefaultLayout-Content Alignments-Card">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">
                        Action Engine
                    </h2>
                </div>
                <div className="charts-container">
                    <div className="chart chart-constraint-instance">
                        <div className="Alignments-Card-Title-Container">
                            <h2 className="Alignments-Card-Title">Constrarint Instance</h2>
                            <div className={'NavbarButton'}
                                onClick={() =>
                                    cisImportRef.current && cisImportRef.current.click()
                                }
                                title={"Export alignment data as json file."}>
                                <FontAwesomeIcon icon={faUpload} className="NavbarButton-Icon" />
                                <input
                                    ref={cisImportRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    hidden
                                />
                                Upload Constraint Instance
                            </div>
                        </div>
                        {constraintInstanceDisplay}
                    </div>
                    <div className="chart chart-action-instance">
                        <div className="Alignments-Card-Title-Container">
                            <h2 className="Alignments-Card-Title">Action Instance</h2>
                            <div className="NavbarButtonGroup">
                                <div className={'NavbarButton'}
                                    onClick={() => {
                                        setButtonClicked(true);
                                    }}
                                    title={"Export alignment data as json file."}>
                                    <FontAwesomeIcon icon={faPlay} className="NavbarButton-Icon" />
                                    Start Action Engine
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
                </div>
            </div>

        </React.Fragment >
    </div >)
});
