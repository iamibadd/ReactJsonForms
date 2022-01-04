import React, {useState, useEffect} from "react";
import {Alert, Container} from "@mui/material";
import SchemasList from "./SchemasList";
import UserForm from "./UserForm";
import SideBar from "./Sidebar";
import axios from "axios";
import {Typography} from "@material-ui/core";

const backendApi = process.env.REACT_APP_BACKEND_API;

const User = () => {
    const [schemas, setSchemas] = useState<any[]>([]);
    const [filter, setFilter] = useState<any[]>([]);
    const [schema, setSchema] = useState({properties: {}});
    const [schemaId, setSchemaId] = useState(0);
    const [separator, setSeparator] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        (async () => {
            try {
                const url = `${backendApi}/api/admin/all`;
                const data = (await axios.get(url)).data;
                if (data.length) {
                    const filterSchemas = data.filter((value: { isActive: boolean; }) => value.isActive);
                    setSchemas(filterSchemas);
                }
            } catch (e: any) {
                setError(e.response.data);
            }
        })()
    }, []);
    const search = (query: string) => {
        if (query !== '') {
            const filteredData = schemas.filter(schema => schema.name.toLowerCase().includes(query.toLowerCase())
                || schema.description.toLowerCase().includes(query.toLowerCase()));
            setFilter(filteredData);
        } else setFilter([]);
    };
    return (
        <>
            <SideBar isAdmin={false} search={search} setSchema={setSchema} schema={schema} schemas={schemas}/>
            <br/>
            <Container maxWidth={'lg'}>
                {success ? <Alert severity="success" onClose={() => setSuccess(false)}>Form submitted
                    successfully!</Alert> : null}
                {error ? <Alert severity="error" onClose={() => setError('')}>{error}</Alert> : null}
                <br/>
                {schemas.length < 1 ?
                    <Typography variant={'h6'} color={'secondary'} style={{textAlign: "center"}}>
                        No schemas added by the admin!</Typography> : null
                }
                {Object.keys(schema.properties).length < 1 ?
                    <SchemasList schemas={filter && filter.length ? filter : schemas} setSchema={setSchema}
                                 setSeparator={setSeparator}
                                 setSchemaId={setSchemaId}/> :
                    <UserForm schema={schema} setSchema={setSchema} separator={separator} schemaId={schemaId}
                              setSuccess={setSuccess}/>
                }
            </Container>
        </>
    );
};

export default User;
