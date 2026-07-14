import React, { useEffect, useRef } from 'react';
import { Share2, Trash2, Music, Play, Pause, SkipForward, SkipBack, Volume2, Settings, PlusCircle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import TrackImage from './TrackImage';
import '../styles/FullPlayer.css';

const FullPlayer = () => {
  const {
    currentTrack,
    queue,
    lyrics,
    activeLyricIndex,
    likedSongIds,
    toggleLike,
    playTrack,
    removeFromQueue,
    clearQueue,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration
  } = useAudio();

  const activeLineRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  // Auto-scroll active lyric line to center
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex]);

  if (!currentTrack) return null;

  // Helper to format seconds into m:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTrack.title,
        text: `Đang nghe bài hát ${currentTrack.title} của ${currentTrack.artist_name} trên Aura Stream!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Đã sao chép link chia sẻ bài hát: ${currentTrack.title} - ${currentTrack.artist_name}`);
    }
  };

  return (
    <div className="full-player-container animate-fade">
      {/* 1. Left Column: Track Info Showcase with Mini Player Overlay */}
      <div className="player-showcase-column">
        <div className="showcase-cover-wrapper">
          <TrackImage 
            src={currentTrack.cover_url} 
            alt={currentTrack.title} 
            className="showcase-cover-img" 
          />
          
          {/* Mini Player widget overlay matching the mockup in input_file_0 */}
          <div className="mini-player-overlay">
            <span className="mini-player-tag">Trình phát nhạc - Đang phát</span>
            
            {/* Inner visual card */}
            <div className="mini-player-card">
              <TrackImage 
                src={currentTrack.cover_url} 
                alt={currentTrack.title} 
                className="mini-card-cover-img" 
              />
              <div className="mini-player-meta">
                <h5>{currentTrack.title}</h5>
                <p>{currentTrack.artist_name}</p>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="mini-controls-row">
              <button className="mini-ctrl-btn" onClick={prevTrack} title="Trước">
                <SkipBack size={12} fill="currentColor" />
              </button>
              <button className="mini-ctrl-btn mini-toggle-btn" onClick={togglePlay} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" style={{ transform: 'translateX(0.5px)' }} />}
              </button>
              <button className="mini-ctrl-btn" onClick={nextTrack} title="Kế tiếp">
                <SkipForward size={12} fill="currentColor" />
              </button>
            </div>

            {/* Timeline Slider and volume icon */}
            <div className="mini-timeline-row">
              <div className="mini-slider-track">
                <div className="mini-slider-progress" style={{ width: `${percent}%` }}></div>
              </div>
              <div className="mini-utils-group">
                <Volume2 size={10} className="mini-util-icon" />
                <Settings size={10} className="mini-util-icon" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Left aligned metadata */}
        <div className="showcase-meta">
          <h2>{currentTrack.title}</h2>
          <p>{currentTrack.artist_name} &bull; {currentTrack.album_name || '2024'}</p>
        </div>

        {/* Action buttons matching mockup pill design */}
        <div className="showcase-actions">
          <button 
            className={`btn-showcase-like ${likedSongIds.has(currentTrack.id) ? 'liked' : ''}`}
            onClick={() => toggleLike(currentTrack.id)}
          >
            <PlusCircle size={16} />
            <span>Lưu vào thư viện</span>
          </button>
          
          <button className="btn-showcase-share" onClick={handleShare}>
            <Share2 size={16} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Column: Scrolling Lyrics */}
      <div className="player-lyrics-column">
        <div className="lyrics-header">
          <Mic2Icon />
          <span>Lời bài hát</span>
        </div>

        <div className="lyrics-scroller" ref={lyricsContainerRef}>
          {lyrics.length === 0 ? (
            <div className="no-lyrics">
              <p>Lời bài hát chưa có sẵn cho ca khúc này.</p>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  className={`lyric-line ${isActive ? 'active' : ''}`}
                >
                  {line.text}
                </p>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Right Column: Upcoming Queue */}
      <div className="player-queue-column">
        <div className="queue-header">
          <h3>Tiếp theo</h3>
          {queue.length > 0 && (
            <button className="btn-clear-queue" onClick={clearQueue}>Xoá hàng chờ</button>
          )}
        </div>

        <div className="queue-list-scroll">
          {queue.length <= 1 ? (
            <div className="empty-queue-msg">
              <Music size={24} />
              <p>Hàng chờ trống. Thêm bài hát từ thư viện.</p>
            </div>
          ) : (
            queue
              .filter(s => s.id !== currentTrack.id)
              .map(s => (
                <div 
                  key={s.id} 
                  className="queue-itemclickable clickable"
                  onClick={() => playTrack(s)}
                >
                  <TrackImage src={s.cover_url} alt={s.title} className="queue-item-img" />
                  <div className="queue-item-meta">
                    <h4>{s.title}</h4>
                    <p>{s.artist_name}</p>
                  </div>
                  <span className="queue-duration">{formatTime(s.duration_seconds)}</span>
                  <button 
                    className="btn-queue-remove" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(s.id);
                    }}
                    title="Xoá khỏi hàng chờ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

// Micro SVG helper
const Mic2Icon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ marginRight: '8px', color: '#a855f7' }}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export default FullPlayer;
