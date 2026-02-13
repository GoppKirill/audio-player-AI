import React from 'react';

const Header = ({ serverStatus }) => {
  return (
    <div style={{
      padding: '20px 30px',
      background: '#0a0a0a',
      borderBottom: '1px solid #222',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#fff', fontSize: '28px', margin: 0 }}>
        Audio Player
      </h1>
      <div style={{
        padding: '8px 16px',
        background: serverStatus?.includes('✅') ? '#1db954' : '#ff4444',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px'
      }}>
        {serverStatus || 'Проверка...'}
      </div>
    </div>
  );
};

export default Header;