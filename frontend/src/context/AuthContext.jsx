import React, { createContext, useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../lib/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData) {
      return null;
    }

    const userId = userData._id || userData.id || userData.userId || null;

    return {
      ...userData,
      _id: userId,
      id: userId,
    };
  };

  const fetchUser = useCallback(async (token) => {
    try {
      const res = await fetch(apiUrl('/api/user'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(normalizeUser(userData));
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = (userData, token) => {
    setUser(normalizeUser(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
