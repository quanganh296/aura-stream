import React, { useEffect, useRef } from 'react';
import { Heart, Share2, Trash2, Plus, Music } from 'lucide-react';
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
    clearQueue
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
      {/* 1. Left Column: Track Info Showcase */}
      <div className="player-showcase-column">
        <div className="showcase-cover-wrapper">
          <span className="showcase-badge">Trình phát nhạc - Đang phát</span>
          <TrackImage 
            src={currentTrack.cover_url} 
            alt={currentTrack.title} 
            className="showcase-cover-img" 
          />
        </div>
        
        <div className="showcase-meta">
          <h2>{currentTrack.title}</h2>
          <p>{currentTrack.artist_name} &bull; {currentTrack.album_name || '2024'}</p>
        </div>

        <div className="showcase-actions">
          <button 
            className={`btn-showcase-like ${likedSongIds.has(currentTrack.id) ? 'liked' : ''}`}
            onClick={() => toggleLike(currentTrack.id)}
          >
            <Heart size={16} fill={likedSongIds.has(currentTrack.id) ? '#ffffff' : 'none'} />
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
              .map((s, idx) => (
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
