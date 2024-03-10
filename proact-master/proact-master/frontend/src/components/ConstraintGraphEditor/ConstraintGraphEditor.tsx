import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import cytoscape, { Core, EdgeDefinition, ElementDefinition, NodeDefinition, Stylesheet } from "cytoscape";
import { v4 as uuidv4 } from "uuid";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import { graphLanguageStyle } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleMinus, faCircleXmark, faCircleDown, faRotateRight, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import "./ConstraintGraphEditor.css";

interface ConstraintGraphEditorProps {
    onGraphReady: (graph: ConstraintGraph) => void;
    availableObjectTypes: string[];
    availableActivities: string[];
}

type NodeType = "activity" | "object";
type EdgeType = "OA" | "AA" | "AOA";

export interface Edge {
    source: string;
    target: string;
    inner?: string;
    operation: string;
    threshold: number;
    edgeType: EdgeType;
    edgeLabel: string;
    thresholdLabel: string;
}

export interface ConstraintGraph {
    id: string;
    name: string;
    timeUnit: string;
    edges: Edge[];
}

const edgeLabels: Record<EdgeType, string[]> = {
    OA: [
        "exist",
        "absent",
        "present",
        "singular",
        "multiple",
        "min-pooling",
        "max-pooling",
        "med-pooling",
        "avg-pooling",
        "min-lagging",
        "max-lagging",
        "med-lagging",
        "avg-lagging",
        "min-readiness",
        "max-readiness",
        "med-readiness",
        "avg-readiness",
        "min-object_freq",
        "max-object_freq",
        "med-object_freq",
        "avg-object_freq",
        "min-act_freq",
        "max-act_freq",
        "med-act_freq",
        "avg-act_freq",
    ],
    AA: [
        "min-flow",
        "max-flow",
        "med-flow",
        "avg-flow",
        "min-sojourn",
        "max-sojourn",
        "med-sojourn",
        "avg-sojourn",
        "min-sync",
        "max-sync",
        "med-sync",
        "avg-sync"],
    AOA: [
        "coexist",
        "exclusive",
        "choose",
        "xorChoose",
        "cause",
        "directlyCause",
        "precede",
        "block"
    ],
};

const displayEdgeLabels: Record<string, string> = {
    "exist": "Exist",
    "absent": "Absent",
    "present": "Present",
    "singular": "Singular",
    "multiple": "Multiple",
    "min-object_freq": "Minimum Object Frequency",
    "max-object_freq": "Maximum Object Frequency",
    "med-object_freq": "Median Object Frequency",
    "avg-object_freq": "Average Object Frequency",
    "min-act_freq": "Minimum Activity Frequency",
    "max-act_freq": "Maximum Activity Frequency",
    "med-act_freq": "Median Activity Frequency",
    "avg-act_freq": "Average Activity Frequency",
    "min-pooling": "Minimum Pooling Time",
    "max-pooling": "Maximum Pooling Time",
    "med-pooling": "Median Pooling Time",
    "avg-pooling": "Average Pooling Time",
    "min-lagging": "Minimum Lagging Time",
    "max-lagging": "Maximum Lagging Time",
    "med-lagging": "Median Lagging Time",
    "avg-lagging": "Average Lagging Time",
    "min-readiness": "Minimum Readiness Time",
    "max-readiness": "Maximum Readiness Time",
    "med-readiness": "Median Readiness Time",
    "avg-readiness": "Average Readiness Time",
    "min-flow": "Minimum Flow Time",
    "max-flow": "Maximum Flow Time",
    "med-flow": "Median Flow Time",
    "avg-flow": "Average Flow Time",
    "min-sojourn": "Minimum Sojourn Time",
    "max-sojourn": "Maximum Sojourn Time",
    "med-sojourn": "Median Sojourn Time",
    "avg-sojourn": "Average Sojourn Time",
    "min-sync": "Minimum Synchronization Time",
    "max-sync": "Maximum Synchronization Time",
    "med-sync": "Median Synchronization Time",
    "avg-sync": "Average Synchronization Time",
    "coexist": "Coexist",
    "exclusive": "Exclusive",
    "choose": "Choose",
    "xorChoose": "XOR Choose",
    "cause": "Cause",
    "directlyCause": "Directly Cause",
    "precede": "Precede",
    "block": "Block",
    // Add other mappings here...
};

const operations = ["=", "<", ">", "<=", ">=", "!="];


