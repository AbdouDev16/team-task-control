
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Accès non autorisé</h1>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        {user && (
          <p className="text-sm">
            Votre rôle actuel: <span className="font-semibold">{user.role}</span>
          </p>
        )}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
          <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <Button asChild>
            <Link to="/dashboard">Tableau de bord</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
