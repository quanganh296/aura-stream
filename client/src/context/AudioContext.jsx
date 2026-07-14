import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { songAPI, playlistAPI } from '../api';
import { useAuth } from './AuthContext';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Audio state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  // Playlist & Queue state
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState(new Set());
  
  // Lyrics state
  const [lyrics, setLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  // Audio HTML Element reference
  const audioRef = useRef(new Audio());
  const historyRecorded = useRef(false);

  // Initialize and update likes when user changes
  useEffect(() => {
    if (user) {
      fetchLikes();
    } else {
      setLikedSongIds(new Set());
      // Reset player on logout
      pause();
      setCurrentTrack(null);
      setQueue([]);
      setCurrentIndex(-1);
    }
  }, [user]);

  const fetchLikes = async () => {
    try {
      const likedSongs = await playlistAPI.getLikedSongs();
      setLikedSongIds(new Set(likedSongs.map(s => s.id)));
    } catch (err) {
      console.error('Error fetching liked songs', err);
    }
  };

  const toggleLike = async (songId) => {
    if (!user) return;
    const newLikes = new Set(likedSongIds);
    try {
      if (newLikes.has(songId)) {
        newLikes.delete(songId);
        setLikedSongIds(newLikes);
        await playlistAPI.unlikeSong(songId);
      } else {
        newLikes.add(songId);
        setLikedSongIds(newLikes);
        await playlistAPI.likeSong(songId);
      }
    } catch (err) {
      console.error('Error toggling like', err);
      // Revert state on error
      fetchLikes();
    }
  };

  // Sync volume with audio element
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Send history log if track played for 15 seconds
      if (user && currentTrack && audio.currentTime > 15 && !historyRecorded.current) {
        historyRecorded.current = true;
        songAPI.addHistory(currentTrack.id).catch(() => {});
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue, currentIndex, isShuffle, isRepeat, currentTrack, user]);

  // Sync lyrics highlight index based on currentTime
  useEffect(() => {
    if (!lyrics || lyrics.length === 0) {
      setActiveLyricIndex(-1);
      return;
    }
    
    // Find the current active line index
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(index);
  }, [currentTime, lyrics]);

  // Play a specific track
  const playTrack = async (track, newQueue = null) => {
    if (!track) return;
    
    // Setup queue
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(s => s.id === track.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      // Add to queue if not present, and update index
      const idx = queue.findIndex(s => s.id === track.id);
      if (idx === -1) {
        const updatedQueue = [...queue, track];
        setQueue(updatedQueue);
        setCurrentIndex(updatedQueue.length - 1);
      } else {
        setCurrentIndex(idx);
      }
    }

    try {
      // Fetch full details (including lyrics)
      const fullDetails = await songAPI.getById(track.id);
      setCurrentTrack(fullDetails);
      historyRecorded.current = false;

      // Set lyrics
      if (fullDetails.lyrics_json) {
        // SQL server JSON may return as string or object
        const parsedLyrics = typeof fullDetails.lyrics_json === 'string'
          ? JSON.parse(fullDetails.lyrics_json)
          : fullDetails.lyrics_json;
        setLyrics(parsedLyrics);
      } else {
        setLyrics([]);
      }

      // Load and play audio
      audioRef.current.src = fullDetails.audio_url;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  const play = () => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
    } else if (currentTrack) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    
    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * queue.length);
      playTrack(queue[randIdx]);
    } else {
      const nextIdx = (currentIndex + 1) % queue.length;
      playTrack(queue[nextIdx]);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    
    if (currentTime > 3) {
      // Restart current track if played > 3 seconds
      seek(0);
    } else {
      const prevIdx = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      playTrack(queue[prevIdx]);
    }
  };

  const addToQueue = (track) => {
    if (queue.some(s => s.id === track.id)) return;
    setQueue([...queue, track]);
    if (queue.length === 0) {
      setCurrentIndex(0);
      setCurrentTrack(track);
    }
  };

  const removeFromQueue = (songId) => {
    const idx = queue.findIndex(s => s.id === songId);
    if (idx === -1) return;

    const newQueue = queue.filter(s => s.id !== songId);
    setQueue(newQueue);

    if (newQueue.length === 0) {
      pause();
      setCurrentTrack(null);
      setCurrentIndex(-1);
    } else if (idx === currentIndex) {
      // Playing song got removed, play next
      const nextIdx = idx % newQueue.length;
      playTrack(newQueue[nextIdx], newQueue);
    } else if (idx < currentIndex) {
      // Adjust index
      setCurrentIndex(currentIndex - 1);
    }
  };

  const clearQueue = () => {
    pause();
    setQueue([]);
    setCurrentTrack(null);
    setCurrentIndex(-1);
    setLyrics([]);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      queue,
      isShuffle,
      isRepeat,
      likedSongIds,
      lyrics,
      activeLyricIndex,
      playTrack,
      play,
      pause,
      togglePlay,
      seek,
      changeVolume,
      toggleMute,
      nextTrack,
      prevTrack,
      addToQueue,
      removeFromQueue,
      clearQueue,
      setIsShuffle,
      setIsRepeat,
      toggleLike
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
