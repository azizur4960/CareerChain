import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader message="Checking access permissions..." size="large" />
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to user's native dashboard
    if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (role === 'ALUMNI') return <Navigate to="/alumni/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
