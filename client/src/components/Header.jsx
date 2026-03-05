import React, { useState } from 'react';

const Header = ({ serverStatus, user, onLoginClick, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header style={{
      padding: '20px 32px',
      background: 'linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#fff',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          Audio Player
        </h1>
        
        {/* Статус сервера */}
        <div style={{
          padding: '6px 12px',
          background: serverStatus?.includes('✅') ? 'rgba(29,185,84,0.1)' : 'rgba(239,68,68,0.1)',
          borderRadius: '20px',
          color: serverStatus?.includes('✅') ? '#1db954' : '#ef4444',
          fontSize: '12px',
          fontWeight: 500,
          border: `1px solid ${serverStatus?.includes('✅') ? '#1db954' : '#ef4444'}`
        }}>
          {serverStatus || 'Проверка...'}
        </div>
      </div>
      
      {/* Профиль пользователя */}
      <div style={{ position: 'relative' }}>
        {user ? (
          <>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                background: showUserMenu ? '#2a2a2a' : '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '30px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={(e) => !showUserMenu && (e.currentTarget.style.background = '#1a1a1a')}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: '#1db954',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#fff' }}>{user.username}</span>
              <span style={{ color: '#666' }}>▼</span>
            </button>

            {/* Выпадающее меню */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                background: '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '200px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #2a2a2a',
                  marginBottom: '8px'
                }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{user.username}</div>
                  <div style={{ color: '#999', fontSize: '12px' }}>{user.email}</div>
                </div>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ff4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <span>🚪</span>
                  Выйти
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              padding: '10px 24px',
              background: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1ed760';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#1db954';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;