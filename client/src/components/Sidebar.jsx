import React from 'react';

const Sidebar = ({ setCurrentView, onUploadClick }) => {
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
      {/* Лого */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: '#1db954',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          🎵
        </div>
        <h2 style={{ color: '#fff', margin: 0 }}>Player</h2>
      </div>

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
            textAlign: 'left'
          }}
        >
          🏠 Главная
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
            textAlign: 'left'
          }}
        >
          📚 Библиотека
        </button>
      </div>

      {/* Плейлисты */}
      <div style={{ flex: 1 }}>
        <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          ПЛЕЙЛИСТЫ
        </h3>
        {['Любимые', 'Недавние', 'Подкасты'].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '10px',
              color: '#999',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            {item}
          </div>
        ))}
      </div>

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
          fontWeight: 'bold'
        }}
      >
        + Загрузить трек
      </button>
    </div>
  );
};

export default Sidebar;