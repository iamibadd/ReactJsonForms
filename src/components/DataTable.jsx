import * as React from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    gridClasses,
} from '@mui/x-data-grid';

function CustomToolbar() {
    return (
        <GridToolbarContainer className={gridClasses.toolbarContainer}>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}

export default function ExportSelectorGrid({props}) {
    return (
        <div style={{height: 300, width: '100%'}}>
            <DataGrid
                rows={props}
                columns={[{field: 'id', disableColumnMenu: true}, {
                    field: 'name',
                    width: '100%',
                    align: 'center',
                    disableColumnMenu: true
                }]}
                autoHeight={true}
                disableColumnFilter={false}
                components={{
                    Toolbar: CustomToolbar,
                }}
            />
        </div>
    );
}
