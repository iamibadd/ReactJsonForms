import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Admin from "../components/Admin";
import User from "../components/User";
import Page404 from "../components/Page404";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/admin"/>}/>
                <Route path={'/admin'} element={<Admin/>}/>
                <Route path={'/user'} element={<User/>}/>
                <Route path={'*'} element={<Page404/>}/>
            </Routes>
        </Router>
    );
};

export default AppRoutes;