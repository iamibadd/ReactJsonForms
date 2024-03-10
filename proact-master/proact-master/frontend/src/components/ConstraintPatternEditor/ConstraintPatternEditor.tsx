import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import cytoscape from 'cytoscape';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogContentText, DialogActions } from '@mui/material';
import { ConstraintGraph } from "../../components/ConstraintGraphEditor/ConstraintGraphEditor";
import { v4 as uuidv4 } from "uuid";
import Autocomplete from '@mui/material/Autocomplete';
import { graphLanguageStyle } from "../../utils";
import { Tab, Tabs } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import "../ConstraintGraphEditor/ConstraintGraphEditor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleMinus, faCircleXmark, faPlus, faTimes, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";


interface DeletableTabProps {
    label: string;
    onDelete: () => void;
}

const DeletableTab: React.FC<DeletableTabProps> = ({ label, onDelete }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {label}
            <div onClick={onDelete} style={{ cursor: 'pointer', marginLeft: '4px' }}>
                <CloseIcon fontSize="small" />
            </div>
        </div>
    );
};

interface ConstraintPatternEditorProps {
    onConstraintPatternReady: (pattern: ConstraintPattern) => void;
    onConstraintPatternUpdate: (patterns: ConstraintPattern[]) => void;
    constraintGraphs: ConstraintGraph[];
    constraintPatterns: ConstraintPattern[];
}

export interface ConstraintPattern {
    id: string;
    name: string;
    cytoscapeGraph: object;
}

