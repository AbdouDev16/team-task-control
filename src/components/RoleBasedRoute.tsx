
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleBasedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  allowedRoles = ['Admin', 'Gérant', 'Chef_Projet', 'Employé'],
  children 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user && allowedRoles.includes(user.role)) {
    return children ? <>{children}</> : <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;
