import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TrackList from './components/TrackList';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import PlaylistBrowser from './components/PlaylistBrowser';
import './styles/index.css';

const API_URL = 'http://localhost:5002';

// Настраиваем axios
axios.defaults.baseURL = API_URL;

function AppContent() {
  const [tracks, setTracks] = useState([]);
  const [serverStatus, setServerStatus] = useState('Проверка...');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPlaylistBrowser, setShowPlaylistBrowser] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  
  // Состояния для плеера
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef(new Audio());
  const { user, logout } = useAuth();

  // Эффект для проверки сервера
  useEffect(() => {
    checkServer();
  }, []);

  // Эффект для загрузки треков при наличии пользователя
  useEffect(() => {
    if (user) {
      fetchTracks();
    } else {
      setTracks([]);
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  }, [user]);

  // Эффект для настройки аудио
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Эффекты для громкости и скорости
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const checkServer = async () => {
    try {
      await axios.get('/');
      setServerStatus('✅ Онлайн');
    } catch (error) {
      console.error('Server check error:', error);
      setServerStatus('❌ Офлайн');
    }
  };

  const fetchTracks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get('/api/tracks');
      setTracks(res.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (track) => {
    try {
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch(e => console.error('Play error:', e));
          setIsPlaying(true);
        }
      } else {
        const audioUrl = track.url || `http://localhost:5002${track.path}`;
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => {
            setCurrentTrack(track);
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Playback error:', err);
          });
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const deleteTrack = async (id) => {
    if (!confirm('Удалить трек?')) return;
    try {
      await axios.delete(`/api/tracks/${id}`);
      if (currentTrack?.id === id) {
        audioRef.current.pause();
        setCurrentTrack(null);
        setIsPlaying(false);
      }
      fetchTracks();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSeek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleUpload = async (file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', metadata.title);
      formData.append('artist', metadata.artist);
      await axios.post('/api/tracks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchTracks();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки файла');
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    try {
      console.log('Selected playlist:', playlist);
      
      if (!playlist.tracks || playlist.tracks.length === 0) {
        alert('В плейлисте нет треков');
        return;
      }

      setShowPlaylistBrowser(false);
      
      let loadedCount = 0;
      let errorCount = 0;
      
      for (const track of playlist.tracks) {
        try {
          // Создаем запись о треке
          await axios.post('/api/tracks/info', {
            title: track.title,
            artist: track.artist,
            source: playlist.source,
            sourceId: track.id
          });
          loadedCount++;
        } catch (err) {
          console.error('Error saving track:', err);
          errorCount++;
        }
      }
      
      fetchTracks();
      alert(`✅ Загружено: ${loadedCount} треков\n❌ Ошибок: ${errorCount}`);
    } catch (error) {
      console.error('Error loading playlist:', error);
      alert('❌ Ошибка загрузки плейлиста');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#121212',
      overflow: 'hidden'
    }}>
      <Sidebar
        setCurrentView={setCurrentView}
        onUploadClick={() => user ? setIsUploadModalOpen(true) : setIsAuthModalOpen(true)}
        onPlaylistClick={() => user ? setShowPlaylistBrowser(true) : setIsAuthModalOpen(true)}
        user={user}
        onLogout={logout}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Header 
          serverStatus={serverStatus} 
          user={user}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onLogout={logout}
        />

        <div style={{ 
          flex: 1, 
          padding: '30px', 
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)'
        }}>
          {!user ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                animation: 'float 3s ease-in-out infinite'
              }}>
                🎵
              </div>
              <h1 style={{ 
                fontSize: '48px', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #1db954, #4CAF50)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Добро пожаловать
              </h1>
              <p style={{ 
                color: '#999', 
                marginBottom: '30px', 
                maxWidth: '500px',
                fontSize: '18px',
                lineHeight: '1.6'
              }}>
                Войдите или зарегистрируйтесь, чтобы загружать и слушать свою музыку, создавать плейлисты и находить новые треки
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  padding: '15px 40px',
                  background: '#1db954',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(29,185,84,0.3)'
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
                Войти / Регистрация
              </button>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px'
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
              ) : (
                <TrackList
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={playTrack}
                  onDeleteTrack={deleteTrack}
                />
              )}
            </>
          )}
        </div>

        {currentTrack && (
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={() => {
              if (currentTrack) {
                if (isPlaying) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                } else {
                  audioRef.current.play().catch(e => console.error('Play error:', e));
                  setIsPlaying(true);
                }
              }
            }}
            onNext={playNext}
            onPrevious={playPrevious}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
          />
        )}
      </div>

      {isUploadModalOpen && user && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

      {showPlaylistBrowser && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 2000,
          overflowY: 'auto'
        }}>
          <PlaylistBrowser 
            onSelectPlaylist={handlePlaylistSelect}
            onClose={() => setShowPlaylistBrowser(false)}
          />
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;