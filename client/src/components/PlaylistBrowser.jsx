import React, { useState, useEffect } from 'react';
import PlaylistCard from './PlaylistCard';

// Мок-данные для VK и Яндекс.Музыки
const mockPlaylists = {
  vk: [
    {
      id: 'vk-1',
      title: 'VK: Топ-100 России',
      description: 'Самые популярные треки ВКонтакте',
      image: 'https://sun9-78.userapi.com/impf/c624624/v624624169/1b5e9/SyNc6kRwWMM.jpg',
      trackCount: 100,
      source: 'vk',
      tracks: Array(10).fill(0).map((_, i) => ({
        id: `vk-track-${i}`,
        title: `VK Трек ${i + 1}`,
        artist: 'VK Artist',
        duration: 180 + i * 10
      }))
    },
    {
      id: 'vk-2',
      title: 'VK: Русский рок',
      description: 'Лучший русский рок',
      image: 'https://sun9-45.userapi.com/impf/c636526/v636526169/2b3c4/7jKd9kLmNop.jpg',
      trackCount: 75,
      source: 'vk',
      tracks: Array(8).fill(0).map((_, i) => ({
        id: `vk-rock-${i}`,
        title: `Рок трек ${i + 1}`,
        artist: 'Рок группа',
        duration: 200 + i * 15
      }))
    }
  ],
  yandex: [
    {
      id: 'yandex-1',
      title: 'Я.Музыка: Популярное',
      description: 'Треки, которые слушают прямо сейчас',
      image: 'https://avatars.yandex.net/get-music-content/2389885/123abcde/p1000x1000',
      trackCount: 50,
      source: 'yandex',
      tracks: Array(12).fill(0).map((_, i) => ({
        id: `yandex-pop-${i}`,
        title: `Популярный трек ${i + 1}`,
        artist: 'Популярный артист',
        duration: 190 + i * 12
      }))
    },
    {
      id: 'yandex-2',
      title: 'Я.Музыка: Хип-хоп',
      description: 'Главные треки в жанре',
      image: 'https://avatars.yandex.net/get-music-content/2487586/456defgh/p1000x1000',
      trackCount: 60,
      source: 'yandex',
      tracks: Array(15).fill(0).map((_, i) => ({
        id: `yandex-hiphop-${i}`,
        title: `Хип-хоп трек ${i + 1}`,
        artist: 'Рэп исполнитель',
        duration: 170 + i * 8
      }))
    }
  ]
};

const PlaylistBrowser = ({ onSelectPlaylist, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState('all');

  useEffect(() => {
    loadPlaylists();
  }, [activeSource]);

  const loadPlaylists = () => {
    setLoading(true);
    setTimeout(() => {
      let allPlaylists = [];
      if (activeSource === 'all') {
        allPlaylists = [...mockPlaylists.vk, ...mockPlaylists.yandex];
      } else if (activeSource === 'vk') {
        allPlaylists = mockPlaylists.vk;
      } else if (activeSource === 'yandex') {
        allPlaylists = mockPlaylists.yandex;
      }
      setPlaylists(allPlaylists);
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const allPlaylists = [...mockPlaylists.vk, ...mockPlaylists.yandex];
      const filtered = allPlaylists.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPlaylists(filtered);
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      padding: '30px',
      background: '#121212',
      minHeight: '100%',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#fff',
          margin: 0
        }}>
          Поиск плейлистов
        </h1>
        
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          ✕ Закрыть
        </button>
      </div>

      {/* Фильтры */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveSource('all')}
          style={{
            padding: '8px 16px',
            background: activeSource === 'all' ? '#1db954' : '#2a2a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Все
        </button>
        <button
          onClick={() => setActiveSource('vk')}
          style={{
            padding: '8px 16px',
            background: activeSource === 'vk' ? '#0077FF' : '#2a2a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          VK
        </button>
        <button
          onClick={() => setActiveSource('yandex')}
          style={{
            padding: '8px 16px',
            background: activeSource === 'yandex' ? '#FF4F4F' : '#2a2a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Яндекс.Музыка
        </button>
      </div>

      {/* Поиск */}
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Название плейлиста или исполнителя..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Поиск
          </button>
        </div>
      </form>

      {/* Загрузка */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto',
            border: '3px solid #333',
            borderTop: '3px solid #1db954',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Список плейлистов */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => onSelectPlaylist(playlist)}
            />
          ))}
          
          {playlists.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px',
              color: '#999'
            }}>
              Плейлисты не найдены
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlaylistBrowser;