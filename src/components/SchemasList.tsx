import React, {FC} from 'react';
import {Card, CardContent, Typography, Grid, Button} from "@mui/material";
import {useTranslation} from 'react-i18next';

interface IProps {
    schemas: Array<any>;
    setSchema: (obj: any) => void;
    setSeparator: (str: any) => void;
    setSchemaId: (id: number) => void;
}

const SchemasList: FC<IProps> = ({schemas, setSchema, setSeparator, setSchemaId}: IProps) => {
    const {t} = useTranslation();
    return (
        <>
            <Grid container={true} spacing={12}>
                {schemas && schemas.length ?
                    schemas.map((schema, index) =>
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
                                            }}>{t('useSchema')}</Button>
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
