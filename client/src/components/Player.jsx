import React from 'react';

const Player = ({ currentTrack, isPlaying, onTogglePlay }) => {
  if (!currentTrack) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 260,
        right: 0,
        height: '80px',
        background: '#0a0a0a',
        borderTop: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Выберите трек для воспроизведения
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 260,
      right: 0,
      height: '80px',
      background: '#0a0a0a',
      borderTop: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      padding: '0 30px'
    }}>
      {/* Информация о треке */}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontSize: '16px', marginBottom: '4px' }}>
          {currentTrack.title}
        </div>
        <div style={{ color: '#999', fontSize: '14px' }}>
          {currentTrack.artist}
        </div>
      </div>

      {/* Кнопка play/pause */}
      <button
        onClick={onTogglePlay}
        style={{
          width: '50px',
          height: '50px',
          background: '#1db954',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
};

export default Player;