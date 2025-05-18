
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, AuthContextType } from '@/types';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);

  // Vérifier si l'utilisateur est déjà connecté
  const checkAuth = async () => {
    try {
      console.info('Tentative de vérification de l\'authentification...');
      const response = await authService.getCurrentUser();
      
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        setApiAvailable(true);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.warn('Erreur lors de la vérification d\'authentification:', error);
      setUser(null);
      localStorage.removeItem('user');
      setError('Session expirée ou non valide');
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        setError(null);
        setApiAvailable(true);
      } else {
        throw new Error('Échec de la connexion');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      setError(error instanceof Error ? error.message : 'Échec de la connexion');
      setApiAvailable(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on déconnecte côté client
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      isAuthenticated: !!user,
      apiAvailable 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
