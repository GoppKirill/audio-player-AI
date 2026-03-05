import React from 'react';

const Sidebar = ({ setCurrentView, onUploadClick, onPlaylistClick, user, onLogout, onLoginClick }) => {
  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: '#0a0a0a',
      borderRight: '1px solid #222',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
{/* Лого AURA */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '40px'
}}>
  <div style={{
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #1db954, #4CAF50)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(29,185,84,0.3)'
  }}>
    A
  </div>
  <h2 style={{ 
    color: '#fff', 
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    letterSpacing: '1px'
  }}>
    AURA
  </h2>
</div>

      {/* Информация о пользователе (если авторизован) */}
      {user && (
        <div style={{
          marginBottom: '30px',
          padding: '15px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#1db954',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 600 }}>{user.username}</div>
              <div style={{ color: '#999', fontSize: '12px' }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '8px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#ff6666'}
            onMouseLeave={(e) => e.target.style.background = '#ff4444'}
          >
            <span>🚪</span>
            Выйти
          </button>
        </div>
      )}

      {/* Меню */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '8px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2a2a2a';
            e.target.style.borderColor = '#1db954';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#1a1a1a';
            e.target.style.borderColor = '#333';
          }}
        >
          <span>🏠</span> Главная
        </button>
        
        <button
          onClick={() => setCurrentView('library')}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '8px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2a2a2a';
            e.target.style.borderColor = '#1db954';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#1a1a1a';
            e.target.style.borderColor = '#333';
          }}
        >
          <span>📚</span> Библиотека
        </button>

        {/* Кнопка поиска плейлистов */}
        <button
          onClick={onPlaylistClick}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #0077FF, #00C3FF)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0088FF, #00D4FF)';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0077FF, #00C3FF)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <span>🌐</span>
          Найти плейлисты
        </button>
      </div>

      {/* Плейлисты (для авторизованных) */}
      {user && (
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
            МОИ ПЛЕЙЛИСТЫ
          </h3>
          {['Любимые треки', 'Недавние', 'Для тренировки'].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '10px',
                color: '#999',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1a1a1a';
                e.target.style.color = '#fff';
                e.target.style.paddingLeft = '15px';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
                e.target.style.paddingLeft = '10px';
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Кнопка загрузки */}
      <button
        onClick={onUploadClick}
        style={{
          width: '100%',
          padding: '14px',
          background: '#1db954',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          marginTop: user ? '20px' : '0'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#1ed760';
          e.target.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#1db954';
          e.target.style.transform = 'scale(1)';
        }}
      >
        {user ? '+ Загрузить трек' : 'Войти чтобы загружать'}
      </button>
    </div>
  );
};

export default Sidebar;