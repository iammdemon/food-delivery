import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole, user }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect to their own dashboard if they try to access wrong one
        const dashboardMap = {
            admin: '/admin',
            rider: '/rider',
            customer: '/user',
            kitchen: '/kitchen'
        };
        const targetPath = dashboardMap[user.role] || '/';

        // Prevent infinite redirect if we are already there (though Router usually handles this, verify via pathname)
        if (window.location.pathname !== targetPath) {
            return <Navigate to={targetPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
