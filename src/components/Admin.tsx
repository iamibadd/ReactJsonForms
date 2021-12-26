import React, {useEffect, useState} from "react";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
} from "@material-ui/core";
import {JsonForms} from '@jsonforms/react';
import {materialCells, materialRenderers,} from '@jsonforms/material-renderers';
import schema from '../schemas/schema.json';
import axios from "axios";
import {Alert} from "@mui/material";
import Navbar from "./Navbar";
const backendApi = process.env.REACT_APP_BACKEND_API;

const Admin = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [separator, setSeparator] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [schemas, setSchemas] = useState([{name: "", description: "", separator: "", createdAt: ""}]);
    const [schemaData, setSchemaData] = useState(schema);
    const [uiSchemaData, setUiSchemaData] = useState({});
    const [schemaObj, setSchemaObj] = useState({});
    const [toggle, setToggle] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                const url = `${backendApi}/api/admin/all`;
                const data = (await axios.get(url)).data;
                if (data.length) {
                    setSchemas(data);
                }
            } catch (e: any) {
                setError(e.response.data);
            }
        })();
        const object = Object.keys(schemaObj).length ? schemaObj : schema;
        // @ts-ignore
        setSchemaData(object);
        // @ts-ignore
        const elements = makeUiSchema(object.properties);
        const uiSchema = {type: "VerticalLayout", elements};
        setUiSchemaData(uiSchema);
    }, [schemaObj, success]);
    // @ts-ignore
    const makeUiSchema = properties => {
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
        const data = {name, separator, description, schema: schemaData};
        try {
            const url = `${backendApi}/api/admin/add`;
            (await axios.post(url, data));
            setError('');
            setSuccess(true);
        } catch (e: any) {
            setSuccess(false);
            setError(e.response.data.message);
        }
    }
    return (
        <>
            <Navbar links={['Dashboard']} setToggle={setToggle}/>
            {!toggle ?
                <Container maxWidth={'md'}>
                    {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                    {schemas[0].name === "" ?
                        <Typography variant={'h6'} color={'secondary'} style={{textAlign: "center"}}>
                            No schemas available!</Typography> : null
                    }
                    <Button style={{
                        color: 'white', float: 'right', backgroundColor: `#FFA500`, marginTop: 5, marginBottom: 10, display: 'block'
                    }} onClick={() => setToggle(!toggle)}
                    >Create Schema</Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell align="right">Name</TableCell>
                                    <TableCell align="right">Description</TableCell>
                                    <TableCell align="right">Separator</TableCell>
                                    <TableCell align="right">Created At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schemas.map((schema, index) => (
                                    //@ts-ignore
                                    <TableRow
                                        key={index + 1}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell component="th" scope="row">
                                            {schemas[0].name !== "" ? index + 1 : null}
                                        </TableCell>
                                        <TableCell align="right">{schema.name}</TableCell>
                                        <TableCell align="right">{schema.description}</TableCell>
                                        <TableCell align="right">{schema.separator}</TableCell>
                                        <TableCell
                                            align="right">{schema.createdAt.replace(/([a-zA-Z ])/g, " ").split('.')[0]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container> :
                <Container>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                            <TextField label="Name" variant="outlined" size={'small'} fullWidth={true}
                                       onChange={e => setName(e.target.value)}/>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Description" variant="outlined" size={'small'} fullWidth={true}
                                       onChange={e => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Separator" variant="outlined" size={'small'} fullWidth={true}
                                       inputProps={{maxLength: 1}} onChange={e => setSeparator(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    {success ? <Alert severity="success" onClose={() => setSuccess(false)}>Form submitted
                        successfully!</Alert> : null}
                    {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant={'h5'} color={'textPrimary'}>Schema Editor</Typography>
                            <TextField
                                label="Schema Editor"
                                variant="filled"
                                multiline
                                rows={25}
                                fullWidth={true}
                                defaultValue={JSON.stringify(schemaData, null, 5)}
                                color={'primary'}
                                onChange={e => setSchemaObj(JSON.parse(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant={'h5'} color={'textPrimary'}>Preview</Typography>
                            <JsonForms
                                schema={schemaData}
                                // @ts-ignore
                                uischema={uiSchemaData}
                                renderers={materialRenderers}
                                cells={materialCells}
                                data={schemaData}/>
                            <Grid container={true} style={{flexDirection: 'row', justifyContent: 'end'}}>
                                <Grid item xs={2}>
                                    <Button variant={'contained'} style={{backgroundColor: 'green', color: 'white'}}
                                            size={'small'} onClick={async () => await onSubmit()}>Save</Button>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button variant={'contained'} style={{backgroundColor: 'red', color: 'white'}}
                                            size={'small'} onClick={() => setToggle(!toggle)}>Cancel</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            }
        </>
    );
}

export default Admin;
