import React, {useState, useEffect} from "react";
import {Alert, Container} from "@mui/material";
import SchemasList from "./SchemasList";
import Navbar from "./Navbar";
import UserForm from "./UserForm";
import axios from "axios";
import {Typography} from "@material-ui/core";
const backendApi = process.env.REACT_APP_BACKEND_API;

const User = () => {
    const [schemas, setSchemas] = useState([]);
    const [schema, setSchema] = useState({properties: {}});
    const [schemaName, setSchemaName] = useState('');
    const [separator, setSeparator] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
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
        })()
    }, []);
    return (
        <>
            <Navbar links={['User Dashboard']} setSchema={setSchema}/>
            <br/>
            <Container maxWidth={'xl'}>
                {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                {schemas.length < 1 ?
                    <Typography variant={'h6'} color={'secondary'} style={{textAlign: "center"}}>
                        No schemas added by the admin!</Typography> : null
                }
                {Object.keys(schema.properties).length < 1 ?
                    <SchemasList schemas={schemas} setSchema={setSchema} setSchemaName={setSchemaName}
                                 setDescription={setDescription} setSeparator={setSeparator}/> :
                    <UserForm schema={schema} setSchema={setSchema} schemaName={schemaName} description={description}
                              separator={separator}
                    />
                }
            </Container>
        </>
    );
};

export default User;
