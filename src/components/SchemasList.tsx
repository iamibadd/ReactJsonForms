import React, {FC} from 'react';
import {Card, CardContent, Typography, Grid, Button} from "@mui/material";

interface IProps {
    schemas: Array<any>;
    setSchema: (obj: any) => void;
    setSeparator: (str: any) => void;
    setSchemaId: (id: number) => void;
}

const SchemasList: FC<IProps> = ({schemas, setSchema, setSeparator, setSchemaId}: IProps) => {
    return (
        <Grid container spacing={12}>
            {schemas && schemas.length && schemas[0].name !== "" ?
                schemas.map((schema, index) =>
                    <Grid item xs={6} key={index}>
                        <Card sx={{
                            backgroundColor: '#858D8D', height: 200, textAlign: 'center', display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
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
    );
}
export default SchemasList;
