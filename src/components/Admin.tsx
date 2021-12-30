import React, {useEffect, useState, useCallback} from "react";
import {
    Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button,
    TextField, Grid, Switch
} from "@material-ui/core";
import {JsonForms} from '@jsonforms/react';
import {materialCells, materialRenderers,} from '@jsonforms/material-renderers';
import schema from '../schemas/schema.json';
import axios from "axios";
import {Alert, ButtonGroup} from "@mui/material";
import SideBar from "./Sidebar";
import DialogueBox from "./DialogueBox";
import DataTable from "./DataTable";

const backendApi = process.env.REACT_APP_BACKEND_API;

const Admin = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [separator, setSeparator] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [schemas, setSchemas] = useState<any[]>([]);
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
        (async () => {
            try {
                const url = `${backendApi}/api/admin/all`;
                const data = (await axios.get(url)).data;
                setSchemas(data);
            } catch (e: any) {
                setError(e.response.data);
            }
        })();
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
            setSuccess(!edit ? 'Form submitted successfully!' : 'Form updated successfully!');
            setToggle('Schemas');
        } catch (e: any) {
            setSuccess('');
            setError(e.response.data.message);
        }
    }
    const onChange = async (id: number, isActive: boolean) => {
        try {
            const data = {id, isActive: !isActive};
            const url = `${backendApi}/api/admin/edit`;
            (await axios.put(url, data));
            setError('');
            setSuccess(isActive ? 'Schema deactivated!' : 'Schema activated!');
        } catch (e: any) {
            setSuccess('');
            setError(e.response.data.message);
        }
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
    }
    const returnToDashboard = (stage: string) => {
        setSchemaAndUi(schema);
        setName('');
        setDescription('');
        setSeparator('');
        setEdit(false);
        setToggle(stage);
    }
    return (
        <>
            <SideBar setToggle={setToggle} links={['SCHEMAS', 'DATA']} returnToDashboard={returnToDashboard}/>
            {toggle === 'Schemas' ?
                <Container maxWidth={'md'}>
                    <br/>
                    <Grid container={true} justifyContent={'center'}>
                        <Grid item={true} lg={12} sm={10} xs={8}>
                            {success ? <Alert severity="success" style={{marginTop: 5, marginBottom: 10}}
                                              onClose={() => setSuccess('')}>{success}</Alert> : null}
                            {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                            {!schemas.length ?
                                <Typography variant={'h6'} color={'secondary'} style={{textAlign: "center"}}>
                                    No schemas available!</Typography> : null
                            }
                            {confirm ? <DialogueBox setConfirm={setConfirm} schemaName={schemaName}
                                                    schemaId={schemaId} deleteSchema={deleteSchema}/> : null}
                            <Button size={'small'} variant={'contained'}
                                    style={{background: '#FFA500', color: '#FFFFFF', float: 'right', marginBottom: 10}}
                                    onClick={() => returnToDashboard('Create')}
                            >Create Schema</Button>
                            <TableContainer component={Paper} style={{marginTop: 10}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell style={{fontWeight: 'bold'}}>#</TableCell>
                                            <TableCell align="center" style={{fontWeight: 'bold'}}>Name</TableCell>
                                            <TableCell align="center"
                                                       style={{fontWeight: 'bold'}}>Description</TableCell>
                                            <TableCell align="center" style={{fontWeight: 'bold'}}>Separator</TableCell>
                                            <TableCell align="center" style={{fontWeight: 'bold'}}>Active</TableCell>
                                            <TableCell align="center" style={{fontWeight: 'bold'}}>Created
                                                At</TableCell>
                                            <TableCell align="center" style={{fontWeight: 'bold'}}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {schemas.length ? schemas.map((schema, index) => (
                                            //@ts-ignore
                                            <TableRow
                                                key={index + 1}
                                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {schemas.length ? index + 1 : null}
                                                </TableCell>
                                                <TableCell align="center">{schema.name}</TableCell>
                                                <TableCell align="center">{schema.description}</TableCell>
                                                <TableCell align="center">{schema.separator}</TableCell>
                                                <TableCell align="center"><Switch
                                                    checked={schema.isActive} size={'small'} color={'primary'}
                                                    onChange={() => onChange(schema.id, schema.isActive)}
                                                /></TableCell>
                                                <TableCell
                                                    align="center">{schema.createdAt.replace(/([a-zA-Z ])/g, " ").split('.')[0]}</TableCell>
                                                <TableCell align="center">
                                                    <ButtonGroup>
                                                        <Button size={'small'}
                                                                onClick={() => onEdit(schema)}>Edit</Button>
                                                        <Button size={'small'} color={'secondary'}
                                                                onClick={() => {
                                                                    setSchemaId(schema.id);
                                                                    setSchemaName(schema.name);
                                                                    setConfirm(true);
                                                                }}>Delete</Button>
                                                    </ButtonGroup>
                                                </TableCell>
                                            </TableRow>
                                        )) : null}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Container> : toggle === 'Create' ? <Container maxWidth={'md'}>
                    {edit ? <Typography variant={'h4'} color={'primary'} style={{textAlign: 'center'}}>Edit
                        Schema</Typography> : null}
                    <br/>
                    {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                    <Grid container spacing={3} justifyContent={'center'}>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label="Name" variant="outlined" size={'small'} fullWidth={true} value={name}
                                       onChange={e => setName(e.target.value)}/>
                        </Grid>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label="Description" multiline variant="outlined" size={'small'} fullWidth={true}
                                       value={description} onChange={e => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item lg={4} sm={3} xs={8}>
                            <TextField label="Separator" variant="outlined" size={'small'}
                                       fullWidth={true} value={separator} inputProps={{maxLength: 1}}
                                       onChange={e => setSeparator(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Grid container justifyContent={'center'} spacing={6}>
                        <Grid item xl={6} lg={6} md={8} sm={8} xs={8}>
                            <Typography variant={'h5'} color={'textPrimary'}>Schema Editor</Typography>
                            <TextField
                                label="Schema Editor"
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
                            <Typography variant={'h5'} color={'textPrimary'}>Preview</Typography>
                            <JsonForms
                                schema={schemaData}
                                // @ts-ignore
                                uischema={uiSchemaData}
                                renderers={materialRenderers}
                                cells={materialCells}
                                data={schemaData}/>
                            <Grid container={true} style={{flexDirection: 'row', justifyContent: 'end'}}>
                                <Grid item lg={2} sm={2} xs={4}>
                                    <Button variant={'contained'}
                                            style={{backgroundColor: 'green', color: 'white', marginLeft: -5}}
                                            size={'small'} onClick={onSubmit}>{edit ? 'Update' : 'Save'}</Button>
                                </Grid>
                                <Grid item lg={2} sm={2} xs={4}>
                                    <Button variant={'contained'}
                                            style={{backgroundColor: 'red', color: 'white'}}
                                            size={'small'} onClick={() => setToggle('Schemas')}>Cancel</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container> : toggle === 'Users' ? <DataTable/>
                    : null
            }
        </>
    );
}

export default Admin;
