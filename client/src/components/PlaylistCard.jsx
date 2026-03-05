import React from 'react';

const PlaylistCard = ({ playlist, onClick, isFavorite, onFavoriteToggle }) => {
  const getSourceColor = (source) => {
    switch(source) {
      case 'vk': return '#0077FF';
      case 'yandex': return '#FF4F4F';
      default: return '#1db954';
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid #333',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = getSourceColor(playlist.source);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#333';
      }}
    >
      {/* Обложка */}
      <div style={{
        position: 'relative',
        paddingTop: '100%',
        background: '#2a2a2a'
      }}>
        <img
          src={playlist.image || 'https://via.placeholder.com/300?text=No+Image'}
          alt={playlist.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
        
        {/* Бейдж источника */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: getSourceColor(playlist.source),
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {playlist.source === 'vk' ? 'VK' : playlist.source === 'yandex' ? 'Яндекс' : 'Локальный'}
        </div>

        {/* Количество треков */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          🎵 {playlist.trackCount || 0} треков
        </div>
      </div>

      {/* Информация */}
      <div style={{ padding: '16px', flex: 1 }}>
        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          margin: '0 0 8px 0',
          lineHeight: '1.4'
        }}>
          {playlist.title}
        </h3>
        
        <p style={{
          color: '#999',
          fontSize: '14px',
          margin: '0 0 12px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {playlist.description}
        </p>

        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: isFavorite ? '#ff4444' : '#666',
              padding: '4px'
            }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;