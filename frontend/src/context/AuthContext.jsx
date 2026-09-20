import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/user/profile');
      setUser(data.user);
      localStorage.setItem('bv_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('bv_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (aadharCardNumber, password) => {
    const { data } = await api.post('/user/login', { aadharCardNumber, password });
    localStorage.setItem('bv_token', data.token);
    const profile = await fetchProfile();
    return profile;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/user/signup', payload);
    localStorage.setItem('bv_token', data.token);
    const profile = await fetchProfile();
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('bv_token');
    localStorage.removeItem('bv_user');
    setUser(null);
  };

  const value = { user, setUser, loading, login, signup, logout, refreshProfile: fetchProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
