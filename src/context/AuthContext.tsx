
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
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const checkAuth = async () => {
      try {
        console.log("Tentative de vérification de l'authentification...");
        const response = await authService.getCurrentUser();
        if (response && response.user) {
          console.log("Utilisateur authentifié:", response.user);
          setUser(response.user);
          setIsAuthenticated(true);
        }
        setApiAvailable(true);
      } catch (error) {
        console.warn("Erreur lors de la vérification d'authentification:", error);
        setApiAvailable(false);
        
        // Si l'API n'est pas disponible, essayer d'utiliser les données localStorage
        // pour une expérience de développement sans backend
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log("Utilisation des données locales:", parsedUser);
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
        console.log("Tentative de connexion via l'API...");
        const response = await authService.login(username, password);
        if (response && response.user) {
          console.log("Connexion réussie:", response.user);
          setUser(response.user);
          setIsAuthenticated(true);
          setApiAvailable(true);
          toast.success("Connexion réussie!");
          return;
        }
      } catch (apiError) {
        console.warn('API login failed, falling back to mock login:', apiError);
        setApiAvailable(false);
        
        // Si l'API n'est pas disponible, utiliser le mock pour le développement
        console.log("Utilisation du mode de développement sans API");
        toast.info("API non disponible. Utilisation du mode de développement.", {
          duration: 5000
        });
        
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
        toast.success("Connexion réussie (mode développement)");
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
      if (apiAvailable) {
        try {
          await authService.logout();
          console.log("Déconnexion API réussie");
        } catch (apiError) {
          console.warn('API logout failed, falling back to local logout:', apiError);
        }
      }
      
      // Dans tous les cas, effacer les données côté client
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      toast.success("Déconnexion réussie");
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    apiAvailable
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
