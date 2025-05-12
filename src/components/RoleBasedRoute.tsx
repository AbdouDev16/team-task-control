
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { toast } from 'sonner';

interface RoleBasedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  allowedRoles = ['Admin', 'Gérant', 'Chef_Projet', 'Employé'],
  children 
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Si l'utilisateur est authentifié mais n'a pas le rôle requis, afficher une notification
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      toast.error(`Accès refusé. Vous n'avez pas les permissions nécessaires.`);
    }
  }, [isAuthenticated, user, allowedRoles, location.pathname]);

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion et conserver l'URL actuelle comme destination après connexion
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user && allowedRoles.includes(user.role)) {
    return children ? <>{children}</> : <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;
