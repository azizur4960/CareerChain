import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('careerchain_token');
      const storedUser = localStorage.getItem('careerchain_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Refresh user data from API in background to ensure active session
          const freshUser = await authApi.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('careerchain_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    const receivedToken = data.access_token;
    const receivedUser = data.user;

    localStorage.setItem('careerchain_token', receivedToken);
    localStorage.setItem('careerchain_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    // Fetch full user profile with relations
    try {
      const fullUser = await authApi.getCurrentUser();
      setUser(fullUser);
      localStorage.setItem('careerchain_user', JSON.stringify(fullUser));
      return fullUser;
    } catch {
      return receivedUser;
    }
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const receivedToken = data.access_token;
    const receivedUser = data.user;

    localStorage.setItem('careerchain_token', receivedToken);
    localStorage.setItem('careerchain_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    try {
      const fullUser = await authApi.getCurrentUser();
      setUser(fullUser);
      localStorage.setItem('careerchain_user', JSON.stringify(fullUser));
      return fullUser;
    } catch {
      return receivedUser;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('careerchain_token');
    localStorage.removeItem('careerchain_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem('careerchain_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
