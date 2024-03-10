import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React from "react";
import { getURI } from "../../hooks";

type DeleteModalProps = {
    selectedSession: string | null,
    afterDelete: () => Promise<void>
    onClose: () => void
}


export const DeleteSessionModal = (props: DeleteModalProps) => {
    const open = props.selectedSession !== null;

    async function onDelete() {
        if (props.selectedSession !== null) {
            const uri = getURI("/session/delete", { name: props.selectedSession });
            await fetch(uri)
                .then((response) => response.json())
                .then((result) => {
                    props.afterDelete();
                })
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
                {"Are you sure you want to delete the saved session?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {props.selectedSession &&
                        props.selectedSession.split("-")[0] === "autosave" &&
                        (
                            <React.Fragment>
                                <p>
                                    If you choose to remove the "{props.selectedSession}" session, the related autosave for the event log will also be eliminated. When you reload that event log, all your configurations will be lost and restored to their default state.
                                </p>
                            </React.Fragment>
                        )
                    }
                    {props.selectedSession &&
                        props.selectedSession.split("-")[0] !== "autosave" &&
                        (
                            <React.Fragment>
                                <p>
                                    Once you choose to delete the "{props.selectedSession}" session, it cannot be recovered or restored.
                                </p>
                            </React.Fragment>
                        )
                    }


                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} autoFocus>No</Button>
                <Button onClick={() => {
                    onDelete();
                    props.onClose();
                }}>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
}

