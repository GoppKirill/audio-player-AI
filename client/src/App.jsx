import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5002'; // ИЗМЕНЕНО НА 5002!

function App() {
    const [tracks, setTracks] = useState([]);
    const [serverStatus, setServerStatus] = useState('Проверка...');
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const audioRef = useRef(new Audio());
    const fileInputRef = useRef(null);

    // Проверка сервера при загрузке
    useEffect(() => {
        checkServer();
        fetchTracks();
    }, []);

    // Проверка соединения с сервером
    const checkServer = async () => {
        try {
            const res = await axios.get(API_URL);
            setServerStatus(`✅ ${res.data.message}`);
        } catch (error) {
            console.error('Server connection failed:', error);
            setServerStatus('❌ Сервер не доступен');
        }
    };

    // Загрузка списка треков
    const fetchTracks = async () => {
        try {
            const res = await axios.get(`${API_URL}/tracks`);
            setTracks(res.data);
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    };

    // ЗАГРУЗКА ТРЕКА
    const uploadTrack = async (file) => {
        if (!file) {
            alert('Выберите файл');
            return;
        }

        // Проверка размера файла (макс 100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('❌ Файл слишком большой. Максимальный размер 100MB');
            return;
        }

        // Проверка типа файла
        if (!file.type.includes('audio/')) {
            alert('❌ Пожалуйста, выберите аудио файл');
            return;
        }

        const title = prompt('Название трека:', file.name.replace(/\.[^/.]+$/, ''));
        if (!title) return;
        
        const artist = prompt('Исполнитель:', 'Неизвестный');
        if (!artist) return;

        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('title', title);
        formData.append('artist', artist);

        try {
            console.log('Uploading to:', `${API_URL}/tracks`);
            console.log('File:', file.name, file.type, (file.size / 1024 / 1024).toFixed(2) + 'MB');
            
            const response = await axios.post(`${API_URL}/tracks`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000 // 30 секунд таймаут
            });
            
            console.log('Upload successful:', response.data);
            alert('✅ Трек успешно загружен!');
            fetchTracks();
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (error.code === 'ECONNABORTED') {
                alert('❌ Таймаут загрузки. Попробуйте файл поменьше.');
            } else {
                alert(`❌ Ошибка загрузки: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Удаление трека
    const deleteTrack = async (id) => {
        if (!confirm('Удалить этот трек?')) return;
        
        try {
            await axios.delete(`${API_URL}/tracks/${id}`);
            
            if (currentTrack?.id === id) {
                audioRef.current.pause();
                setCurrentTrack(null);
                setIsPlaying(false);
            }
            
            fetchTracks();
            alert('✅ Трек удален');
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Ошибка удаления');
        }
    };

    // Воспроизведение трека
    const playTrack = (track) => {
        try {
            if (currentTrack?.id === track.id) {
                if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                }
            } else {
                let audioUrl;
                if (track.url) {
                    audioUrl = track.url;
                } else {
                    audioUrl = `http://localhost:5002${track.path}`; // ИЗМЕНЕНО НА 5002!
                }
                
                console.log('Playing:', audioUrl);
                
                // Добавляем параметр для избегания кэширования
                if (!track.url) {
                    audioUrl += `?t=${Date.now()}`;
                }
                
                audioRef.current.src = audioUrl;
                audioRef.current.play()
                    .then(() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Playback error:', err);
                        alert('❌ Не удалось воспроизвести трек. Проверьте путь к файлу.');
                    });
            }
        } catch (error) {
            console.error('Play error:', error);
        }
    };

    // Обработчик выбора файла
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            uploadTrack(file);
        }
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #465ab1ff 0%, #764ba2 100%)'
        }}>
            {/* Шапка */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                background: 'rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                <h1 style={{ fontSize: '36px', color: 'white', margin: 0 }}>🎵 Audio Player</h1>
                <div style={{
                    padding: '10px 24px',
                    background: serverStatus.includes('✅') ? '#54b896ff' : '#810c0cff',
                    borderRadius: '30px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {serverStatus}
                </div>
            </div>

            {/* Кнопка загрузки */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{
                        padding: '14px 40px',
                        background: isUploading ? '#6b7280' : '#6dc2a5ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: isUploading ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isUploading ? '⏳ Загрузка...' : '📤 Загрузить трек'}
                </button>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Список треков */}
            <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ marginBottom: '24px', color: 'white', fontSize: '24px' }}>
                    🎧 Мои треки ({tracks.length})
                </h2>
                
                {tracks.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '16px'
                    }}>
                        🎵 Нет треков. Нажмите "Загрузить трек", чтобы добавить первый!
                    </div>
                ) : (
                    tracks.map((track, index) => (
                        <div
                            key={track.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                marginBottom: '8px',
                                background: currentTrack?.id === track.id 
                                    ? 'rgba(16, 185, 129, 0.2)' 
                                    : 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                transition: 'all 0.3s',
                                border: currentTrack?.id === track.id 
                                    ? '1px solid #63b398ff' 
                                    : '1px solid transparent'
                            }}
                        >
                            <span style={{ 
                                width: '40px', 
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </span>
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}>
                                    {track.title}
                                </div>
                                <div style={{ 
                                    color: 'rgba(255,255,255,0.7)', 
                                    fontSize: '14px' 
                                }}>
                                    {track.artist}
                                </div>
                                {track.size && (
                                    <div style={{ 
                                        color: 'rgba(255,255,255,0.5)', 
                                        fontSize: '12px',
                                        marginTop: '4px'
                                    }}>
                                        {(track.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => playTrack(track)}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: currentTrack?.id === track.id && isPlaying 
                                        ? '#10b981' 
                                        : 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginRight: '12px',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {currentTrack?.id === track.id && isPlaying ? '⏸' : '▶'}
                            </button>

                            <button
                                onClick={() => deleteTrack(track.id)}
                                style={{
                                    padding: '10px 16px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}
                            >
                                🗑 Удалить
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Плеер */}
            {currentTrack && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    maxWidth: '900px',
                    margin: '0 auto',
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(20px)',
                    padding: '20px 30px',
                    borderRadius: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '16px',
                            marginBottom: '4px'
                        }}>
                            {currentTrack.title}
                        </div>
                        <div style={{ 
                            fontSize: '14px', 
                            color: 'rgba(255,255,255,0.7)' 
                        }}>
                            {currentTrack.artist}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => {
                            if (isPlaying) {
                                audioRef.current.pause();
                                setIsPlaying(false);
                            } else {
                                audioRef.current.play();
                                setIsPlaying(true);
                            }
                        }}
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#5db99aff',
                            color: 'white',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                        }}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;