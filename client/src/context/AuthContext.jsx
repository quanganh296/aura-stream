import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('aura_token');
      if (token) {
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (err) {
          console.error('Failed to load user profile, clearing token', err);
          authAPI.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (identity, password) => {
    setError(null);
    try {
      const data = await authAPI.login(identity, password);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url
      });
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const data = await authAPI.register(username, email, password);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email
      });
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
