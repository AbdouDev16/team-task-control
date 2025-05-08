
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <ShieldAlert size={36} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
        <p className="mb-8 text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <Button asChild>
          <Link to="/dashboard">
            Retourner au tableau de bord
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
