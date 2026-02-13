import React, { useState, useRef } from 'react';

const UploadModal = ({ onClose, onUpload, isUploading }) => {
  const [step, setStep] = useState('select');
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    year: ''
  });
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.includes('audio/')) {
      setFile(file);
      setMetadata({
        ...metadata,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Неизвестный'
      });
      setStep('metadata');
    }
  };

  const handleUpload = async () => {
    setStep('uploading');
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(file, metadata);
      clearInterval(interval);
      setProgress(100);
      setStep('success');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setStep('select');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }} onClick={onClose}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '520px',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '32px',
        border: '1px solid #3a3a3a'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          ✕
        </button>

        {/* Шаг 1: Выбор файла */}
        {step === 'select' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              color: '#1db954',
              marginBottom: '20px'
            }}>
              🎵
            </div>
            <h2 style={{
              fontSize: '22px',
              color: '#fff',
              marginBottom: '8px',
              fontWeight: 600
            }}>
              Загрузить музыку
            </h2>
            <p style={{
              color: '#aaa',
              marginBottom: '32px',
              fontSize: '14px'
            }}>
              Перетащите файлы сюда или нажмите для выбора
            </p>
            
            <div
              onClick={() => fileInputRef.current.click()}
              style={{
                border: '2px dashed #3a3a3a',
                borderRadius: '12px',
                padding: '40px 20px',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '32px',
                color: '#666',
                marginBottom: '12px'
              }}>
                📤
              </div>
              <div style={{ color: '#fff', marginBottom: '8px' }}>
                Выберите аудио файл
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                MP3, WAV, M4A (макс. 100MB)
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Шаг 2: Метаданные */}
        {step === 'metadata' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: '#0a0a0a',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#2a2a2a',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🎵
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 500, marginBottom: '4px' }}>
                  {file?.name}
                </div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>
                  {(file?.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                  Название трека
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                  placeholder="Введите название"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ color: '#fff', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                  Исполнитель
                </label>
                <input
                  type="text"
                  value={metadata.artist}
                  onChange={(e) => setMetadata({...metadata, artist: e.target.value})}
                  placeholder="Введите имя исполнителя"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                    Альбом
                  </label>
                  <input
                    type="text"
                    value={metadata.album}
                    onChange={(e) => setMetadata({...metadata, album: e.target.value})}
                    placeholder="Название альбома"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                    Год
                  </label>
                  <input
                    type="text"
                    value={metadata.year}
                    onChange={(e) => setMetadata({...metadata, year: e.target.value})}
                    placeholder="2024"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px'
            }}>
              <button
                onClick={() => setStep('select')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2a2a2a',
                  color: '#fff',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Назад
              </button>
              <button
                onClick={handleUpload}
                disabled={!metadata.title || !metadata.artist}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: !metadata.title || !metadata.artist ? '#3a3a3a' : '#1db954',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !metadata.title || !metadata.artist ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Загрузить
              </button>
            </div>
          </div>
        )}

        {/* Шаг 3: Загрузка */}
        {step === 'uploading' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '32px', color: '#1db954' }}>
                {progress}%
              </span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>
              Загрузка файла...
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
              {file?.name}
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: '#2a2a2a',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#1db954',
                transition: 'width 0.2s'
              }} />
            </div>
          </div>
        )}

        {/* Шаг 4: Успех */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{
              fontSize: '64px',
              color: '#1db954',
              marginBottom: '20px'
            }}>
              ✓
            </div>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>
              Готово!
            </h2>
            <p style={{ color: '#aaa' }}>
              Трек успешно загружен
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;