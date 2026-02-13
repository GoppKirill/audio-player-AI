import React, { useState, useRef, useEffect } from 'react';

const Player = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  volume = 0.7,
  onVolumeChange,
  currentTime = 0,
  duration = 0,
  onSeek,
  playbackSpeed = 1,
  onSpeedChange
}) => {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizer, setEqualizer] = useState([0.5, 0.5, 0.5, 0.5, 0.5]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Эффект для визуализатора
  useEffect(() => {
    let animationFrame;
    if (isPlaying) {
      const updateVisualizer = () => {
        setVisualizerBars(prev => {
          return prev.map(() => Math.random() * 0.8 + 0.2);
        });
        animationFrame = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    onSeek?.(newTime);
  };

  const handleProgressMove = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    setTooltipTime(percentage * duration);
    setShowTimeTooltip(true);
  };

  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, x / width));
    onVolumeChange?.(newVolume);
    setPrevVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange?.(prevVolume);
    } else {
      setPrevVolume(volume);
      onVolumeChange?.(0);
    }
    setIsMuted(!isMuted);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.6) return '🔉';
    return '🔊';
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one': return '🔂';
      case 'all': return '🔁';
      default: return '↪️';
    }
  };

  if (!currentTrack) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 260,
        right: 0,
        height: '90px',
        background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderTop: '2px solid #1db954',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        gap: '12px'
      }}>
        <span style={{ fontSize: '28px', opacity: 0.5 }}>🎵</span>
        <span style={{ fontSize: '16px' }}>Выберите трек для воспроизведения</span>
      </div>
    );
  }

  return (
    <>
      {/* Визуализатор */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        left: 260,
        right: 0,
        height: '40px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '4px',
        padding: '0 20px',
        pointerEvents: 'none',
        zIndex: 99
      }}>
        {visualizerBars.map((height, i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: `${Math.max(4, height * 40)}px`,
              background: `linear-gradient(180deg, #1db954, ${i % 2 === 0 ? '#4CAF50' : '#81C784'})`,
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.1s ease',
              opacity: isPlaying ? 1 : 0.3
            }}
          />
        ))}
      </div>

      {/* Основной плеер */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 260,
        right: 0,
        height: '90px',
        background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderTop: '2px solid #1db954',
        display: 'grid',
        gridTemplateColumns: '1.5fr 2fr 1.5fr',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 100,
        boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Левая часть - Информация о треке */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1db954, #0a5c2a)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(29,185,84,0.3)',
            animation: isPlaying ? 'pulse 2s infinite' : 'none'
          }}>
            🎵
          </div>
          
          <div>
            <div style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {currentTrack.title}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: isFavorite ? '#1db954' : '#666'
                }}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
            <div style={{ color: '#999', fontSize: '14px' }}>
              {currentTrack.artist}
            </div>
          </div>
        </div>

        {/* Центральная часть - Управление */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Кнопки управления */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: isShuffle ? '#1db954' : '#666',
                transition: 'all 0.2s'
              }}
            >
              🔀
            </button>

            <button
              onClick={onPrevious}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#fff',
                opacity: 0.8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.8}
            >
              ⏮
            </button>

            <button
              onClick={onTogglePlay}
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(145deg, #1db954, #169c46)',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(29,185,84,0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              onClick={onNext}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#fff',
                opacity: 0.8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.8}
            >
              ⏭
            </button>

            <button
              onClick={() => setRepeatMode(prev => {
                if (prev === 'none') return 'all';
                if (prev === 'all') return 'one';
                return 'none';
              })}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: repeatMode !== 'none' ? '#1db954' : '#666',
                transition: 'all 0.2s'
              }}
            >
              {getRepeatIcon()}
            </button>
          </div>

          {/* Прогресс-бар */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%'
          }}>
            <span style={{ color: '#999', fontSize: '12px', minWidth: '40px' }}>
              {formatTime(currentTime)}
            </span>

            <div
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseMove={handleProgressMove}
              onMouseEnter={() => setIsProgressHovered(true)}
              onMouseLeave={() => {
                setIsProgressHovered(false);
                setShowTimeTooltip(false);
              }}
              style={{
                flex: 1,
                height: '6px',
                background: '#333',
                borderRadius: '3px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div style={{
                width: `${(currentTime / duration) * 100 || 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1db954, #4CAF50)',
                borderRadius: '3px',
                position: 'relative',
                transition: 'width 0.1s'
              }}>
                {isProgressHovered && (
                  <div style={{
                    position: 'absolute',
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    background: '#fff',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }} />
                )}
              </div>

              {showTimeTooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: `${(tooltipTime / duration) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: '#1db954',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                  {formatTime(tooltipTime)}
                </div>
              )}
            </div>

            <span style={{ color: '#999', fontSize: '12px', minWidth: '40px' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Правая часть - Дополнительные функции */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '15px'
        }}>
          {/* Скорость воспроизведения */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              style={{
                background: showSpeedMenu ? '#1db954' : 'none',
                border: '1px solid #333',
                borderRadius: '20px',
                padding: '5px 12px',
                color: showSpeedMenu ? '#fff' : '#999',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ⚡ {playbackSpeed}x
            </button>

            {showSpeedMenu && (
              <div style={{
                position: 'absolute',
                bottom: '40px',
                right: 0,
                background: '#2a2a2a',
                borderRadius: '8px',
                padding: '5px',
                border: '1px solid #333',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                zIndex: 101
              }}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => {
                      onSpeedChange?.(speed);
                      setShowSpeedMenu(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 20px',
                      background: playbackSpeed === speed ? '#1db954' : 'none',
                      border: 'none',
                      color: playbackSpeed === speed ? '#fff' : '#999',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderRadius: '4px'
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Эквалайзер */}
          <button
            onClick={() => setShowEqualizer(!showEqualizer)}
            style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: '20px',
              padding: '5px 12px',
              color: showEqualizer ? '#1db954' : '#999',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📊 EQ
          </button>

          {/* Громкость */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <button
              onClick={toggleMute}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                color: '#fff',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getVolumeIcon()}
            </button>

            {isVolumeHovered && (
              <div style={{
                position: 'absolute',
                bottom: '50px',
                right: 0,
                background: '#2a2a2a',
                borderRadius: '20px',
                padding: '15px 10px',
                border: '1px solid #333',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                zIndex: 101
              }}>
                <div
                  ref={volumeRef}
                  onClick={handleVolumeClick}
                  style={{
                    width: '100px',
                    height: '6px',
                    background: '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: `${(isMuted ? 0 : volume) * 100}%`,
                    height: '100%',
                    background: '#1db954',
                    borderRadius: '3px'
                  }} />
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}>
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Эквалайзер */}
      {showEqualizer && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          background: '#2a2a2a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333',
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          zIndex: 102,
          width: '300px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ color: '#fff', margin: 0 }}>Эквалайзер</h3>
            <button
              onClick={() => setShowEqualizer(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {['60', '230', '910', '3.5k', '14k'].map((freq, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={equalizer[i]}
                  onChange={(e) => {
                    const newEQ = [...equalizer];
                    newEQ[i] = parseFloat(e.target.value);
                    setEqualizer(newEQ);
                  }}
                  style={{
                    width: '30px',
                    height: '150px',
                    writingMode: 'vertical-lr',
                    direction: 'rtl'
                  }}
                />
                <div style={{ color: '#999', fontSize: '10px', marginTop: '5px' }}>
                  {freq}
                </div>
                <div style={{ color: '#1db954', fontSize: '12px' }}>
                  {Math.round(equalizer[i] * 100)}%
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setEqualizer([0.5, 0.5, 0.5, 0.5, 0.5])}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '8px',
              background: '#1db954',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Сбросить
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 4px 15px rgba(29,185,84,0.3); }
          50% { box-shadow: 0 4px 25px rgba(29,185,84,0.6); }
          100% { box-shadow: 0 4px 15px rgba(29,185,84,0.3); }
        }
      `}</style>
    </>
  );
};

export default Player;