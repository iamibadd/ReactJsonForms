import React, {FC} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface IProps {
    schemaName: String;
    schemaId: Number;
    setConfirm: (action: boolean) => void;
    deleteSchema: (id: Number) => void;
}

const DialogueBox: FC<IProps> = ({schemaName, schemaId, setConfirm, deleteSchema}: IProps) => {
    return (
        <div>
            <Dialog
                open={true}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    {schemaName}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this schema?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size={'small'} onClick={() => setConfirm(false)}>Cancel</Button>
                    <Button size={'small'} color={'secondary'} sx={{color: 'red'}} onClick={() => {
                        deleteSchema(schemaId);
                        setConfirm(false);
                    }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DialogueBox;
