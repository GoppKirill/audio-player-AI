import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    // Валидация
    if (!isLogin && formData.password.length < 6) {
      setLocalError('Пароль должен быть минимум 6 символов');
      setIsLoading(false);
      return;
    }

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.username, formData.email, formData.password);
    }

    console.log('Auth result:', result);

    if (result.success) {
      // Успешная авторизация - закрываем модалку
      onClose();
      // Очищаем форму
      setFormData({
        username: '',
        email: '',
        password: ''
      });
    } else {
      // Ошибка - показываем сообщение
      setLocalError(result.error || 'Произошла ошибка');
    }
    
    setIsLoading(false);
  };

  // Очищаем ошибку при смене режима
  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setLocalError('');
    setError(null);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '40px',
        width: '90%',
        maxWidth: '400px',
        border: '1px solid #333',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }} onClick={e => e.stopPropagation()}>
        
        <h2 style={{
          color: '#fff',
          fontSize: '28px',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
        </h2>
        
        <p style={{
          color: '#999',
          fontSize: '14px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          {isLogin ? 'Войдите чтобы продолжить' : 'Зарегистрируйтесь чтобы начать'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Имя пользователя
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1db954'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#fff',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1db954'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              color: '#fff',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Пароль
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1db954'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          {(localError || error) && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? '#666' : '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer',
              marginBottom: '15px',
              transition: 'background 0.2s, transform 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.background = '#1ed760')}
            onMouseLeave={(e) => !isLoading && (e.target.style.background = '#1db954')}
          >
            {isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isLogin ? 'Вход...' : 'Регистрация...'}
              </>
            ) : (
              isLogin ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>

          <button
            type="button"
            onClick={handleModeSwitch}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              color: '#1db954',
              border: '1px solid #1db954',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1db954';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#1db954';
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthModal;