import React, {useEffect, useState, useCallback} from "react";
import {Container, Typography, Button, TextField, Grid} from "@material-ui/core";
import {JsonForms} from '@jsonforms/react';
import {materialCells, materialRenderers,} from '@jsonforms/material-renderers';
import schema from '../schemas/schema.json';
import axios from "axios";
import {Alert} from "@mui/material";
import SideBar from "./Sidebar";
import DialogueBox from "./DialogueBox";
import DataTable from "./DataTable";
import {useTranslation} from 'react-i18next';

const backendApi = process.env.REACT_APP_BACKEND_API;

const Admin = () => {
    const {t} = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [separator, setSeparator] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [schemaData, setSchemaData] = useState(schema);
    const [uiSchemaData, setUiSchemaData] = useState({});
    const [schemaObj, setSchemaObj] = useState({});
    const [toggle, setToggle] = useState('Dashboard');
    const [edit, setEdit] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [schemaId, setSchemaId] = useState(0);
    const [schemaName, setSchemaName] = useState('');
    const setSchemaAndUi = useCallback((schema: any) => {
        setSchemaData(schema);
        const elements = makeUiSchema(schema.properties);
        const uiSchema = {type: "VerticalLayout", elements};
        setUiSchemaData(uiSchema);
    }, []);
    useEffect(() => {
        setSchemaAndUi(Object.keys(schemaObj).length ? schemaObj : schema);
    }, [schemaObj, success, setSchemaAndUi]);
    const makeUiSchema = (properties: any) => {
        let elements = [];
        let innerElements = {type: "", elements: []};
        for (const key in properties) {
            if (innerElements.elements && (innerElements.elements.length <= 0 || innerElements.elements.length === 2)) {
                // @ts-ignore
                innerElements = {
                    type: "HorizontalLayout",
                    elements: [
                        {
                            // @ts-ignore
                            type: "Control",
                            // @ts-ignore
                            scope: `#/properties/${key}`,
                            // @ts-ignore
                            ...(properties[key].enum && properties[key].enum.length && (key.toLowerCase().includes('radio') || properties[key].description.toLowerCase().includes('radio'))) && {
                                options: {
                                    format: "radio"
                                }
                            }
                        },
                    ]
                }
            } else if (innerElements.elements && innerElements.elements.length === 1) {
                innerElements.elements.push({
                    // @ts-ignore
                    type: "Control",
                    // @ts-ignore
                    scope: `#/properties/${key}`,
                    // @ts-ignore
                    ...(properties[key].enum && properties[key].enum.length && (key.toLowerCase().includes('radio') || properties[key].description.toLowerCase().includes('radio'))) && {
                        options: {
                            format: "radio"
                        }
                    }

                });
                elements.push(innerElements);
            }
        }
        if (properties && Object.keys(properties).length % 2 !== 0) {
            innerElements = {
                type: "HorizontalLayout",
                elements: [{
                    // @ts-ignore
                    type: "Control",
                    // @ts-ignore
                    scope: `#/properties/${Object.keys(properties)[Object.keys(properties).length - 1]}`,
                    // @ts-ignore
                    ...(Object.keys(properties)[Object.keys(properties).length - 1].enum && Object.keys(properties)[Object.keys(properties).length - 1].enum.length && ((Object.keys(properties).length - 1).toLowerCase().includes('radio') || Object.keys(properties)[Object.keys(properties).length - 1].description.toLowerCase().includes('radio'))) && {
                        options: {
                            format: "radio"
                        }
                    }
                }]
            }
            elements.push(innerElements);
        }
        return elements;
    }
    const onSubmit = async () => {
        try {
            if (!edit) {
                const data = {name, separator, description, schema: schemaData};
                const url = `${backendApi}/api/admin/add`;
                (await axios.post(url, data));
            } else {
                const data = {name, separator, description, schema: schemaData, id: schemaId};
                const url = `${backendApi}/api/admin/edit`;
                (await axios.put(url, data));
            }
            setError('');
            setSuccess(!edit ? 'formSubmitted' : 'formUpdated');
            setToggle('Schemas');
        } catch (e: any) {
            setSuccess('');
            setError(e.response.data.message);
        }
        await resetMessages();
    }
    const onChange = async (id: number, isActive: boolean) => {
        try {
            const data = {id, isActive: !isActive};
            const url = `${backendApi}/api/admin/edit`;
            (await axios.put(url, data));
            setError('');
            setSuccess(`${t('schema')}#${id} ${isActive ? t('deactivated') : t('activated')}!`);
        } catch (e: any) {
            setSuccess('');
            setError(e.response.data.message);
        }
        // await resetMessages();
    }
    const onEdit = (schema: any) => {
        setSchemaAndUi(schema.schema);
        setSchemaId(schema.id);
        setName(schema.name);
        setDescription(schema.description);
        setSeparator(schema.separator);
        setEdit(true);
        setToggle('Create');
    }
    const onDelete = (schema: any) => {
        setSchemaId(schema.id);
        setSchemaName(schema.name);
        setConfirm(true);
    }
    const deleteSchema = async (id: Number) => {
        try {
            const url = `${backendApi}/api/admin/delete?id=${id}`;
            (await axios.delete(url));
            setError('');
            setSuccess('Schema deleted successfully!');
        } catch (e: any) {
            setSuccess('');
            setError(e.response.data.message);
        }
        await resetMessages();
    }
    const returnToDashboard = (stage: string) => {
        setSchemaAndUi(schema);
        setName('');
        setDescription('');
        setSeparator('');
        setEdit(false);
        setToggle(stage);
    }
    const resetMessages = async () => {
        await setTimeout(() => {
            setSuccess('');
            setError('');
        }, 1500);
    }
    return (
        <>
            <SideBar isAdmin={true} setToggle={setToggle} links={['schemas', 'data']}
                     returnToDashboard={returnToDashboard}/>
            {toggle === 'Schemas' ?
                <>
                    <Container maxWidth={'md'}>
                        <br/>
                        <Grid container={true} justifyContent={'center'}>
                            <Grid item={true} lg={12} sm={10} xs={8}>
                                {success ? <Alert severity="success" style={{marginTop: 5, marginBottom: 10}}
                                                  onClose={() => setSuccess('')}>{t(success)}</Alert> : null}
                                {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                                {confirm ? <DialogueBox setConfirm={setConfirm} schemaName={schemaName}
                                                        schemaId={schemaId} deleteSchema={deleteSchema}/> : null}
                                <Button size={'small'} variant={'contained'}
                                        style={{
                                            background: '#FFA500',
                                            color: '#FFFFFF',
                                            float: 'right',
                                            marginBottom: 10
                                        }}
                                        onClick={() => returnToDashboard('Create')}
                                >{t('createSchema')}</Button>
                            </Grid>
                        </Grid>
                    </Container>
                    <DataTable user={'Admin'} success={success} onChange={onChange} onDelete={onDelete}
                               onEdit={onEdit}/>
                </>
                : toggle === 'Create' ? <Container maxWidth={'md'}>
                    {edit ? <Typography variant={'h4'} color={'primary'}
                                        style={{textAlign: 'center'}}>{t('editSchema')}</Typography> : null}
                    <br/>
                    {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                    <Grid container spacing={3} justifyContent={'center'}>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label={t('name')} variant="outlined" size={'small'} fullWidth={true} value={name}
                                       onChange={e => setName(e.target.value)}/>
                        </Grid>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label={t('description')} multiline variant="outlined" size={'small'}
                                       fullWidth={true}
                                       value={description} onChange={e => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label={t('separator')} variant="outlined" size={'small'}
                                       fullWidth={true} value={separator} inputProps={{maxLength: 1}}
                                       onChange={e => setSeparator(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Grid container justifyContent={'center'} spacing={6}>
                        <Grid item xl={6} lg={6} md={8} sm={8} xs={8}>
                            <Typography variant={'h5'} color={'textPrimary'}>{t('schemaEditor')}</Typography>
                            <TextField
                                label={t('schemaEditor')}
                                variant="filled"
                                multiline={true}
                                rows={25}
                                size={'small'}
                                fullWidth={true}
                                defaultValue={JSON.stringify(schemaData, null, 1)}
                                color={'primary'}
                                onChange={e => setSchemaObj(JSON.parse(e.target.value))}
                            />
                        </Grid>
                        <Grid item xl={6} lg={6} md={8} sm={8} xs={8}>
                            <Typography variant={'h5'} color={'textPrimary'}>{t('preview')}</Typography>
                            <JsonForms
                                schema={schemaData}
                                // @ts-ignore
                                uischema={uiSchemaData}
                                renderers={materialRenderers}
                                cells={materialCells}
                                data={schemaData}/>
                            <Grid container={true} style={{flexDirection: 'row', justifyContent: 'end'}}>
                                <Grid item lg={4} sm={3} xs={3}>
                                    <Button variant={'contained'}
                                            style={{backgroundColor: 'green', color: 'white', width: 120}}
                                            size={'small'} onClick={onSubmit}>{t(edit ? 'update' : 'save')}</Button>
                                </Grid>
                                <Grid item lg={3} sm={3} xs={3}>
                                    <Button variant={'contained'}
                                            style={{backgroundColor: 'red', color: 'white', width: 120}}
                                            size={'small'} onClick={() => setToggle('Schemas')}>{t('cancel')}</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container> : toggle === 'Users' ? <DataTable user={'Users'}/>
                    : null
            }
        </>
    );
}

export default Admin;
