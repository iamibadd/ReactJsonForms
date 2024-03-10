import { EventLogMetadata } from "../../../redux/EventLogs/eventLogs.types";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React from "react";
import { getURI } from "../../../hooks";
import getUuid from "uuid-by-string";


type DeleteModalProps = {
    selectedEventLog: EventLogMetadata | null,
    afterDelete: () => Promise<void>
    onClose: () => void
}


export const DeleteEventLogModal = (props: DeleteModalProps) => {
    const open = props.selectedEventLog !== null;

    async function onDelete() {
        if (props.selectedEventLog !== null) {
            const ocel = props.selectedEventLog.full_path;
            const uri = getURI("/logs/delete", { file_path: ocel, uuid: getUuid(ocel) });
            await fetch(uri)
                .then((response) => response.json())
                .then((result) => {
                    props.afterDelete();
                })
                .catch(err => console.log("Error in deleting ..."));
        }
    }

    async function onClearCache() {
        if (props.selectedEventLog !== null) {
            const ocel = props.selectedEventLog.full_path;
            const uri = getURI("/logs/delete_cache", { file_path: ocel, uuid: getUuid(ocel) });
            await fetch(uri)
                .then((response) => response.json())
                .then((result) => { })
                .catch(err => console.log("Error in deleting ..."));
        }
    }

    return (
        <Dialog
            open={open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {props.selectedEventLog?.dir_type === "uploaded" &&
                    <React.Fragment>
                        {"Are you sure you want to delete the OCEL?"}
                    </React.Fragment>
                }
                {props.selectedEventLog?.dir_type !== "uploaded" &&
                    <React.Fragment>
                        {"Are you sure you want to clear the cache for the OCEL?"}
                    </React.Fragment>
                }
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {props.selectedEventLog?.dir_type === "uploaded" &&
                        <p>
                            If you choose to delete the session named "{props.selectedEventLog?.name}" that you have selected, all related information such as caches, autosaves, and others will also be erased.
                        </p>
                    }
                    {props.selectedEventLog?.dir_type !== "uploaded" &&
                        <p>
                            In case you opt to erase the cache of the OCEL named "{props.selectedEventLog?.name}", all the calculations will need to be redone the next time you utilize this OCEL.
                        </p>
                    }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} autoFocus>No</Button>
                <Button onClick={() => {
                    if (props.selectedEventLog?.dir_type === "uploaded") {
                        onDelete();
                    } else {
                        onClearCache();
                    }
                    props.onClose();
                }}>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
}

