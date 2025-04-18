import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, loginUser, getCurrentUser, logoutUser } from '../lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Not authenticated:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await loginUser(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
      // Clear all queries in the cache when user logs out
      queryClient.clear();
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};