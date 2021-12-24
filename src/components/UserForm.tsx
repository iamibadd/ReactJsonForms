import React, {FC, Fragment, useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {JsonForms} from "@jsonforms/react";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";
import {makeStyles} from "@material-ui/core/styles";
import {TextField} from "@material-ui/core";
import {Alert} from "@mui/material";
import axios from "axios";

const useStyles = makeStyles((_theme) => ({
    dataContent: {
        display: 'flex',
        justifyContent: 'center',
        borderRadius: '0.25em',
        backgroundColor: '#cecece',
        marginBottom: '1rem',
    },
    demoform: {
        margin: 'auto',
        padding: '1rem',
    },
}));


interface IProps {
    schemaName: String;
    description: String;
    separator: String;
    schema: { properties: {} };
    setSchema: (obj: any) => void;
}

const UserForm: FC<IProps> = ({schema, setSchema, schemaName, description, separator}: IProps) => {
    const classes = useStyles();
    const [displayDataAsString, setDisplayDataAsString] = useState('');
    const [jsonData, setJsonData] = useState({});
    const [uiSchema, setUiSchema] = useState({});
    const [fullName, setFullName] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        setDisplayDataAsString(JSON.stringify(jsonData, null, 2));
        //ts-ignore
        const elements = makeUiSchema(schema.properties);
        const uiSchema = {type: "VerticalLayout", elements};
        setUiSchema(uiSchema);
    }, [jsonData, schema.properties]);
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
        let userData = '';
        for (const key in jsonData) {
            // @ts-ignore
            userData = userData + JSON.stringify(jsonData[key] || '') + separator;
        }
        await navigator.clipboard.writeText(userData);
        const data = {fullName, schemaName, description, data: userData};
        try {
            (await axios.post('http://localhost:5000/api/user/add', data));
            setError('');
            setSuccess(true);
        } catch (e: any) {
            setSuccess(false);
            setError(e.response.data.message);
        }
    }

    return (
        <Fragment>
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <TextField label="Full Name" variant="outlined" size={'small'} fullWidth={true}
                               onChange={e => setFullName(e.target.value)}/>
                </Grid>
            </Grid>
            {success ? <Alert severity="success" onClose={() => setSuccess(false)}>Form submitted
                successfully!</Alert> : null}
            {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
            <Grid
                container={true}
                spacing={10}>
                <Grid item sm={6}>
                    <Typography variant={'h5'}>Data</Typography>
                    <div className={classes.dataContent}>
                        <pre>{displayDataAsString}</pre>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Button
                            color='secondary'
                            onClick={onSubmit}
                            disabled={Object.keys(jsonData).length < 1}
                            variant='contained'>Save</Button>
                        <Button
                            onClick={() => setJsonData({})}
                            style={{backgroundColor: '#FFA500'}}
                            disabled={Object.keys(jsonData).length < 1}
                            variant='contained'>Clear</Button>
                        <Button
                            onClick={() => setSchema({properties: {}})}
                            color='secondary'
                            variant='contained'>Back</Button>
                    </div>
                </Grid>
                <Grid item sm={6}>
                    <Typography variant={'h5'}>Form</Typography>
                    <div className={classes.demoform}>
                        {uiSchema ?
                            <JsonForms
                                schema={schema}
                                // @ts-ignore
                                uischema={uiSchema}
                                data={jsonData}
                                renderers={materialRenderers}
                                cells={materialCells}
                                onChange={({errors, data}) => setJsonData(data)}
                            /> : null
                        }
                    </div>
                </Grid>
            </Grid>
        </Fragment>
    )
}

export default UserForm;