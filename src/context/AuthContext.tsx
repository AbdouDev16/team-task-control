
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Si l'API n'est pas disponible, essayer d'utiliser les données localStorage
        // pour une expérience de développement sans backend
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to parse stored user:', error);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Essayer d'abord l'API
      try {
        const response = await authService.login(username, password);
        if (response && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          return;
        }
      } catch (apiError) {
        console.log('API login failed, falling back to mock login:', apiError);
        
        // Si l'API n'est pas disponible, utiliser le mock pour le développement
        // Simuler l'API avec un délai
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let mockUser: User | null = null;
        
        if (username === 'admin' && password === 'admin') {
          mockUser = { id: 1, username: 'admin', role: 'Admin' };
        } else if (username === 'manager' && password === 'manager') {
          mockUser = { id: 2, username: 'manager', role: 'Gérant' };
        } else if (username === 'pm' && password === 'pm') {
          mockUser = { id: 3, username: 'pm', role: 'Chef_Projet' };
        } else if (username === 'employee' && password === 'employee') {
          mockUser = { id: 4, username: 'employee', role: 'Employé' };
        } else {
          throw new Error('Invalid credentials');
        }
        
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Identifiants incorrects');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Essayer d'abord l'API
      try {
        await authService.logout();
      } catch (apiError) {
        console.log('API logout failed, falling back to local logout:', apiError);
      }
      
      // Dans tous les cas, effacer les données côté client
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (isLoading) {
    // Vous pourriez retourner un composant de chargement ici
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
