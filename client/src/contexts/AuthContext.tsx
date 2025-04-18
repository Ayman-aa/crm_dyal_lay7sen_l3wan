import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
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
  
  // Add this ref to track if the initial auth check has been performed
  const initialAuthCheckDone = useRef(false);

  // Check if user is already logged in on mount - only once
  useEffect(() => {
    // Skip if we've already done the initial check
    if (initialAuthCheckDone.current) return;

    const checkLoggedIn = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // User is not authenticated, but this is not an error state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        console.error('Authentication error:', err.message);
        setUser(null);
        setIsAuthenticated(false);
        // Only set error for unexpected errors
        setError(err.message);
      } finally {
        setLoading(false);
        initialAuthCheckDone.current = true;
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
    } catch (err: any) {
      console.error('Logout error:', err.message);
    } finally {
      // Always clear state regardless of API success
      setUser(null);
      setIsAuthenticated(false);
      // Clear all queries in the cache when user logs out
      queryClient.clear();
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