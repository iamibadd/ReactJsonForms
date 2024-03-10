import React from "react";
import DataGrid from "@inovua/reactdatagrid-community";
import { TypeDataGridProps } from "@inovua/reactdatagrid-community/types";
import "@inovua/reactdatagrid-community/index.css";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConstraintGraph } from "../ConstraintGraphEditor/ConstraintGraphEditor";

interface ConstraintGraphTableProps {
    data: ConstraintGraph[];
    setData: any;
    onDeleteGraph: any;
}

const ConstraintGraphTable: React.FC<ConstraintGraphTableProps> = ({ data, setData, onDeleteGraph }) => {
    if (typeof data === "undefined") {
        return <div>No graphs</div>;
    }
    // const handleDelete = (id: string) => {
    //     const deleteGraph = (prevData: ConstraintGraph[]) => prevData.filter((graph: ConstraintGraph) => graph.id == id);
    //     const deleted = deleteGraph(data);
    //     onDeleteGraph(deleted);
    // };

    const handleDelete = (id: string) => {
        onDeleteGraph(id);
    };

    const columns: TypeDataGridProps["columns"] = [
        { name: "name", header: "Name", flex: 60, minWidth: 100, resizable: true },
        { name: "timeUnit", header: "Time Unit", flex: 20, minWidth: 100, resizable: true },
        {
            name: "actions",
            header: "Remove",
            minWidth: 100,
            flex: 20,
            resizable: true,
            render: (params) => (
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => handleDelete(params.data.id)}
                >
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <div style={{ width: "100%" }}>
            <DataGrid
                idProperty="id"
                dataSource={data}
                columns={columns}
                columnMinWidth={100}
            />
        </div>
    );
};

export default ConstraintGraphTable;