const ConstraintGraphEditor: React.FC<ConstraintGraphEditorProps> = ({ onGraphReady, availableObjectTypes, availableActivities }) => {
    const cyRef = useRef<cytoscape.Core | null>(null);
    const cyContainerRef = useRef<HTMLDivElement | null>(null);
    const [nodeType, setNodeType] = useState<NodeType>("activity");
    const [nodeName, setNodeName] = useState<string>("");
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
    const [edgeFormData, setEdgeFormData] = useState<{
        edgeType: EdgeType;
        edgeLabel: string;
        operation: string;
        threshold: number;
    }>({
        edgeType: "OA",
        edgeLabel: "",
        operation: operations[0],
        threshold: 0,
    });
    const [openNodeDialog, setOpenNodeDialog] = useState(false);
    const [openEdgeDialog, setOpenEdgeDialog] = useState(false);
    const [timeUnit, setTimeUnit] = useState<string>("hourly");
    const [customHours, setCustomHours] = useState<number | null>(null);
    const [showCustomHoursDialog, setShowCustomHoursDialog] = useState(false);
    const [graphName, setGraphName] = useState<string>("");
    const [graphNameDialog, setGraphNameDialog] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
    const [selectedThresholdTimeUnit, setThresholdSelectedTimeUnit] = useState<TimeUnit>('seconds');

    const hasTimeLabel = (edgeLabel: string) => {
        return edgeLabel && displayEdgeLabels[edgeLabel].includes("Time");
    };

    const timeUnitsInSeconds = {
        'seconds': 1,
        'minutes': 60,
        'hours': 3600,
        'days': 86400,
        'months': 2592000, // approximation assuming 30 day months
        'years': 31536000 // approximation assuming non-leap years
    };

    const handleNodeDialog = () => {
        setOpenNodeDialog(true);
        setNodeName("");
    };

    const handleEdgeDialogOpen = () => {
        if (validEdgeType) {
            setOpenEdgeDialog(true);
        } else {
            alert("Please select a valid edge type");
        }
    };

    const handleEdgeDialogClose = () => {
        setOpenEdgeDialog(false);
    };

    const handleTimeUnitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValue = event.target.value as string;
        setTimeUnit(selectedValue);
        if (selectedValue === "custom") {
            setShowCustomHoursDialog(true);
        } else {
            setCustomHours(null);
        }
    };

    const handleCustomHoursDialogClose = (customHoursValue: number | null) => {
        setShowCustomHoursDialog(false);
        if (customHoursValue !== null) {
            setCustomHours(customHoursValue);
        }
    };

    const addNode = (type: NodeType) => {
        if (!cyRef.current || !cyContainerRef.current) return;

        const containerWidth = cyContainerRef.current.clientWidth;
        const containerHeight = cyContainerRef.current.clientHeight;

        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        const id = uuidv4();
        const node: NodeDefinition = {
            data: { id, type, label: nodeName },
            position: { x: centerX, y: centerY },
        };
        cyRef.current?.add(node);
        setNodeName(""); // Clear the node name input field
    };

    const determineEdgeType = () => {
        if (selectedNodes.length === 1) {
            const selectedNode = cyRef.current?.getElementById(selectedNodes[0]);
            if (selectedNode && selectedNode.data("type") === "activity") {
                return "AA";
            }
        } else if (selectedNodes.length === 2) {
            const sourceNode = cyRef.current?.getElementById(selectedNodes[0]);
            const targetNode = cyRef.current?.getElementById(selectedNodes[1]);
            if (
                sourceNode &&
                targetNode &&
                sourceNode.data("type") === "object" &&
                targetNode.data("type") === "activity"
            ) {
                return "OA";
            }
        } else if (
            selectedNodes.length === 3 &&
            selectedNodes.every((nodeId) => {
                const sourceNode = cyRef.current?.getElementById(selectedNodes[0]);
                const middleNode = cyRef.current?.getElementById(selectedNodes[1]);
                const targetNode = cyRef.current?.getElementById(selectedNodes[2]);
                const node = cyRef.current?.getElementById(nodeId);
                // return node && node.data("type") === "activity";
                return sourceNode && middleNode && targetNode && sourceNode.data("type") === "activity" && middleNode.data("type") === "object" && targetNode.data("type") === "activity"
            })
        ) {
            return "AOA";
        }
        return null;

    };
    const validEdgeType = determineEdgeType();

    const addEdge = () => {
        if (!validEdgeType) return;

        let { threshold } = edgeFormData;
        let thresholdLabel = edgeFormData.threshold.toString();

        if (hasTimeLabel(edgeFormData.edgeLabel) && selectedThresholdTimeUnit) {
            const timeUnitInSeconds = timeUnitsInSeconds[selectedThresholdTimeUnit];
            thresholdLabel = `${threshold} ${selectedThresholdTimeUnit}`;
            threshold *= timeUnitInSeconds;
        }

        const id = uuidv4();
        if (validEdgeType === "AOA" && selectedNodes.length === 3) {
            const hyperedgeId = uuidv4();
            const edge1Id = uuidv4();
            const edge2Id = uuidv4();
            const edge3Id = uuidv4();
            cyRef.current?.add({
                group: 'nodes',
                data: {
                    id: hyperedgeId,
                    label: `Label: ${edgeFormData.edgeLabel}\n` +
                        `Operator: ${edgeFormData.operation}\n` +
                        `Threshold: ${thresholdLabel}`,
                    type: 'hyperedge-node',
                },
            });
            cyRef.current?.add([
                {
                    group: 'edges',
                    data: {
                        id: edge1Id,
                        source: selectedNodes[0],
                        target: hyperedgeId,
                        ...edgeFormData,
                        type: 'constraint-hyperedge',
                    },
                },
                {
                    group: 'edges',
                    data: {
                        id: edge2Id,
                        source: selectedNodes[1],
                        target: hyperedgeId,
                        ...edgeFormData,
                        type: 'constraint-hyperedge',
                    },
                },
                {
                    group: 'edges',
                    data: {
                        id: edge3Id,
                        source: hyperedgeId,
                        target: selectedNodes[2],
                        ...edgeFormData,
                        thresholdLabel: thresholdLabel,
                        threshold: threshold,
                        type: 'constraint-hyperedge',
                    },
                },
            ]);
        } else if (validEdgeType === "AA" && selectedNodes.length === 1) {
            const edge: EdgeDefinition = {
                data: {
                    id,
                    source: selectedNodes[0],
                    target: selectedNodes[0],
                    ...edgeFormData,
                    thresholdLabel: thresholdLabel,
                    threshold: threshold,
                    type: 'constraint-self-loop',
                },
            };
            cyRef.current?.add(edge);
        } else {
            const edge: EdgeDefinition = {
                data: {
                    id,
                    source: selectedNodes[0],
                    target: selectedNodes[1],
                    ...edgeFormData,
                    thresholdLabel: thresholdLabel,
                    type: 'constraint',
                },
            };
            cyRef.current?.add(edge);
        }
        setSelectedNodes([]);
    };

    const handleRemoveElements = () => {
        cyRef.current?.remove(cyRef.current.$(":selected"));
        setSelectedNodes([]);
    };

    const handleClearGraph = () => {
        // Destroy the current Cytoscape instances
        if (cyRef.current) {
            cyRef.current.destroy();
        }

        setSelectedNodes([]);
        // Reinitialize the graphs
        initializeConstraintGraph();

        // // Clear the saved graph states from local storage
        // saveActionGraphState();
        // saveActionConflictGraphState();

        // // Clear the saved graph states from local storage
        // localStorage.removeItem("savedActionGraphState");
        // localStorage.removeItem("savedActionConflictGraphState");
    };

    const handleEdgeFormDataChange = (
        field: keyof typeof edgeFormData,
        value: string | number
    ) => {
        setEdgeFormData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleOpenGraphNameDialog = () => {
        setGraphNameDialog(true);
    };

    const handleCloseGraphNameDialog = () => {
        setGraphNameDialog(false);
    };

    const handleSubmitGraphNameDialog = () => {
        if (graphName) {
            const edges: Edge[] = [];
            cyRef.current?.nodes().forEach((node) => {
                console.log(node)
                if (node.data('type') === 'hyperedge-node') {
                    const hyperedgeNode = node;
                    const connectedEdges = Array.from(hyperedgeNode.connectedEdges(`[type = "constraint-hyperedge"]`));

                    edges.push({
                        source: connectedEdges[0].source().data('label'),
                        inner: connectedEdges[1].source().data('label'),
                        target: connectedEdges[2].target().data('label'),
                        operation: connectedEdges[0].data('operation'),
                        threshold: connectedEdges[2].data('threshold'),
                        edgeType: connectedEdges[0].data('edgeType'),
                        edgeLabel: connectedEdges[0].data('edgeLabel'),
                        thresholdLabel: connectedEdges[0].data('threshold'),
                    });
                }
            });

            cyRef.current?.edges().forEach((edge) => {
                console.log(edge)
                if (edge.data('type') !== 'constraint-hyperedge') {
                    const edgeData: Edge = {
                        source: edge.source().data('label'),
                        target: edge.target().data('label'),
                        operation: edge.data('operation'),
                        threshold: edge.data('threshold'),
                        edgeType: edge.data('edgeType'),
                        edgeLabel: edge.data('edgeLabel'),
                        thresholdLabel: edge.data('threshold'),
                    };

                    edges.push(edgeData);
                }
            });
            console.log(edges)
            const newGraph: ConstraintGraph = {
                id: uuidv4(),
                name: graphName,
                timeUnit: timeUnit === "custom" ? `${customHours} hours` : timeUnit,
                edges: edges,
            };
            onGraphReady(newGraph);
            setGraphName("");
            handleCloseGraphNameDialog();
        }
    };

    const initializeConstraintGraph = () => {
        cyRef.current = cytoscape({
            container: document.getElementById("cy"),
            style: graphLanguageStyle,
            selectionType: 'additive'
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
    };

    useEffect(() => {
        initializeConstraintGraph();
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (validEdgeType) {
            handleEdgeFormDataChange("edgeType", validEdgeType);
        }
    }, [validEdgeType]);

    return <div>
        <div className="Alignments-Card-Title-Container">
            <h2 className="Alignments-Card-Title">
                Constraint Graph Editor
            </h2>
            <FontAwesomeIcon
                icon={faQuestionCircle}
                className="Graph-Editor-Help-Icon"
                onClick={() => setHelpDialogOpen(true)}
            />
        </div>
        <div className={'Graph-Editor-ButtonGroup'}>
            <div className={'Graph-Editor-Button'}
                onClick={handleNodeDialog}
                title={"Export alignment data as json file."}>
                <FontAwesomeIcon icon={faCirclePlus} className="Graph-Editor-Button-Icon" />
                Add Node
            </div>
            <div className={`Graph-Editor-Button ${!validEdgeType ? 'Graph-Editor-Button-Disabled' : ''}`}
                onClick={validEdgeType ? handleEdgeDialogOpen : undefined}
                title={"Export alignment data as json file."}>
                <FontAwesomeIcon
                    icon={faCircleXmark}
                    className={`Graph-Editor-Button-Icon ${!validEdgeType ? 'Graph-Editor-Button-Icon-Disabled' : ''}`}
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
        <div ref={cyContainerRef} id="cy" className="Graph-Editor-Container"></div>
        <div className="Graph-Editor-ButtonGroup">
            <div className={'Graph-Editor-Button'}
                onClick={handleOpenGraphNameDialog}
                title={"Export alignment data as json file."}>
                <FontAwesomeIcon icon={faCircleDown} style={{ color: "#000000", }} />
                Add Constraint Graph
            </div>
        </div>
        <Dialog open={openNodeDialog} onClose={() => setOpenNodeDialog(false)}>
            <DialogTitle>Add Activity/Object Node</DialogTitle>
            <DialogContent>
                <TextField fullWidth sx={{ marginTop: 2 }}
                    select
                    label="Node Type"
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as NodeType)}
                >
                    <MenuItem value="activity">Activity</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                </TextField>
                {nodeType === 'object' ? (
                    <Autocomplete sx={{ marginTop: 2 }}
                        options={availableObjectTypes}
                        renderInput={(params) => (
                            <TextField {...params} label="Object Type Name" fullWidth />
                        )}
                        onChange={(event, value) => {
                            if (value !== null) {
                                setNodeName(value);
                            }
                        }
                        }
                    />
                ) : nodeType === 'activity' ? (
                    <Autocomplete sx={{ marginTop: 2 }}
                        options={availableActivities}
                        renderInput={(params) => (
                            <TextField {...params} label="Activity Name" fullWidth />
                        )}
                        onChange={(event, value) => {
                            if (value !== null) {
                                setNodeName(value);
                            }
                        }
                        }
                    />
                ) : (
                    <TextField
                        label="Node Name"
                        fullWidth
                        onChange={(event) => {
                            // Handle the change in the node name, e.g., setState
                            setNodeName(event.target.value)
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenNodeDialog(false)}>Cancel</Button>
                <Button
                    onClick={() => {
                        addNode(nodeType);
                        setOpenNodeDialog(false);
                    }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={showCustomHoursDialog} onClose={() => handleCustomHoursDialogClose(null)}>
            <DialogTitle>Custom Hours</DialogTitle>
            <DialogContent>
                <TextField
                    label="Hours"
                    type="number"
                    onChange={(e) => setCustomHours(parseFloat(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCustomHoursDialogClose(null)}>Cancel</Button>
                <Button onClick={() => handleCustomHoursDialogClose(customHours)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openEdgeDialog} onClose={handleEdgeDialogClose}>
            <DialogTitle>Add Edge</DialogTitle>
            <DialogContent sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: "400px", // Adjust the width here
                minHeight: "250px", // Adjust the height here
            }}>
                <FormControl fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}>
                    <InputLabel htmlFor="edge-label">Label</InputLabel>
                    <Select
                        value={validEdgeType ? edgeFormData.edgeLabel : ''}
                        onChange={(e) =>
                            handleEdgeFormDataChange('edgeLabel', e.target.value)
                        }
                    >
                        {validEdgeType !== null && edgeLabels[validEdgeType].map((label) => (
                            <MenuItem key={label} value={label}>
                                {displayEdgeLabels[label]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}>
                    <InputLabel htmlFor="operation">Operation</InputLabel>
                    <Select
                        value={edgeFormData.operation}
                        onChange={(e) =>
                            handleEdgeFormDataChange('operation', e.target.value)
                        }
                        inputProps={{
                            name: 'operation',
                            id: 'operation',
                        }}
                    >
                        {operations.map((operation) => (
                            <MenuItem key={operation} value={operation}>
                                {operation}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}
                    label="Threshold"
                    type="number"
                    value={edgeFormData.threshold}
                    onChange={(e) =>
                        handleEdgeFormDataChange('threshold', parseFloat(e.target.value))
                    }
                />
                {hasTimeLabel(edgeFormData.edgeLabel) && (
                    <FormControl fullWidth sx={{ marginTop: "16px", marginBottom: "16px" }}>
                        <InputLabel htmlFor="time-unit">Time Unit</InputLabel>
                        <Select
                            value={selectedThresholdTimeUnit}
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
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleEdgeDialogClose}>Cancel</Button>
                <Button
                    onClick={() => {
                        addEdge();
                        handleEdgeDialogClose();
                    }}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={graphNameDialog} onClose={handleCloseGraphNameDialog}>
            <DialogTitle>Name Constraint Graph</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    label="Time Unit"
                    value={timeUnit}
                    fullWidth
                    onChange={handleTimeUnitChange}
                    sx={{ marginTop: 2 }}
                >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {customHours !== null && <span>{customHours} hours</span>}
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Constraint Graph Name"
                    type="text"
                    fullWidth
                    value={graphName}
                    onChange={(e) => setGraphName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseGraphNameDialog} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmitGraphNameDialog} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
            <DialogTitle>Constraint Graph Editor Help</DialogTitle>
            <DialogContent>
                <ul>
                    <li>
                        The <strong>Add Node</strong> button allows you to add activity or object nodes to the constraint graph. Click the button to open a dialog, where you can choose the type of node (Activity or Object) and select its name from the available options or enter a custom name.
                    </li>
                    <li>
                        The <strong>Add Edge</strong> button allows you to add edges to the constraint graph. Click the button to open a dialog, where you can choose the edge label, operation, and threshold.
                        It is <strong>enabled</strong> when the selected nodes meet one of the following conditions:
                        <ol>
                            <li>A single activity node is selected (<i>AA edge</i>).</li>
                            <li>An object node and an activity node are selected (<i>OA edge</i>).</li>
                            <li>Two activity nodes and one object node are selected, in the order activity-object-activity (<i>AOA edge</i>).</li>
                        </ol>
                        {/* Edges will be created based on the valid edge type determined by the selected nodes. */}
                    </li>
                    <li>
                        The <strong>Remove</strong> button allows you to remove nodes and edges from the constraint graph. Click the button to remove the selected nodes and edges.
                    </li>
                    <li>
                        The <strong>Add Constraint Graph</strong> button allows you to add the constraint graph to the database. Click the button to open a dialog, where you can enter the constraint graph name and select the time unit. The constraint graph name must be unique.
                    </li>
                </ul>
            </DialogContent>
        </Dialog>
    </div >
};


export default ConstraintGraphEditor;
