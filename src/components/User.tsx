import {Fragment, useState, useEffect} from 'react';
import {JsonForms} from '@jsonforms/react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import schema from '../schemas/schema.json';
import uischema from '../schemas/uischema.json';
import {materialCells, materialRenderers,} from '@jsonforms/material-renderers';
import RatingControl from '../utils/RatingControl';
import ratingControlTester from '../utils/ratingControlTester';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((_theme) => ({
    container: {
        padding: '1em',
        width: '100%',
    },
    title: {
        textAlign: 'center',
        padding: '0.25em',
    },
    dataContent: {
        display: 'flex',
        justifyContent: 'center',
        borderRadius: '0.25em',
        backgroundColor: '#cecece',
        marginBottom: '1rem',
    },
    resetButton: {
        margin: 'auto',
        display: 'block',
    },
    demoform: {
        margin: 'auto',
        padding: '1rem',
    },
}));

const initialData = {
    name: 'Send email to Adrian',
    description: 'Confirm if you have passed the subject\nHereby ...',
    done: true,
    recurrence: 'Daily',
    rating: 3,
};

const renderers = [
    ...materialRenderers,
    //register custom renderers
    {tester: ratingControlTester, renderer: RatingControl},
];

const User = () => {
    const classes = useStyles();
    const [displayDataAsString, setDisplayDataAsString] = useState('');
    const [jsonformsData, setJsonformsData] = useState<any>(initialData);

    useEffect(() => {
        setDisplayDataAsString(JSON.stringify(jsonformsData, null, 2));
    }, [jsonformsData]);

    const clearData = () => {
        setJsonformsData({});
    };

    return (
        <Fragment>
            <h1>Welcome to JSON Forms with React</h1>
            <p>More Forms. Less Code.</p>
            <Grid
                container
                justify={'center'}
                spacing={1}
                className={classes.container}
            >
                <Grid item sm={6}>
                    <Typography variant={'h3'} className={classes.title}>
                        Bound data
                    </Typography>
                    <div className={classes.dataContent}>
                        <pre id='boundData'>{displayDataAsString}</pre>
                    </div>
                    <Button
                        className={classes.resetButton}
                        onClick={clearData}
                        color='primary'
                        variant='contained'
                    >
                        Clear data
                    </Button>
                </Grid>
                <Grid item sm={6}>
                    <Typography variant={'h3'} className={classes.title}>
                        Rendered form
                    </Typography>
                    <div className={classes.demoform}>
                        <JsonForms
                            schema={schema}
                            uischema={uischema}
                            data={jsonformsData}
                            renderers={renderers}
                            cells={materialCells}
                            onChange={({errors, data}) => setJsonformsData(data)}
                        />
                    </div>
                </Grid>
            </Grid>
        </Fragment>
    );
};

export default User;