const ConstraintPatternEditor: React.FC<ConstraintPatternEditorProps> = ({ onConstraintPatternReady, onConstraintPatternUpdate, constraintGraphs, constraintPatterns }) => {
    const cyRef = useRef<cytoscape.Core | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
    const [dialogOpen, setConstraintDialogOpen] = useState(false);
    const [nodeLabel, setNodeLabel] = useState('');
    const [relationLabel, setRelationLabel] = useState('');
    const [relationDialogOpen, setRelationDialogOpen] = useState(false);
    const [graphName, setGraphName] = useState<string>("");
    const [graphNameDialog, setGraphNameDialog] = useState(false);
    const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
    const constraintPatternsRef = useRef(constraintPatterns);
    const [initialRender, setinitialRender] = useState(false);
    const [helpDialogOpen, setHelpDialogOpen] = useState(false);

    const availableConstraints = constraintGraphs.map((graph) => graph.name);

    useEffect(() => {
        constraintPatternsRef.current = constraintPatterns;
        if (constraintPatterns.length > 0) {
            setinitialRender(true);
        }
    }, [constraintPatterns]);

    useEffect(() => {
        if (initialRender) {
            cyRef.current?.json(constraintPatterns[currentTabIndex].cytoscapeGraph);
        }

    }, [initialRender]);


    useEffect(() => {
        if (containerRef.current) {
            cyRef.current = cytoscape({
                container: containerRef.current,
                elements: [],
                style: graphLanguageStyle,
                layout: {
                    name: 'grid',
                },
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

            cyRef.current.on("add", "node", () => {
                saveCurrentGraphState();
            });

            cyRef.current.on("position", "node", () => {
                saveCurrentGraphState();
            });

            cyRef.current.on("add", "edge", () => {
                saveCurrentGraphState();
            });

            cyRef.current.on("remove", "edge", () => {
                saveCurrentGraphState();
            });

            cyRef.current.on("remove", "node", () => {
                saveCurrentGraphState();
            });
        }

        // Load the current constraint pattern
        if (constraintPatterns.length > 0 && currentTabIndex < constraintPatterns.length) {
            cyRef.current?.json(constraintPatterns[currentTabIndex].cytoscapeGraph);
        } else {
            // Clear the graph if there are no constraint patterns or the index is out of bounds
            cyRef.current?.json({ elements: [] });
        }

        return () => {
            // Save the current graph state before unmounting
            saveCurrentGraphState();
            if (cyRef.current) {
                cyRef.current.destroy();
            }
        };
    }, [currentTabIndex]);

    const handleOpenConstraintDialog = () => {
        setConstraintDialogOpen(true);
    };

    const handleCloseConstraintDialog = () => {
        setConstraintDialogOpen(false);
    };

    const handleAddConstraint = () => {
        if (!cyRef.current || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        // Add a new node with the label
        cyRef.current?.add({ group: 'nodes', data: { label: nodeLabel, type: "constraint" }, position: { x: centerX, y: centerY } });
        setNodeLabel('');
        handleCloseConstraintDialog();
    };

    const handleAddEdge = () => {
        if (selectedNodes.length === 2) {
            handleOpenRelationDialog();
        } else {
            setSelectedNodes([]);
        }
    };

    const handleOpenRelationDialog = () => {
        setRelationDialogOpen(true);
    };

    const handleCloseRelationDialog = () => {
        setRelationLabel('');
        setRelationDialogOpen(false);
    };

    const handleAddRelation = () => {
        if (cyRef.current) {
            const leftChild = cyRef.current.getElementById(selectedNodes[0]).position().x < cyRef.current.getElementById(selectedNodes[1]).position().x ? selectedNodes[0] : selectedNodes[1];
            const rightChild = leftChild === selectedNodes[0] ? selectedNodes[1] : selectedNodes[0];

            // Find positions of left and right children
            const leftPos = cyRef.current.getElementById(leftChild).position();
            const rightPos = cyRef.current.getElementById(rightChild).position();

            if (leftPos && rightPos) {
                // Calculate the position for the new root node
                const newNodePosition = {
                    x: (leftPos.x + rightPos.x) / 2,
                    y: Math.min(leftPos.y, rightPos.y) - 100,
                };

                // Create a new root node
                const newRelationId = uuidv4();
                cyRef.current.add({
                    group: 'nodes',
                    data: { id: newRelationId, label: relationLabel, type: "relation" },
                    position: newNodePosition,
                });

                // Connect the new root node to the left and right children
                cyRef.current?.getElementById(leftChild).data('parentNode', newRelationId);
                cyRef.current?.getElementById(rightChild).data('parentNode', newRelationId);
                cyRef.current?.add({ group: 'edges', data: { id: uuidv4(), source: newRelationId, target: leftChild, label: "" } });
                cyRef.current?.add({ group: 'edges', data: { id: uuidv4(), source: newRelationId, target: rightChild, label: "" } });
            }
            // saveCurrentGraphState();
            setSelectedNodes([]);
            handleCloseRelationDialog();
        }
    };


    const handleRemoveSelected = () => {
        cyRef.current?.remove(cyRef.current.$(":selected"));

        // Clear the selected nodes state
        setSelectedNodes([]);

        // Update the current constraint pattern
        const updatedPatterns = constraintPatterns.map((pattern, index) => {
            if (index === currentTabIndex) {
                return { ...pattern, cytoscapeGraph: cyRef.current ? cyRef.current.json() : {} };
            }
            return pattern;
        });
        onConstraintPatternUpdate(updatedPatterns);
    };


    const handleGraphNameDialogOpen = () => {
        setGraphNameDialog(true);
    };

    const handleGraphNameDialogClose = () => {
        setGraphNameDialog(false);
    };

    const handleAddPattern = () => {
        if (graphName) {
            const newPattern: ConstraintPattern = {
                id: uuidv4(),
                name: graphName,
                cytoscapeGraph: cyRef.current ? cyRef.current.json() : {},
            };
            onConstraintPatternReady(newPattern);
            setCurrentTabIndex(constraintPatterns.length);
            setGraphName("");
            handleGraphNameDialogClose();
        }
    };


    const saveCurrentGraphState = () => {
        if (cyRef.current) {
            const updatedPatterns = constraintPatternsRef.current.map((pattern, index) => {
                if (index === currentTabIndex) {
                    return { ...pattern, cytoscapeGraph: cyRef.current ? cyRef.current.json() : {} };
                }
                return pattern;
            });
            onConstraintPatternUpdate(updatedPatterns);
        }
    };

    const handleRemovePattern = (index: number) => {
        const updatedPatterns = constraintPatterns.filter((_, patternIndex) => patternIndex !== index);
        onConstraintPatternUpdate(updatedPatterns);
    };

    const theme = useTheme();

    interface DeletableTabProps {
        label: string;
        onDelete: (event: MouseEvent) => void;
    }

    const StyledTabs = styled(Tabs)(({ theme }) => ({
        borderRadius: "15px",
        backgroundColor: theme.palette.background.paper,
        padding: "0.5rem",
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.1)",
    }));

    const DeletableTab: React.FC<DeletableTabProps> = ({ label, onDelete }) => (
        <div>
            {label}
            <FontAwesomeIcon
                icon={faTimes}
                style={{ marginLeft: '5px', cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(e);
                }}
            />
        </div>
    );

    return (
        <div>
            <div className="Alignments-Card-Title-Container">
                <h2 className="Alignments-Card-Title">
                    Constraint Pattern Editor
                </h2>
                <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="Graph-Editor-Help-Icon"
                    onClick={() => setHelpDialogOpen(true)}
                />
            </div>
            <div>
                <StyledTabs
                    theme={theme}
                    value={currentTabIndex}
                    onChange={(event, newValue) => {
                        saveCurrentGraphState();
                        setCurrentTabIndex(newValue);
                    }}
                >
                    {constraintPatterns.map((pattern, index) => (
                        <Tab
                            key={pattern.id}
                            label={<DeletableTab label={pattern.name} onDelete={() => handleRemovePattern(index)} />}
                        />
                    ))}
                    <Tab
                        label={<FontAwesomeIcon icon={faPlus} />}
                        onClick={handleGraphNameDialogOpen}
                    />
                </StyledTabs>
            </div>
            <div ref={containerRef} style={{ width: '100%', height: '400px' }}></div>
            <div className={'Graph-Editor-ButtonGroup'}>
                <div className={'Graph-Editor-Button'}
                    onClick={handleOpenConstraintDialog}
                    title={"Export alignment data as json file."}>
                    <FontAwesomeIcon icon={faCirclePlus} className="Graph-Editor-Button-Icon" />
                    Add Constraint
                </div>
                <div className={`Graph-Editor-Button ${!(selectedNodes.length === 2) ? 'Graph-Editor-Button-Disabled' : ''}`}
                    onClick={(selectedNodes.length === 2) ? handleAddEdge : undefined}
                    title={"Export alignment data as json file."}>
                    <FontAwesomeIcon
                        icon={faCircleXmark}
                        className={`Graph-Editor-Button-Icon ${!(selectedNodes.length === 2) ? 'Graph-Editor-Button-Icon-Disabled' : ''}`}
                    />
                    Add Relation
                </div>

                <div className={'Graph-Editor-Button'}
                    onClick={handleRemoveSelected}
                    title={"Export alignment data as json file."}>
                    <FontAwesomeIcon icon={faCircleMinus} className="Graph-Editor-Button-Icon" />
                    Remove
                </div>

            </div>
            <Dialog open={dialogOpen} onClose={handleCloseConstraintDialog}>
                <DialogTitle>Add Constraint Node</DialogTitle>
                <DialogContent>
                    <Autocomplete fullWidth
                        options={availableConstraints}
                        renderInput={(params) => (
                            <TextField {...params} label="Select Constraint" fullWidth />
                        )}
                        onChange={(event, value) => {
                            if (value !== null) {
                                setNodeLabel(value);
                            }
                        }
                        }
                    />
                    <Button onClick={handleAddConstraint}>Add</Button>
                    <Button onClick={handleCloseConstraintDialog}>Close</Button>
                </DialogContent>
            </Dialog>
            <Dialog open={relationDialogOpen} onClose={handleCloseRelationDialog}>
                <DialogTitle>Add Relation Node</DialogTitle>
                <DialogContent>
                    <Autocomplete fullWidth
                        options={["before", "equal", "overlaps", "during"]}
                        renderInput={(params) => <TextField {...params} label="Select Relation" fullWidth />}
                        onChange={(event, value) => {
                            if (value !== null) {
                                setRelationLabel(value);
                            }
                        }}
                    />
                    <Button onClick={handleAddRelation}>Add</Button>
                    <Button onClick={handleCloseRelationDialog}>Close</Button>
                </DialogContent>
            </Dialog>
            <Dialog open={graphNameDialog} onClose={handleGraphNameDialogClose}>
                <DialogTitle>Name Constraint Pattern</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Constraint Pattern Name"
                        type="text"
                        fullWidth
                        value={graphName}
                        onChange={(e) => setGraphName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleGraphNameDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddPattern} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)}>
                <DialogTitle>Constraint Pattern Editor Help</DialogTitle>
                <DialogContent>
                    <ul>
                        <li>
                            The constraint pattern editor supports multiple constraint patterns through tabs. You can add a new tab by clicking the <strong>"+"</strong> button located at the end of the tabs. To remove an existing tab, click the <strong>"x"</strong> icon on the tab you wish to remove.
                        </li>
                        <li>
                            The <strong>Add Constraint</strong> button allows you to add constraint nodes to the constraint pattern editor. Click the button to open a dialog, where you can select a constraint from the available options.
                        </li>
                        <li>
                            The <strong>Add Relation</strong> button allows you to add relation nodes to the constraint pattern editor. Click the button to open a dialog, where you can choose the relation type (before, equal, overlaps, or during). This button is <strong>enabled</strong> when exactly two constraint nodes are selected.
                        </li>
                        <li>
                            The <strong>Remove</strong> button allows you to remove nodes and edges from the constraint pattern editor. Click the button to remove the selected nodes and edges.
                        </li>
                    </ul>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default ConstraintPatternEditor;
