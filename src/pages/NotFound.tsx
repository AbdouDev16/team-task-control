
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-6">Page non trouvée</h2>
        <p className="mb-8 text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <Button asChild>
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            Retourner à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
