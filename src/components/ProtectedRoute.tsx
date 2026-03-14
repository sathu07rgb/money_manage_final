import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../auth';

interface Props {
    children: React.ReactNode;
}

/**
 * ProtectedRoute — wraps any page that requires authentication.
 * If the user has no session in localStorage, they are redirected to /login.
 */
const ProtectedRoute: React.FC<Props> = ({ children }) => {
    return getSession() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
