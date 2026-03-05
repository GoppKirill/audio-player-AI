import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверяем токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:5002/api/auth/verify');
      console.log('Token validation response:', response.data);
      setUser(response.data.user);
    } catch (err) {
      console.error('Token validation error:', err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with:', { email });
      
      const response = await axios.post('http://localhost:5002/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Обновляем состояние пользователя
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Ошибка входа';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      console.log('Attempting registration with:', { username, email });
      
      const response = await axios.post('http://localhost:5002/api/auth/register', {
        username,
        email,
        password
      });
      
      console.log('Register response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.error || 'Ошибка регистрации';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};