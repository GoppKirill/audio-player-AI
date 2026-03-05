import React from 'react';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#121212'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #333',
          borderTop: '3px solid #1db954',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#121212',
        color: '#fff'
      }}>
        <h1 style={{ marginBottom: '20px' }}>🔒 Требуется авторизация</h1>
        <p style={{ color: '#999' }}>Пожалуйста, войдите в систему</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;