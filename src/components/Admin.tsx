import * as React from 'react';
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
import {useEffect, useState} from "react";
import schema from '../schemas/schema.json';


// @ts-ignore
function createData(name, calories, fat, carbs) {
    return {name, calories, fat, carbs};
}

const rows = [
    createData('1', 'First Schema', ',', '21/12/2021'),
    createData('2', 'Second Schema', '-', '21/12/2021'),
];

const Admin = () => {
    const [schemaData, setSchemaData] = useState(schema);
    const [uiSchemaData, setUiSchemaData] = useState({});
    const [schemaObj, setSchemaObj] = useState({});
    const [toggle, setToggle] = useState(false);
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
    useEffect(() => {
        const object = Object.keys(schemaObj).length ? schemaObj : schema;
        // @ts-ignore
        setSchemaData(object);
        // @ts-ignore
        const elements = makeUiSchema(object.properties);
        const uiSchema = {type: "VerticalLayout", elements};
        setUiSchemaData(uiSchema);
    }, [schemaObj]);

    return (
        !toggle ?
            <>
                <Container maxWidth={'md'}>
                    <Typography variant={'h4'} color={'primary'} style={{textAlign: 'center', color: '#FFA500'}}>Admin
                        Dashboard</Typography>
                    <Button variant={'contained'} color={'secondary'}
                            style={{float: 'right', backgroundColor: '#FFA500'}}
                            onClick={() => setToggle(!toggle)}>Create</Button>
                    <TableContainer component={Paper} style={{marginTop: 50}}>
                        <Table>
                            <TableHead>
                                <TableRow style={{}}>
                                    <TableCell>#</TableCell>
                                    <TableCell align="right">Name</TableCell>
                                    <TableCell align="right">Separator</TableCell>
                                    <TableCell align="right">Created At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    //@ts-ignore
                                    <TableRow
                                        key={row.name}
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.calories}</TableCell>
                                        <TableCell align="right">{row.fat}</TableCell>
                                        <TableCell align="right">{row.carbs}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </> :
            <Container>
                <Button variant={'contained'} color={'primary'} style={{float: 'right', backgroundColor: '#FFA500'}}
                        onClick={() => setToggle(!toggle)}>Back</Button>
                <Typography variant={'h4'} color={'primary'} style={{textAlign: 'center', color: '#FFA500'}}>Create
                    Schema</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField label="Name" variant="outlined" size={'small'} fullWidth={true}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Separator" variant="outlined" size={'small'} fullWidth={true}
                                   inputProps={{maxLength: 1}}
                        />
                    </Grid>

                </Grid>
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
                        <Grid container={true}>
                            <Grid item xs={2}>
                                <Button variant={'contained'} color={'primary'} size={'small'}
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(JSON.stringify(schemaData))
                                        }}>Save</Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant={'contained'} color={'secondary'} size={'small'}
                                        onClick={() => setToggle(!toggle)}>Cancel</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant={'h5'} color={'textPrimary'}>Preview</Typography>
                        <JsonForms
                            // @ts-ignore
                            schema={schemaData}
                            // @ts-ignore
                            uischema={uiSchemaData}
                            renderers={materialRenderers}
                            cells={materialCells}
                        />
                    </Grid>
                </Grid>
            </Container>
    );
}

export default Admin;
