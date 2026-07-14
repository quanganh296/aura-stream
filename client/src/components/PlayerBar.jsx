import React from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart, 
  Volume2, VolumeX, ListMusic, Mic2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import TrackImage from './TrackImage';

const PlayerBar = ({ showFullPlayer, setShowFullPlayer }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    likedSongIds,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    setIsShuffle,
    setIsRepeat,
    toggleLike
  } = useAudio();

  // Helper to format seconds into m:ss
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressBarChange = (e) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <div className={`player-bar-container glass-panel ${showFullPlayer ? 'full-player-mode' : ''}`}>
      {showFullPlayer ? (
        /* Full Screen Player Layout (Lyrics Page Bottom Controls) */
        <div className="full-player-bar-layout">
          {/* Progress Timeline (Top Row, stretches wide) */}
          <div className="full-player-timeline-section">
            <div className="timeline-track full-width-timeline">
              <input 
                type="range" 
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressBarChange}
                style={{
                  background: `linear-gradient(to right, var(--accent-purple) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`
                }}
              />
            </div>
            <div className="timeline-time-row">
              <span className="time-txt">{formatTime(currentTime)}</span>
              <span className="time-txt">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Row containing Center controls and Right utilities */}
          <div className="full-player-controls-row">
            {/* Left spacer for visual balance (takes equivalent space of right side) */}
            <div className="controls-left-spacer"></div>

            {/* Playback Controls (Center) */}
            <div className="controls-buttons-row">
              <button 
                className={`control-btn ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Ngẫu nhiên"
              >
                <Shuffle size={16} />
              </button>
              
              <button className="control-btn" onClick={prevTrack} title="Trước">
                <SkipBack size={18} fill="currentColor" />
              </button>
              
              <button className="btn-player-toggle btn-player-toggle-circle" onClick={togglePlay} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                {isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" style={{ transform: 'translateX(1px)' }} />
                )}
              </button>
              
              <button className="control-btn" onClick={nextTrack} title="Kế tiếp">
                <SkipForward size={18} fill="currentColor" />
              </button>
              
              <button 
                className={`control-btn ${isRepeat ? 'active' : ''}`}
                onClick={() => setIsRepeat(!isRepeat)}
                title="Lặp lại"
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* Utility Settings Panel (Right) */}
            <div className="player-utility-panel">
              {/* Lyrics Toggle (highlighted purple in FullPlayer) */}
              <button 
                className="utility-btn active"
                onClick={() => setShowFullPlayer(false)}
                title="Đóng Lời bài hát"
              >
                <Mic2 size={16} />
              </button>

              {/* Queue Toggle */}
              <button 
                className="utility-btn"
                onClick={() => setShowFullPlayer(!showFullPlayer)}
                title="Hàng chờ tiếp theo"
              >
                <ListMusic size={18} />
              </button>

              {/* Volume Controls */}
              <div className="volume-slider-wrapper">
                <button className="utility-btn" onClick={toggleMute}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) ${(isMuted ? 0 : volume) * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Floating Dashboard Player Layout */
        <>
          {/* 1. Track Info (Left) */}
          <div className="player-track-info" onClick={() => setShowFullPlayer(true)}>
            <TrackImage 
              src={currentTrack.cover_url} 
              alt={currentTrack.title} 
              className="player-cover-img clickable" 
            />
            <div className="player-track-meta clickable">
              <h4>{currentTrack.title}</h4>
              <p>{currentTrack.artist_name}</p>
            </div>
            <button 
              className="btn-player-like"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack.id);
              }}
            >
              <Heart 
                size={18} 
                fill={likedSongIds.has(currentTrack.id) ? '#a855f7' : 'none'} 
                color={likedSongIds.has(currentTrack.id) ? '#a855f7' : '#e5e7eb'} 
              />
            </button>
          </div>

          {/* 2. Audio Control Panel (Middle) */}
          <div className="player-audio-controls">
            <div className="controls-buttons-row">
              <button 
                className={`control-btn ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Ngẫu nhiên"
              >
                <Shuffle size={16} />
              </button>
              
              <button className="control-btn" onClick={prevTrack} title="Trước">
                <SkipBack size={18} fill="currentColor" />
              </button>
              
              <button className="btn-player-toggle" onClick={togglePlay} title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                {isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" style={{ transform: 'translateX(1px)' }} />
                )}
              </button>
              
              <button className="control-btn" onClick={nextTrack} title="Kế tiếp">
                <SkipForward size={18} fill="currentColor" />
              </button>
              
              <button 
                className={`control-btn ${isRepeat ? 'active' : ''}`}
                onClick={() => setIsRepeat(!isRepeat)}
                title="Lặp lại"
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* Timeline Slider */}
            <div className="player-timeline-wrapper">
              <span className="time-txt">{formatTime(currentTime)}</span>
              <div className="timeline-track">
                <input 
                  type="range" 
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressBarChange}
                  style={{
                    background: `linear-gradient(to right, var(--accent-purple) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%)`
                  }}
                />
              </div>
              <span className="time-txt">{formatTime(duration)}</span>
            </div>
          </div>

          {/* 3. Utility Settings Panel (Right) */}
          <div className="player-utility-panel">
            {/* Lyrics Toggle */}
            <button 
              className={`utility-btn ${showFullPlayer ? 'active' : ''}`}
              onClick={() => setShowFullPlayer(!showFullPlayer)}
              title="Lời bài hát & Hàng chờ"
            >
              <Mic2 size={16} />
            </button>

            {/* Queue Toggle */}
            <button 
              className="utility-btn"
              onClick={() => setShowFullPlayer(!showFullPlayer)}
              title="Hàng chờ tiếp theo"
            >
              <ListMusic size={18} />
            </button>

            {/* Volume Controls */}
            <div className="volume-slider-wrapper">
              <button className="utility-btn" onClick={toggleMute}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerBar;
