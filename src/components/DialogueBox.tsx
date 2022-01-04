import React, {FC} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useTranslation} from 'react-i18next';

interface IProps {
    schemaName: String;
    schemaId: Number;
    setConfirm: (action: boolean) => void;
    deleteSchema: (id: Number) => void;
}

const DialogueBox: FC<IProps> = ({schemaName, schemaId, setConfirm, deleteSchema}: IProps) => {
    const {t} = useTranslation();
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
                        {t('deleteWarning')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size={'small'} onClick={() => setConfirm(false)}>{t('cancel')}</Button>
                    <Button size={'small'} color={'secondary'} sx={{color: 'red'}} onClick={() => {
                        deleteSchema(schemaId);
                        setConfirm(false);
                    }}>{t('delete')}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DialogueBox;
