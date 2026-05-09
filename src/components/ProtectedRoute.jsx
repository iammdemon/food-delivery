import React from 'react';
import { Navigate } from 'react-router-dom';
import { DASHBOARD_MAP } from '../constants';

const ProtectedRoute = ({ children, allowedRole, user }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        const targetPath = DASHBOARD_MAP[user.role] || '/';
        if (window.location.pathname !== targetPath) {
            return <Navigate to={targetPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
