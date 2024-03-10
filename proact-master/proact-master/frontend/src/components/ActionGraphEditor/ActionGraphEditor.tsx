import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { ConstraintPattern } from "../../components/ConstraintPatternEditor/ConstraintPatternEditor";
import cytoscape from 'cytoscape';
import { graphLanguageStyle } from "../../utils";
import './ActionGraphEditor.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleMinus, faCircleXmark, faRotateRight, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import "../ConstraintGraphEditor/ConstraintGraphEditor.css";

interface ActionGraphEditorProps {
    constraintPatterns: ConstraintPattern[];
}

const ActionGraphEditor: React.FC<ActionGraphEditorProps> = ({ constraintPatterns }) => {
    const cyRef = useRef<cytoscape.Core | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const actionConflictCyRef = useRef<cytoscape.Core | null>(null);
    const actionConflictContainerRef = useRef<HTMLDivElement | null>(null);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [selectedActionConflictNodes, setSelectedActionConflictNodes] = useState<string[]>([]);
    const [selectedActionConflictEdge, setSelectedActionConflictEdge] = useState<string | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [nodeLabel, setNodeLabel] = useState('');
    const [duration, setDuration] = useState(0);
    const [actionGraphHelpDialogOpen, setActionGraphHelpDialogOpen] = useState(false);
    const [actionConflictHelpDialogOpen, setActionConflictHelpDialogOpen] = useState(false);
    const [selectedDurationTimeUnit, setThresholdSelectedTimeUnit] = useState<TimeUnit>('days');
    type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';

    const timeUnitsInSeconds = {
        'seconds': 1,
        'minutes': 60,
        'hours': 3600,
        'days': 86400,
        'months': 2592000, // approximation assuming 30 day months
        'years': 31536000 // approximation assuming non-leap years
    };


    type DialogType = "constraint_pattern" | "action" | "edge";

    const initializeActionGraph = () => {
        if (containerRef.current) {
            cyRef.current = cytoscape({
                container: containerRef.current,
                elements: [],
                style: graphLanguageStyle,
                selectionType: 'additive',
                layout: {
                    name: 'grid',
                },
            });

            cyRef.current.on("select", "node", (event) => {
                setSelectedNodes((prevSelectedNodes) => [
                    ...prevSelectedNodes,
                    event.target.id(),
                ]);
            });

            cyRef.current.on("unselect", "node", (event) => {
                setSelectedNodes((prevSelectedNodes) =>
                    prevSelectedNodes.filter((id) => id !== event.target.id())
                );
            });

            cyRef.current.on("select", "edge", (event) => {
                setSelectedEdge(event.target.id());
            });

            cyRef.current.on("unselect", "edge", () => {
                setSelectedEdge(null);
            });

        }
    };


    useEffect(() => {
        initializeActionGraph();
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, []);

    const initializeActionConflictGraph = () => {
        if (actionConflictContainerRef.current) {
            actionConflictCyRef.current = cytoscape({
                container: actionConflictContainerRef.current,
                elements: [],
                style: graphLanguageStyle,
                selectionType: 'additive',
                layout: {
                    name: 'grid',
                },
            });

            actionConflictCyRef.current.on("select", "node", (event) => {
                setSelectedActionConflictNodes((prevSelectedNodes) => [
                    ...prevSelectedNodes,
                    event.target.id(),
                ]);
            });

            actionConflictCyRef.current.on("unselect", "node", (event) => {
                setSelectedActionConflictNodes((prevSelectedNodes) =>
                    prevSelectedNodes.filter((id) => id !== event.target.id())
                );
            });

            actionConflictCyRef.current.on("select", "edge", (event) => {
                setSelectedActionConflictEdge(event.target.id());
            });

            actionConflictCyRef.current.on("unselect", "edge", () => {
                setSelectedActionConflictEdge(null);
            });
        }
    };

    useEffect(() => {
        initializeActionConflictGraph();
        return () => {
            if (actionConflictCyRef.current) {
                actionConflictCyRef.current.destroy();
            }
        };
    }, []);


    const openDialogs = (type: DialogType) => {
        setDialogType(type);
        setOpenDialog(true);
    };

    const closeDialogs = () => {
        setOpenDialog(false);
        setDialogType('');
    };

    const handleAddNode = (nodeName: string) => {
        if (nodeName) {
            if (!cyRef.current || !containerRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            const centerX = containerWidth / 2;
            const centerY = containerHeight / 2;
            const id = uuidv4();
            cyRef.current?.add({ group: 'nodes', data: { id, label: nodeName, type: dialogType }, position: { x: centerX, y: centerY } });
            saveActionGraphState();

            if (dialogType === 'action') {
                if (!cyRef.current || !actionConflictContainerRef.current) return;

                const actionConflictContainerWidth = actionConflictContainerRef.current.clientWidth;
                const actionConflictContainerHeight = actionConflictContainerRef.current.clientHeight;

                const actionConflicCenterX = actionConflictContainerWidth / 2;
                const actionConflicCenterY = actionConflictContainerHeight / 2;
                actionConflictCyRef.current?.add({ group: 'nodes', data: { id, label: nodeName, type: dialogType }, position: { x: actionConflicCenterX, y: actionConflicCenterY } });
                saveActionConflictGraphState();
            }
        }
        closeDialogs();
    };

    const handleAddEdge = (duration: number, selectedDurationTimeUnit: TimeUnit) => {
        if (selectedNodes.length === 2) {
            const id = uuidv4();
            const source = selectedNodes[0];
            const target = selectedNodes[1];

            const timeUnitInSeconds = timeUnitsInSeconds[selectedDurationTimeUnit];
            const durationLabel = `${duration} ${selectedDurationTimeUnit}`;
            const timeUnit = selectedDurationTimeUnit;

            cyRef.current?.add({ group: 'edges', data: { id, source, target, label: `Duration: ${durationLabel}`, duration: duration, time_scale: timeUnit, type: 'action' } });
            saveActionGraphState();
        }
        closeDialogs();
    };


    const handleRemoveElements = () => {
        // Get the selected action nodes
        const selectedActionNodes = cyRef.current
            ? cyRef.current.$('node[type="action"]:selected')
            : [];

        // Remove selected nodes and edges from the action graph editor
        cyRef.current?.remove(cyRef.current.$(":selected"));
        saveActionGraphState();
        setSelectedNodes([]);

        // Remove the corresponding nodes from the action conflict editor
        if (actionConflictCyRef.current) {
            const selectedActionNodeIds = selectedActionNodes.map((node) => node.id());
            selectedActionNodeIds.forEach((nodeId) => {
                actionConflictCyRef.current?.remove('#' + nodeId);
            });
            saveActionConflictGraphState();
            setSelectedActionConflictNodes([]);
        }
    };


    const handleRemoveActionConflictElements = () => {
        actionConflictCyRef.current?.remove(actionConflictCyRef.current.$("edge:selected"));
        saveActionConflictGraphState();
        setSelectedActionConflictNodes([]);
    };

    const handleClearActionConflict = () => {
        // Remove all edges from the action conflict editor
        actionConflictCyRef.current?.remove(actionConflictCyRef.current.$("edge"));

        // Get the action nodes from the action graph editor
        const actionNodesInActionGraph = cyRef.current
            ? cyRef.current.$('node[type="action"]')
            : [];

        // Get the action node IDs from the action graph editor
        const actionNodeIdsInActionGraph = actionNodesInActionGraph.map((node) => node.id());

        // Iterate through the action conflict editor nodes and remove the ones not present in the action graph editor
        actionConflictCyRef.current?.nodes().forEach((node) => {
            if (!actionNodeIdsInActionGraph.includes(node.id())) {
                actionConflictCyRef.current?.remove('#' + node.id());
            }
        });
        saveActionConflictGraphState();
        setSelectedActionConflictNodes([]);
    };


    const handleClearGraph = () => {
        // Destroy the current Cytoscape instances
        if (cyRef.current) {
            cyRef.current.destroy();
        }

        if (actionConflictCyRef.current) {
            actionConflictCyRef.current.destroy();
        }
        setSelectedNodes([]);
        // Reinitialize the graphs
        initializeActionGraph();
        initializeActionConflictGraph();

        // Clear the saved graph states from local storage
        saveActionGraphState();
        saveActionConflictGraphState();

        // Clear the saved graph states from local storage
        localStorage.removeItem("savedActionGraphState");
        localStorage.removeItem("savedActionConflictGraphState");
    };


    const saveActionGraphState = () => {
        const graphState = cyRef.current?.json();
        localStorage.setItem("savedActionGraphState", JSON.stringify(graphState));
    };

    const saveActionConflictGraphState = () => {
        const actionConflictGraphState = actionConflictCyRef.current?.json();
        localStorage.setItem("savedActionConflictGraphState", JSON.stringify(actionConflictGraphState));
    };


    const handleAddConflict = () => {
        if (selectedActionConflictNodes.length === 2) {
            const id = uuidv4();
            const source = selectedActionConflictNodes[0];
            const target = selectedActionConflictNodes[1];
            actionConflictCyRef.current?.add({ group: 'edges', data: { id, source, target, type: 'conflict' } });
            saveActionConflictGraphState();
        }
    };


    useEffect(() => {
        // Retrieve the saved graph state from local storage
        const savedActionGraphState = localStorage.getItem("savedActionGraphState");

        // If a saved graph state exists, load it into the Cytoscape graph
        if (savedActionGraphState) {
            cyRef.current?.json(JSON.parse(savedActionGraphState));
        }

        // Retrieve the saved actionConflictGraphState from local storage
        const savedActionConflictGraphState = localStorage.getItem("savedActionConflictGraphState");

        // If a saved actionConflictGraphState exists, load it into the Cytoscape graph
        if (savedActionConflictGraphState) {
            actionConflictCyRef.current?.json(JSON.parse(savedActionConflictGraphState));
        }

    }, []);

    return (
        <div className="editors-container">
            <div className="editor editor-action-graph">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">Action Graph Editor</h2>
                    <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="Graph-Editor-Help-Icon"
                        onClick={() => setActionGraphHelpDialogOpen(true)}
                    />
                </div>
                <div>
                    <div
                        ref={containerRef}
                        style={{
                            height: "400px",
                        }}
                    />
                    <div className={'Graph-Editor-ButtonGroup'}>
                        <div className={'Graph-Editor-Button'}
                            onClick={() => openDialogs('constraint_pattern')}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faCirclePlus} className="Graph-Editor-Button-Icon" />
                            Add Constraint Pattern
                        </div>
                        <div className={'Graph-Editor-Button'}
                            onClick={() => openDialogs('action')}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faCirclePlus} className="Graph-Editor-Button-Icon" />
                            Add Action
                        </div>
                        <div className={`Graph-Editor-Button ${!(selectedNodes.length === 2) ? 'Graph-Editor-Button-Disabled' : ''}`}
                            onClick={(selectedNodes.length === 2) ? () => openDialogs('edge') : undefined}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`Graph-Editor-Button-Icon ${!(selectedNodes.length === 2) ? 'Graph-Editor-Button-Icon-Disabled' : ''}`}
                            />
                            Add Edge
                        </div>

                        <div className={'Graph-Editor-Button'}
                            onClick={handleRemoveElements}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faCircleMinus} className="Graph-Editor-Button-Icon" />
                            Remove
                        </div>
                        <div className={'Graph-Editor-Button'}
                            onClick={handleClearGraph}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faRotateRight} className="Graph-Editor-Button-Icon" />
                            Clear
                        </div>

                    </div>
                </div>
            </div>
            <div className="editor editor-action-conflict">
                <div className="Alignments-Card-Title-Container">
                    <h2 className="Alignments-Card-Title">Action Conflict Editor</h2>
                    <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="Graph-Editor-Help-Icon"
                        onClick={() => setActionConflictHelpDialogOpen(true)}
                    />
                </div>
                <div>
                    <div
                        ref={actionConflictContainerRef}
                        style={{
                            height: "400px",
                        }}
                    />
                    <div className={'Graph-Editor-ButtonGroup'}>
                        <div className={`Graph-Editor-Button ${!(selectedActionConflictNodes.length === 2) ? 'Graph-Editor-Button-Disabled' : ''}`}
                            onClick={(selectedActionConflictNodes.length === 2) ? handleAddConflict : undefined}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon
                                icon={faCirclePlus}
                                className={`Graph-Editor-Button-Icon ${!(selectedActionConflictNodes.length === 2) ? 'Graph-Editor-Button-Icon-Disabled' : ''}`}
                            />
                            Add Conflict
                        </div>
                        <div className={'Graph-Editor-Button'}
                            onClick={handleRemoveActionConflictElements}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faCircleMinus} className="Graph-Editor-Button-Icon" />
                            Remove
                        </div>
                        <div className={'Graph-Editor-Button'}
                            onClick={handleClearActionConflict}
                            title={"Export alignment data as json file."}>
                            <FontAwesomeIcon icon={faRotateRight} className="Graph-Editor-Button-Icon" />
                            Clear
                        </div>

                    </div>
                </div>
            </div>
            <Dialog open={openDialog} onClose={closeDialogs} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    {dialogType === 'edge' ? 'Add Edge' : `Add ${dialogType === 'constraint_pattern' ? 'Constraint Pattern' : 'Action'} Node`}
                </DialogTitle>
                <DialogContent>
                    {dialogType === "constraint_pattern" ? (
                        <FormControl fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}>
                            <InputLabel htmlFor="constraint-pattern">Constraint Pattern</InputLabel>
                            <Select
                                autoFocus
                                value={nodeLabel}
                                onChange={(e) => setNodeLabel(e.target.value as string)}
                                inputProps={{
                                    name: "constraint-pattern",
                                    id: "constraint-pattern",
                                }}
                            >
                                {constraintPatterns.map((pattern) => (
                                    <MenuItem key={pattern.id} value={pattern.name}>
                                        {pattern.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : dialogType === "action" ? (
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            fullWidth
                            onChange={(e) => setNodeLabel(e.target.value)}
                        />
                    ) : (
                        <>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="duration"
                                label="Duration"
                                type="number"
                                fullWidth
                                onChange={(e) => setDuration(parseFloat(e.target.value))}
                            />
                            <FormControl fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}>
                                <InputLabel htmlFor="time-unit">Time Unit</InputLabel>
                                <Select
                                    value={selectedDurationTimeUnit}
                                    onChange={(e) => setThresholdSelectedTimeUnit(e.target.value as TimeUnit)}
                                >
                                    <MenuItem value={'seconds'}>Seconds</MenuItem>
                                    <MenuItem value={'minutes'}>Minutes</MenuItem>
                                    <MenuItem value={'hours'}>Hours</MenuItem>
                                    <MenuItem value={'days'}>Days</MenuItem>
                                    <MenuItem value={'months'}>Months</MenuItem>
                                    <MenuItem value={'years'}>Years</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialogs} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (dialogType !== 'edge') {
                                handleAddNode(nodeLabel);
                            } else {
                                handleAddEdge(duration, selectedDurationTimeUnit);
                            }
                        }}
                        color="primary"
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={actionGraphHelpDialogOpen} onClose={() => setActionGraphHelpDialogOpen(false)}>
                <DialogTitle>Constraint Pattern Editor Help</DialogTitle>
                <DialogContent>
                    <ul>
                        <li>
                            The <strong>Add Constraint Pattern</strong> button adds a constraint pattern node to the action graph editor. A dialog will open for selecting a constraint pattern from the available options.
                        </li>
                        <li>
                            The <strong>Add Action</strong> button adds an action node to the action graph editor. A dialog will open for entering a custom action name.
                        </li>
                        <li>
                            The <strong>Add Edge</strong> button adds an edge between two selected nodes in the action graph editor. A dialog will open for entering the duration of the edge.
                        </li>
                        <li>
                            The <strong>Remove</strong> button removes selected nodes and edges from the action graph editor.
                        </li>
                        <li>
                            The <strong>Clear</strong> button removes all nodes and edges from the action graph editor.
                        </li>
                    </ul>
                </DialogContent>
            </Dialog>
            <Dialog open={actionConflictHelpDialogOpen} onClose={() => setActionConflictHelpDialogOpen(false)}>
                <DialogTitle>Constraint Pattern Editor Help</DialogTitle>
                <DialogContent>
                    <ul>
                        <li>
                            The <strong>Add Conflict</strong> button adds a conflict edge between two selected action nodes in the action conflict editor.
                        </li>
                        <li>
                            The <strong>Remove</strong> button removes selected conflict edges from the action conflict editor.
                        </li>
                        <li>
                            The <strong>Clear</strong> button removes all conflict edges from the action conflict editor.
                        </li>
                    </ul>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default ActionGraphEditor;

