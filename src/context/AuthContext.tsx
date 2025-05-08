
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is stored in localStorage (this would be implemented with proper JWT validation in production)
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
  }, []);

  // This is a mock login function. In production, this would make an API request to your PHP backend
  const login = async (username: string, password: string) => {
    // In a real app, this would be replaced with actual API call
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we're mocking different user roles based on username
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
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
