import React from 'react';

const TrackList = ({ tracks, currentTrack, isPlaying, onPlayTrack, onDeleteTrack }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: '#1a1a1a',
        borderRadius: '12px',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
        <h3 style={{ color: '#fff', marginBottom: '8px' }}>Нет треков</h3>
        <p style={{ color: '#999' }}>Загрузите первый трек через боковое меню</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        color: '#fff',
        fontSize: '24px',
        marginBottom: '24px',
        fontWeight: 600
      }}>
        Все треки ({tracks.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            onClick={() => onPlayTrack(track)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: currentTrack?.id === track.id ? '#2a2a2a' : '#1a1a1a',
              borderRadius: '10px',
              cursor: 'pointer',
              border: currentTrack?.id === track.id ? '1px solid #1db954' : '1px solid #333',
              transition: 'all 0.2s'
            }}
          >
            {/* Номер трека */}
            <div style={{
              width: '40px',
              color: currentTrack?.id === track.id ? '#1db954' : '#666',
              fontWeight: 'bold'
            }}>
              {currentTrack?.id === track.id && isPlaying ? '▶' : index + 1}
            </div>

            {/* Информация о треке */}
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: currentTrack?.id === track.id ? 600 : 400,
                marginBottom: '4px'
              }}>
                {track.title || 'Без названия'}
              </div>
              <div style={{ color: '#999', fontSize: '14px' }}>
                {track.artist || 'Неизвестный исполнитель'}
              </div>
            </div>

            {/* Длительность (заглушка) */}
            <div style={{ color: '#666', marginRight: '20px' }}>
              2:34
            </div>

            {/* Кнопка удаления */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTrack(track.id);
              }}
              style={{
                padding: '8px 16px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.8}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackList;