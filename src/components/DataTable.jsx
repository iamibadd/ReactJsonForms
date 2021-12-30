import React, {useState, useEffect} from 'react';
import {DataGrid, GridToolbarContainer, GridToolbarExport, gridClasses} from '@mui/x-data-grid';
import {Container, Grid} from "@material-ui/core";
import axios from "axios";

const backendApi = process.env.REACT_APP_BACKEND_API;

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport csvOptions={{allColumns: true, includeHeaders: true, fileName: 'Users-Data'}}/>
        </GridToolbarContainer>
    );
}


const columns = [
    {
        field: 'schemaId',
        headerName: 'Schema #',
        disableColumnMenu: true
    },
    {
        field: 'name',
        headerName: 'Schema Name',
        width: 150,
        editable: true
    },
    {
        field: 'data',
        headerName: 'Data',
        width: 250,
        editable: true
    },
    {
        field: 'jsonData',
        headerName: 'JSON',
        width: 400,
        renderCell: ({value}) => <pre>{JSON.stringify(value)}</pre>
    }
]

export default function DataTable() {
    const [data, setData] = useState([]);
    useEffect(() => {
        (async () => {
            try {
                const url = `${backendApi}/api/user/all`;
                const data = (await axios.get(url)).data;
                setData(data);
            } catch (e) {
                console.log(e.response.data);
            }
        })()
    }, []);
    return (
        <Container maxWidth={'md'} style={{marginTop: 10}}>
            <br/>
            <Grid container={true} justifyContent={'center'}>
                <Grid item={true} lg={12} sm={10} xs={8}>
                    <div style={{height: 400, width: '100%'}}>
                        <DataGrid
                            sx={{
                                boxShadow: 2,
                                border: 1,
                                borderColor: 'primary.light',
                                '& .MuiDataGrid-cell:hover': {
                                    color: 'primary.main',
                                },
                            }}
                            rows={data}
                            columns={columns}
                            disableColumnFilter={false}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            components={{
                                Toolbar: CustomToolbar,
                            }}
                        />
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
}
