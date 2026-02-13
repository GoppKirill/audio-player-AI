import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TrackList from './components/TrackList';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import './styles/index.css';

const API_URL = 'http://localhost:5002';

function App() {
  const [tracks, setTracks] = useState([]);
  const [serverStatus, setServerStatus] = useState('Проверка...');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const audioRef = useRef(new Audio());

  useEffect(() => {
    checkServer();
    fetchTracks();
  }, []);

  const checkServer = async () => {
    try {
      await axios.get(API_URL);
      setServerStatus('✅ Онлайн');
    } catch (error) {
      setServerStatus('❌ Офлайн');
    }
  };

  const fetchTracks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tracks`);
      setTracks(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audioUrl = track.url || `http://localhost:5002${track.path}`;
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const deleteTrack = async (id) => {
    if (!confirm('Удалить трек?')) return;
    try {
      await axios.delete(`${API_URL}/tracks/${id}`);
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

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#121212' }}>
      <Sidebar
        setCurrentView={setCurrentView}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header serverStatus={serverStatus} />

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <TrackList
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={playTrack}
            onDeleteTrack={deleteTrack}
          />
        </div>

        <Player
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => {
            if (currentTrack) {
              if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
              } else {
                audioRef.current.play();
                setIsPlaying(true);
              }
            }
          }}
        />
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={async (file, metadata) => {
            const formData = new FormData();
            formData.append('audio', file);
            formData.append('title', metadata.title);
            formData.append('artist', metadata.artist);
            await axios.post(`${API_URL}/tracks`, formData);
            fetchTracks();
          }}
        />
      )}
    </div>
  );
}

export default App;