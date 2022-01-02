import React, {FC, useState} from 'react';
import {Card, CardContent, Typography, Grid, Button, TextField} from "@mui/material";

interface IProps {
    schemas: Array<any>;
    setSchema: (obj: any) => void;
    setSeparator: (str: any) => void;
    setSchemaId: (id: number) => void;
}

const SchemasList: FC<IProps> = ({schemas, setSchema, setSeparator, setSchemaId}: IProps) => {
    const [filter, setFilter] = useState<any[]>([]);
    const search = (query: string) => {
        if (query !== '') {
            const filteredData = schemas.filter(schema => schema.name.toLowerCase().includes(query.toLowerCase())
                || schema.description.toLowerCase().includes(query.toLowerCase()));
            setFilter(filteredData);
        } else setFilter([]);
    };
    return (
        <>
            {filter.length || (schemas && schemas.length) ?
                <Grid container={true} justifyContent={'center'} sx={{marginBottom: 5, marginTop: -2}}>
                    <Grid item={true}>
                        <TextField label={'Search schemas by name or description'} size={'small'} inputMode={'search'}
                                   type={'search'} sx={{width: 350}} onChange={e => search(e.target.value)}
                        />
                    </Grid>
                </Grid>
                : null}
            <Grid container={true} spacing={12}>
                {filter.length || (schemas && schemas.length) ?
                    (filter.length ? filter : schemas).map((schema, index) =>
                        <Grid item xs={4} key={index}>
                            <Card sx={{
                                backgroundColor: '#858D8D', height: 200, textAlign: 'center', display: "flex",
                                flexDirection: "column", justifyContent: "center", marginBottom: 10
                            }}>
                                <CardContent>
                                    <Typography sx={{fontSize: 16, fontWeight: 'bold'}} color="text.secondary"
                                                gutterBottom>
                                        {schema.name}
                                    </Typography>
                                    <Typography sx={{fontSize: 14}} color="text.secondary">
                                        {schema.description}
                                    </Typography>
                                    <Button size={'small'} sx={{marginTop: 2, background: 'black', color: 'white'}}
                                            onClick={() => {
                                                setSchema(schema.schema);
                                                setSchemaId(schema.id);
                                                setSeparator(schema.separator);
                                            }}>Use Schema</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                    : null
                }
            </Grid>
        </>
    );
}
export default SchemasList;
