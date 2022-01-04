import React, {useState, useEffect} from 'react';
import {DataGrid, GridToolbarContainer, GridToolbarExport, gridClasses, GridColDef} from '@mui/x-data-grid';
import {Container, Grid, Switch, Typography} from "@material-ui/core";
import {useTranslation} from 'react-i18next';
import axios from "axios";
import {ButtonGroup} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const backendApi = process.env.REACT_APP_BACKEND_API;

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport csvOptions={{
                fields: ['id', 'name', 'description', 'separator', 'isActive', 'createdAt', 'data', 'jsonData'],
                includeHeaders: true,
                fileName: `Sheet-${new Date().toISOString().split('T')[0]}`
            }}/>
        </GridToolbarContainer>
    );
}


export default function DataTable(props: any) {
    const {t} = useTranslation();
    const {user, success, onChange, onDelete, onEdit} = props;
    const adminColumns: GridColDef[] = [
        {
            field: 'name',
            headerName: t('name'),
            width: 150,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerName: t('description'),
            width: 280,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'separator',
            headerName: t('separator'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'isActive',
            headerName: t('active'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (value) => <Switch onClick={() => onChange(value.row.id, value.row.isActive)}
                                           checked={value.row.isActive} size={'small'} color={'primary'}
            />
        },
        {
            field: 'createdAt',
            headerName: t('createdAt'),
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({value}: any) => value.replace(/([a-zA-Z ])/g, " ").split('.')[0],
        },
        {
            field: 'actions',
            headerName: t('actions'),
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (value) => <ButtonGroup>
                <EditIcon sx={{color: '#FFA500FF'}} onClick={() => onEdit(value.row)}/>
                <DeleteIcon sx={{color: 'red'}} onClick={() => onDelete(value.row)}/>
            </ButtonGroup>
        }
    ]
    const userColumns: GridColDef[] = [
        {
            field: 'id',
            headerName: '#',
        },
        {
            field: 'name',
            headerName: t('schemaName'),
            width: 150,
        },
        {
            field: 'data',
            headerName: t('data'),
            width: 250,
        },
        {
            field: 'jsonData',
            headerName: 'JSON',
            width: 400,
            valueFormatter: ({value}: any) => JSON.stringify(value),
            renderCell: ({value}: any) => <pre>{JSON.stringify(value)}</pre>
        }
    ]
    const [data, setData] = useState([]);
    useEffect(() => {
        (async () => {
            let url = '';
            if (user === 'Admin') {
                url = `${backendApi}/api/admin/all`
            } else if (user === 'Users') {
                url = `${backendApi}/api/user/all`
            }
            try {
                const data = (await axios.get(url)).data.sort((a: any, b: any) => a.id - b.id);
                setData(data);
            } catch (e: any) {
                console.log(e.response.data);
            }
        })();
    }, [user, success]);
    return (
        <Container maxWidth={'md'} style={{marginTop: user === 'Users' ? 40 : 0}}>
            <Grid container={true} justifyContent={'center'}>
                <Grid item={true} lg={12} sm={10} xs={8}>
                    {!data.length ?
                        <Typography variant={'h6'} color={'secondary'} style={{textAlign: "center"}}>
                            {t(user === 'Admin' ? 'schemasUnavailable' : 'usersUnavailable')}</Typography> :
                        <div style={{height: 400}}>
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
                                columns={user === 'Admin' ? adminColumns : userColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                autoHeight={true}
                                disableSelectionOnClick={true}
                                getRowId={row => row.id}
                                components={{
                                    Toolbar: CustomToolbar,
                                }}
                            />
                        </div>}
                </Grid>
            </Grid>
        </Container>
    );
}
