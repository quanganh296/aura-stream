import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Compass, Library, PlusSquare, Heart, Search, Bell, Settings, LogOut, 
  Play, Plus, Music, HelpCircle, Check, Volume2, Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { songAPI, playlistAPI } from '../api';
import TrackImage from './TrackImage';
import ArtistImage from './ArtistImage';
import PlayerBar from './PlayerBar';
import FullPlayer from './FullPlayer';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    currentTrack, isPlaying, playTrack, togglePlay, likedSongIds, toggleLike 
  } = useAudio();

  const navigate = useNavigate();

  // Component states
  const [songs, setSongs] = useState([]);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [mixes, setMixes] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  
  // Navigation states
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'browse', 'library', 'liked'
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  // Redirect if logged out
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load initial dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const allSongs = await songAPI.getAll();
      setSongs(allSongs);

      const artists = await songAPI.getTrendingArtists();
      setTrendingArtists(artists);

      const items = await songAPI.getMixes();
      setMixes(items);

      const userPlaylists = await playlistAPI.getAll();
      setPlaylists(userPlaylists);

      refreshHistory();
      refreshLikedSongs();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const refreshHistory = async () => {
    try {
      const history = await songAPI.getHistory();
      setRecentlyPlayed(history);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const refreshLikedSongs = async () => {
    try {
      const liked = await playlistAPI.getLikedSongs();
      setLikedSongs(liked);
    } catch (err) {
      console.error('Error fetching liked songs list:', err);
    }
  };

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await songAPI.search(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreatePlaylist = async () => {
    const name = prompt('Nhập tên Playlist mới:');
    if (!name) return;
    try {
      const newPlaylist = await playlistAPI.create(name);
      setPlaylists([...playlists, newPlaylist]);
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  const handlePlayHero = () => {
    // Play "Ánh Đèn Đêm" (ID: 1) or first song as Hero track
    const heroTrack = songs.find(s => s.id === 1) || songs[0];
    if (heroTrack) {
      if (currentTrack?.id === heroTrack.id) {
        togglePlay();
      } else {
        playTrack(heroTrack, songs);
      }
    }
  };

  const handlePlayCard = (track, trackList) => {
    playTrack(track, trackList);
    // Refresh history soon after starting
    setTimeout(refreshHistory, 1000);
  };

  const handleLikeClick = async (e, songId) => {
    e.stopPropagation();
    await toggleLike(songId);
    refreshLikedSongs();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar glass-panel">
        <div className="sidebar-brand" onClick={() => { setActiveTab('home'); setShowFullPlayer(false); }}>
          <div className="sidebar-logo-icon">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <div>
            <h3>Aura Stream</h3>
            <p>Premium Audio</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'home' && !showFullPlayer ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setShowFullPlayer(false); }}
          >
            <Home size={20} />
            <span>Home</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => { setActiveTab('browse'); setShowFullPlayer(false); }}
          >
            <Compass size={20} />
            <span>Browse</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { setActiveTab('library'); setShowFullPlayer(false); }}
          >
            <Library size={20} />
            <span>Library</span>
          </div>
        </nav>

        <div className="sidebar-playlists">
          <p className="sidebar-title">YOUR PLAYLISTS</p>
          <div className="menu-item add-playlist" onClick={handleCreatePlaylist}>
            <PlusSquare size={20} />
            <span>Create Playlist</span>
          </div>
          <div 
            className={`menu-item liked-item ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => { setActiveTab('liked'); setShowFullPlayer(false); }}
          >
            <Heart size={20} fill={activeTab === 'liked' ? 'currentColor' : 'none'} />
            <span>Liked Songs</span>
          </div>

          <div className="custom-playlists-list">
            {playlists.map(p => (
              <div 
                key={p.id} 
                className="playlist-sub-item"
                onClick={() => {
                  setActiveTab(`playlist-${p.id}`);
                  setShowFullPlayer(false);
                }}
              >
                <Music size={14} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="user-logout" onClick={logout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header glass-panel">
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nghệ sĩ, bài hát..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="header-btn"><Bell size={18} /></button>
            <button className="header-btn"><Settings size={18} /></button>
            {user && (
              <div className="user-profile">
                <span className="username">{user.username}</span>
                <div className="avatar-circle">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="main-content-scroll">
          {showFullPlayer ? (
            <FullPlayer />
          ) : isSearching ? (
            /* Search Results View */
            <div className="view-section animate-fade">
              <h2 className="view-title">Kết quả tìm kiếm cho "{searchQuery}"</h2>
              {searchResults.length === 0 ? (
                <p className="empty-message">Không tìm thấy bài hát hay nghệ sĩ nào.</p>
              ) : (
                <div className="search-results-list">
                  {searchResults.map(s => (
                    <div 
                      key={s.id} 
                      className={`search-result-row clickable ${currentTrack?.id === s.id ? 'active' : ''}`}
                      onClick={() => handlePlayCard(s, searchResults)}
                    >
                      <TrackImage src={s.cover_url} alt={s.title} className="search-row-img" />
                      <div className="search-row-meta">
                        <h4>{s.title}</h4>
                        <p>{s.artist_name} &bull; {s.album_name || 'Đơn ca'}</p>
                      </div>
                      <button 
                        className="btn-row-like"
                        onClick={(e) => handleLikeClick(e, s.id)}
                      >
                        <Heart size={16} fill={likedSongIds.has(s.id) ? '#a855f7' : 'none'} color={likedSongIds.has(s.id) ? '#a855f7' : '#9ca3af'} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'home' ? (
            /* Dashboard Home View */
            <div className="view-section animate-fade">
              {/* Featured Release Hero */}
              <div className="hero-banner">
                <img src="/assets/concert_banner.png" alt="Concert Hero" className="hero-banner-img" />
                <div className="hero-overlay"></div>
                <div className="hero-banner-content">
                  <span className="badge-new">PHÁT HÀNH MỚI</span>
                  <h1>Neon Nights: The Evolution</h1>
                  <p>Khám phá hành trình âm thanh mới nhất của nghệ sĩ quốc tế được yêu thích nhất mùa hè này.</p>
                  <div className="hero-banner-actions">
                    <button className="btn-hero-play" onClick={handlePlayHero}>
                      <Play size={18} fill="currentColor" />
                      {currentTrack && isPlaying && songs.some(s => s.id === currentTrack.id && s.id === 1) ? 'Tạm Dừng' : 'Nghe Ngay'}
                    </button>
                    <button className="btn-hero-save">Lưu Album</button>
                  </div>
                </div>
              </div>

              {/* Recently Played */}
              <section className="dashboard-section">
                <div className="section-header">
                  <h3>Vừa Phát Gần Đây</h3>
                  <span className="see-all">Xem tất cả</span>
                </div>
                {recentlyPlayed.length === 0 ? (
                  <div className="empty-panel glass-panel">
                    <Music size={28} className="empty-icon" />
                    <p>Chưa có lịch sử phát. Hãy chọn nhạc để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="cards-scroll-container">
                    {recentlyPlayed.map(s => (
                      <div key={s.id} className="music-card glass-panel" onClick={() => handlePlayCard(s, recentlyPlayed)}>
                        <div className="card-image-wrapper">
                          <TrackImage src={s.cover_url} alt={s.title} className="card-img" />
                          <div className="card-play-overlay">
                            <button className="btn-card-play">
                              <Play size={20} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                        <h4>{s.title}</h4>
                        <p>{s.artist_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* For You mixes */}
              <section className="dashboard-section">
                <div className="section-header">
                  <h3>Dành Riêng Cho Bạn</h3>
                  <p className="subtitle">Dựa trên gu âm nhạc gần đây của bạn.</p>
                </div>
                <div className="mixes-grid">
                  {mixes.map(mix => (
                    <div 
                      key={mix.id} 
                      className="mix-card glass-panel clickable-card"
                      onClick={() => handlePlayCard(mix.songs[0], mix.songs)}
                    >
                      <div className="mix-header-box">
                        <div className="mix-glow-bg"></div>
                        <div className="mix-number">MIX {mix.id}</div>
                      </div>
                      <div className="mix-info">
                        <h4>{mix.title}</h4>
                        <p>{mix.description}</p>
                      </div>
                      <button className="btn-mix-listen">
                        <Play size={14} fill="currentColor" /> NGHE NGAY
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending Artists */}
              <section className="dashboard-section">
                <div className="section-header">
                  <h3>Nghệ Sĩ Thịnh Hành</h3>
                </div>
                <div className="artists-scroll-container">
                  {trendingArtists.map(artist => (
                    <div 
                      key={artist.id} 
                      className="artist-card" 
                      onClick={async () => {
                        // Play artist's songs if clicked
                        const artistSongs = songs.filter(s => s.artist_id === artist.id);
                        if (artistSongs.length > 0) {
                          handlePlayCard(artistSongs[0], artistSongs);
                        } else {
                          alert(`Nghệ sĩ: ${artist.name}`);
                        }
                      }}
                    >
                      <ArtistImage src={artist.avatar_url} name={artist.name} className="artist-avatar-img" size="110px" />
                      <h4>{artist.name}</h4>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : activeTab === 'browse' ? (
            /* Browse All Songs View */
            <div className="view-section animate-fade">
              <h2 className="view-title">Khám Phá Bài Hát</h2>
              <div className="songs-grid-list">
                {songs.map(s => (
                  <div key={s.id} className="song-grid-card glass-panel" onClick={() => handlePlayCard(s, songs)}>
                    <div className="card-image-wrapper">
                      <TrackImage src={s.cover_url} alt={s.title} className="card-img" />
                      <div className="card-play-overlay">
                        <button className="btn-card-play"><Play size={20} fill="currentColor" /></button>
                      </div>
                    </div>
                    <h4>{s.title}</h4>
                    <p>{s.artist_name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'library' ? (
            /* Library View (User Playlists & Custom Creations) */
            <div className="view-section animate-fade">
              <div className="library-header-row">
                <h2 className="view-title">Thư Viện Của Bạn</h2>
                <button className="btn-create-playlist-lg" onClick={handleCreatePlaylist}>
                  <Plus size={16} /> Tạo Playlist Mới
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="empty-panel glass-panel">
                  <PlusSquare size={36} className="empty-icon" />
                  <p>Bạn chưa tạo playlist nào. Hãy tạo một playlist để thêm nhạc yêu thích.</p>
                </div>
              ) : (
                <div className="library-playlists-grid">
                  {playlists.map(p => (
                    <div 
                      key={p.id} 
                      className="playlist-grid-card glass-panel clickable-card"
                      onClick={() => setActiveTab(`playlist-${p.id}`)}
                    >
                      <div className="playlist-cover-fallback">
                        <Music size={32} />
                      </div>
                      <h4>{p.name}</h4>
                      <p>{p.is_private ? 'Riêng tư' : 'Công khai'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'liked' ? (
            /* Liked Songs View */
            <div className="view-section animate-fade">
              <h2 className="view-title">Bài Hát Đã Thích</h2>
              {likedSongs.length === 0 ? (
                <div className="empty-panel glass-panel">
                  <Heart size={36} className="empty-icon text-red" />
                  <p>Bạn chưa thích bài hát nào. Nhấn tim ở các bài hát để thêm vào đây.</p>
                </div>
              ) : (
                <div className="search-results-list">
                  {likedSongs.map((s, idx) => (
                    <div 
                      key={s.id} 
                      className={`search-result-row clickable ${currentTrack?.id === s.id ? 'active' : ''}`}
                      onClick={() => handlePlayCard(s, likedSongs)}
                    >
                      <span className="row-number">{idx + 1}</span>
                      <TrackImage src={s.cover_url} alt={s.title} className="search-row-img" />
                      <div className="search-row-meta">
                        <h4>{s.title}</h4>
                        <p>{s.artist_name} &bull; {s.album_name || 'Đơn ca'}</p>
                      </div>
                      <button 
                        className="btn-row-like"
                        onClick={(e) => handleLikeClick(e, s.id)}
                      >
                        <Heart size={16} fill="#a855f7" color="#a855f7" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab.startsWith('playlist-') ? (
            /* Playlist Detail View */
            <PlaylistDetailView 
              playlistId={activeTab.split('-')[1]} 
              allSongs={songs}
              handlePlayCard={handlePlayCard}
              handleLikeClick={handleLikeClick}
              likedSongIds={likedSongIds}
            />
          ) : null}
        </div>
      </main>

      {/* Bottom Music Player Controller */}
      <PlayerBar 
        showFullPlayer={showFullPlayer} 
        setShowFullPlayer={setShowFullPlayer} 
      />
    </div>
  );
};

// Sub-component for Playlist Details
const PlaylistDetailView = ({ playlistId, allSongs, handlePlayCard, handleLikeClick, likedSongIds }) => {
  const [playlist, setPlaylist] = useState(null);
  const [songsToAdd, setSongsToAdd] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      const data = await playlistAPI.getById(playlistId);
      setPlaylist(data);
      
      // Filter songs that are not in this playlist yet
      const currentSongIds = new Set((data.songs || []).map(s => s.id));
      setSongsToAdd(allSongs.filter(s => !currentSongIds.has(s.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSong = async (songId) => {
    try {
      await playlistAPI.addSong(playlistId, songId);
      loadPlaylist();
      setShowAddMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSong = async (e, songId) => {
    e.stopPropagation();
    try {
      await playlistAPI.removeSong(playlistId, songId);
      loadPlaylist();
    } catch (err) {
      console.error(err);
    }
  };

  if (!playlist) return <p className="loading-txt">Đang tải...</p>;

  return (
    <div className="view-section animate-fade">
      <div className="playlist-detail-header">
        <div className="playlist-detail-cover">
          <Music size={48} />
        </div>
        <div className="playlist-detail-info">
          <span className="tag-playlist">PLAYLIST</span>
          <h2>{playlist.name}</h2>
          <p>{playlist.songs?.length || 0} bài hát &bull; Tạo bởi bạn</p>
        </div>
      </div>

      <div className="playlist-actions-row">
        {playlist.songs?.length > 0 && (
          <button 
            className="btn-playlist-play" 
            onClick={() => handlePlayCard(playlist.songs[0], playlist.songs)}
          >
            <Play size={20} fill="currentColor" /> PHÁT TẤT CẢ
          </button>
        )}
        <button 
          className="btn-add-music-toggle"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          {showAddMenu ? 'Đóng Menu' : 'Thêm Bài Hát'}
        </button>
      </div>

      {showAddMenu && (
        <div className="add-songs-dropdown glass-panel">
          <h4>Chọn bài hát để thêm:</h4>
          {songsToAdd.length === 0 ? (
            <p className="no-add-songs">Tất cả bài hát hiện tại đã được thêm vào playlist.</p>
          ) : (
            <div className="dropdown-scroll">
              {songsToAdd.map(s => (
                <div key={s.id} className="dropdown-row" onClick={() => handleAddSong(s.id)}>
                  <TrackImage src={s.cover_url} alt={s.title} className="row-img-mini" />
                  <div className="row-meta-mini">
                    <h5>{s.title}</h5>
                    <p>{s.artist_name}</p>
                  </div>
                  <Plus size={14} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {playlist.songs?.length === 0 ? (
        <div className="empty-panel glass-panel">
          <Music size={32} className="empty-icon" />
          <p>Playlist trống. Nhấn "Thêm Bài Hát" để chèn nhạc.</p>
        </div>
      ) : (
        <div className="search-results-list">
          {playlist.songs.map((s, idx) => (
            <div 
              key={s.id} 
              className="search-result-row clickable"
              onClick={() => handlePlayCard(s, playlist.songs)}
            >
              <span className="row-number">{idx + 1}</span>
              <TrackImage src={s.cover_url} alt={s.title} className="search-row-img" />
              <div className="search-row-meta">
                <h4>{s.title}</h4>
                <p>{s.artist_name} &bull; {s.album_name || 'Đơn ca'}</p>
              </div>
              <div className="row-right-actions">
                <button 
                  className="btn-row-like"
                  onClick={(e) => handleLikeClick(e, s.id)}
                >
                  <Heart size={16} fill={likedSongIds.has(s.id) ? '#a855f7' : 'none'} color={likedSongIds.has(s.id) ? '#a855f7' : '#9ca3af'} />
                </button>
                <button 
                  className="btn-row-remove"
                  onClick={(e) => handleRemoveSong(e, s.id)}
                  title="Xoá khỏi playlist"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
