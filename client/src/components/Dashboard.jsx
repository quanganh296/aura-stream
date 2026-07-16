import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Compass, Library, Heart, Search, Bell, Settings, LogOut, 
  Play, Plus, Music, Check, User, ListMusic,
  ChevronRight, Sliders, Megaphone
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
  const [librarySubTab, setLibrarySubTab] = useState('liked'); // 'liked', 'playlists', 'albums', 'artists'
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  
  // Custom Playlist creation states
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Settings states (Lifting state)
  const [volumeNormalization, setVolumeNormalization] = useState(true);
  const [qualityLevel, setQualityLevel] = useState(3); // 0: DATA SAVER, 1: NORMAL, 2: HIGH, 3: ULTRA HD
  const qualityLabels = ['DATA SAVER', 'NORMAL', 'HIGH', 'ULTRA HD (LOSSLESS)'];

  // Lyrics Manual Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtistId, setUploadArtistId] = useState(1);
  const [uploadAlbumName, setUploadAlbumName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLyricsFile, setUploadLyricsFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Automatically update default upload artist when artists list changes
  useEffect(() => {
    if (trendingArtists.length > 0) {
      setUploadArtistId(trendingArtists[0].id);
    }
  }, [trendingArtists]);

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

  const handleCreatePlaylist = () => {
    setNewPlaylistName('');
    setShowCreatePlaylistModal(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadLyricsFile) {
      alert('Vui lòng chọn cả tệp nhạc và tệp lời bài hát!');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Đang chuẩn bị tệp tin tải lên...');

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('artist_id', uploadArtistId);
    formData.append('album_name', uploadAlbumName || 'Single');
    formData.append('audio', uploadFile);
    formData.append('lyrics', uploadLyricsFile);

    try {
      setUploadStatus('Đang tải tệp nhạc và lời bài hát lên máy chủ để xử lý đồng bộ...');
      await songAPI.upload(formData);
      
      setIsUploading(false);
      setShowUploadModal(false);
      
      // Clear inputs
      setUploadTitle('');
      setUploadAlbumName('');
      setUploadFile(null);
      setUploadLyricsFile(null);
      
      alert('Tải bài hát và lời bài hát lên thành công! Lời nhạc đã được đồng bộ hóa.');
      fetchDashboardData(); // Refresh song listings
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert(`Lỗi khi tải nhạc và lời bài hát: ${err.message}`);
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
    <div className={`dashboard-container ${showFullPlayer ? 'full-player-active' : ''}`}>
      {/* Sidebar Navigation - Hidden when in full player mode per mockup */}
      {!showFullPlayer && (
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
              <span>Discover</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => { setActiveTab('library'); setShowFullPlayer(false); }}
            >
              <Library size={20} />
              <span>Library</span>
            </div>
            <div 
              className={`menu-item ${activeTab === 'playlists' ? 'active' : ''}`}
              onClick={() => { 
                setActiveTab('playlists');
                setShowFullPlayer(false); 
              }}
            >
              <ListMusic size={20} />
              <span>Playlists</span>
            </div>
            <div 
              className={`menu-item liked-item ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => { setActiveTab('liked'); setShowFullPlayer(false); }}
            >
              <Heart size={20} fill={activeTab === 'liked' ? 'currentColor' : 'none'} />
              <span>Liked Songs</span>
            </div>
          </nav>

          <div className="sidebar-playlists">
            <div className="custom-playlists-list">
              {playlists.map(p => (
                <div 
                  key={p.id} 
                  className={`playlist-sub-item ${activeTab === `playlist-${p.id}` ? 'active' : ''}`}
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
      )}

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header glass-panel">
          {showFullPlayer ? (
            /* Left Logo in Header when full player is active */
            <div className="header-logo" onClick={() => setShowFullPlayer(false)}>
              <div className="logo-icon header-logo-icon">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </div>
              <span className="logo-text">Aura Stream</span>
            </div>
          ) : (
            /* Left Search Box in standard view */
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nghệ sĩ, bài hát..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="header-actions">
            {showFullPlayer && (
              <button className="header-btn" onClick={() => setShowFullPlayer(false)} title="Tìm kiếm">
                <Search size={18} />
              </button>
            )}
            <div className="notification-bell-container" style={{ position: 'relative' }}>
              <button 
                className={`header-btn ${showNotificationsDropdown ? 'active' : ''}`} 
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                }} 
                title="Thông báo"
              >
                <Bell size={18} />
              </button>
              
              {showNotificationsDropdown && (
                <div className="reminder-notifications-dropdown glass-panel animate-fade">
                  <div className="reminder-notif-header">
                    <h4>Thông báo</h4>
                    <button className="btn-mark-read" onClick={() => setShowNotificationsDropdown(false)}>ĐÁNH DẤU ĐÃ ĐỌC</button>
                  </div>
                  
                  {/* Promo Banner inside dropdown */}
                  <div className="reminder-notif-promo">
                    <span>Nghe nhạc chất lượng Lossless</span>
                    <div className="promo-actions">
                      <button className="btn-promo-action" onClick={() => { setShowNotificationsDropdown(false); setActiveTab('settings'); }}>Nghe ngay</button>
                      <button className="btn-promo-close" onClick={() => setShowNotificationsDropdown(false)}>&times;</button>
                    </div>
                  </div>
                  
                  <div className="reminder-notif-list">
                    <div className="reminder-notif-item">
                      <div className="reminder-notif-icon-circle user-circle-bg">
                        <User size={14} />
                      </div>
                      <div className="reminder-notif-text">
                        <p>Playlist <strong>"Lofi Chill"</strong> của bạn có người theo dõi mới</p>
                        <span className="reminder-notif-time">5 giờ trước</span>
                      </div>
                    </div>
                    
                    <div className="reminder-notif-item">
                      <div className="reminder-notif-icon-circle megaphone-circle-bg">
                        <Megaphone size={14} />
                      </div>
                      <div className="reminder-notif-text">
                        <p>Cập nhật hệ thống: Trải nghiệm âm thanh <strong>Lossless</strong> đã sẵn sàng</p>
                        <span className="reminder-notif-time">Hôm qua</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="reminder-notif-footer">
                    <button className="btn-view-all-notifs" onClick={() => setShowNotificationsDropdown(false)}>Xem tất cả thông báo</button>
                  </div>
                </div>
              )}
            </div>

            <button className="header-btn" onClick={() => { setActiveTab('profile'); setShowFullPlayer(false); setShowNotificationsDropdown(false); }} title="Cài đặt">
              <Settings size={18} />
            </button>
            {user && (
              <div className="user-profile clickable" onClick={() => { setActiveTab('profile'); setShowFullPlayer(false); setShowNotificationsDropdown(false); }} title="Hồ sơ cá nhân">
                {/* Profile image with no username text per mockup */}
                <div className="avatar-circle-wrapper">
                  <img 
                    src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                    alt="Avatar" 
                    className="user-profile-avatar-img" 
                  />
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
                <img src="./assets/concert_banner.png" alt="Concert Hero" className="hero-banner-img" />
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
                <div className="section-header for-you-header">
                  <div>
                    <h3>Dành Riêng Cho Bạn</h3>
                    <p className="subtitle">Dựa trên gu âm nhạc gần đây của bạn.</p>
                  </div>
                  <button className="btn-section-action-plus" title="Thêm gợi ý"><Plus size={18} /></button>
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
                      onClick={() => {
                        setActiveTab(`artist-${artist.id}`);
                        setShowFullPlayer(false);
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
            /* Reworked Library View to match mockup schema */
            <UserLibraryView 
              playlists={playlists}
              likedSongs={likedSongs}
              songs={songs}
              trendingArtists={trendingArtists}
              handlePlayCard={handlePlayCard}
              handleCreatePlaylist={handleCreatePlaylist}
              setActiveTab={setActiveTab}
              setShowUploadModal={setShowUploadModal}
              activeSubTab={librarySubTab}
              setActiveSubTab={setLibrarySubTab}
            />
          ) : activeTab === 'playlists' ? (
            /* Dedicated Playlists Grid View */
            <UserPlaylistsView 
              playlists={playlists}
              handleCreatePlaylist={handleCreatePlaylist}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === 'profile' ? (
            /* User Profile View */
            <UserProfileView 
              user={user}
              recentlyPlayed={recentlyPlayed}
              handlePlayCard={handlePlayCard}
              volumeNormalization={volumeNormalization}
              setVolumeNormalization={setVolumeNormalization}
              qualityLevel={qualityLevel}
              setQualityLevel={setQualityLevel}
              qualityLabels={qualityLabels}
            />
          ) : activeTab.startsWith('artist-') ? (
            /* Artist Profile View */
            <ArtistProfileView 
              artistId={activeTab.split('-')[1]}
              songs={songs}
              trendingArtists={trendingArtists}
              handlePlayCard={handlePlayCard}
              setActiveTab={setActiveTab}
            />
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

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="upload-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="upload-modal-container glass-panel animate-fade" style={{ maxWidth: '400px' }}>
            <div className="upload-modal-header">
              <h3>Tạo Playlist Mới</h3>
              <button className="btn-close-modal" onClick={() => setShowCreatePlaylistModal(false)}>&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newPlaylistName.trim()) return;
              try {
                const newPlaylist = await playlistAPI.create(newPlaylistName.trim());
                setPlaylists([...playlists, newPlaylist]);
                setShowCreatePlaylistModal(false);
              } catch (err) {
                console.error('Error creating playlist:', err);
              }
            }} className="upload-form">
              <div className="form-group">
                <label>Tên Playlist</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nhập tên playlist của bạn..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-upload-submit">Tạo Playlist</button>
            </form>
          </div>
        </div>
      )}

      {/* Song & Lyrics Upload Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal-container glass-panel animate-fade">
            <div className="upload-modal-header">
              <h3>Tải lên Bài hát & Lời bài hát</h3>
              <button className="btn-close-modal" onClick={() => { if (!isUploading) setShowUploadModal(false); }}>&times;</button>
            </div>
            
            {isUploading ? (
              <div className="upload-loading-view">
                <div className="ai-pulse-spinner"></div>
                <h4>Hệ thống đang xử lý tệp...</h4>
                <p className="loading-subtext">{uploadStatus}</p>
                <div className="ai-disclaimer">
                  Hệ thống đang tải lên tệp nhạc và tệp lời bài hát của bạn, đo đạc thời lượng chính xác và xử lý đồng bộ hóa. Quá trình này sẽ hoàn tất trong giây lát. Vui lòng không đóng cửa sổ này!
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="upload-form">
                <div className="form-group">
                  <label>Tiêu đề bài hát *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Nhập tên bài hát"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Nghệ sĩ hát *</label>
                  <select 
                    value={uploadArtistId} 
                    onChange={(e) => setUploadArtistId(Number(e.target.value))}
                  >
                    {trendingArtists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Album (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="Single"
                    value={uploadAlbumName}
                    onChange={(e) => setUploadAlbumName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Tệp nhạc (MP3, MP4, WAV) *</label>
                  <input 
                    type="file" 
                    required 
                    accept=".mp3,.mp4,.wav,.m4a"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                  <small className="file-hint">Hỗ trợ các định dạng mp3, wav, m4a, mp4.</small>
                </div>

                <div className="form-group">
                  <label>Tệp lời bài hát (TXT, LRC) *</label>
                  <input 
                    type="file" 
                    required 
                    accept=".txt,.lrc"
                    onChange={(e) => setUploadLyricsFile(e.target.files[0])}
                  />
                  <small className="file-hint">Tải lên tệp .lrc để chạy chữ chuẩn khớp từng giây, hoặc tệp .txt thường để hệ thống tự phân bổ đều câu hát.</small>
                </div>
                
                <button type="submit" className="btn-upload-submit">
                  Tải lên & Đồng bộ lời bài hát
                </button>
              </form>
            )}
          </div>
        </div>
      )}
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

// Sub-component for User Profile View
// Sub-component for User Profile View
const UserProfileView = ({ user, recentlyPlayed, handlePlayCard, volumeNormalization, setVolumeNormalization, qualityLevel, setQualityLevel, qualityLabels }) => {
  const { updateUser } = useAuth();
  
  // Edit states
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateUser({ email: newEmail.trim() });
      setSuccessMsg('Đã cập nhật email thành công!');
      setTimeout(() => {
        setShowEditEmail(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateUser({ username: newName.trim() });
      setSuccessMsg('Đã cập nhật tên hiển thị thành công!');
      setTimeout(() => {
        setShowEditName(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateUser({ password: newPassword });
      setSuccessMsg('Đã đổi mật khẩu thành công!');
      setNewPassword('');
      setTimeout(() => {
        setShowEditPassword(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page-view animate-fade">
      {/* Hero Header */}
      <div className="profile-hero-row">
        <div className="profile-user-card glass-panel">
          <div className="profile-avatar-box">
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
              alt="Avatar" 
              className="profile-user-avatar" 
            />
          </div>
          <div className="profile-user-info">
            <span className="user-badge">PROFESSIONAL LISTENER</span>
            <h2>{user?.username || 'Minh Tú'}</h2>
            <div className="followers-stats">
              <span><strong>1.2k</strong> Following</span>
              <span className="dot-separator">&bull;</span>
              <span><strong>4.8k</strong> Followers</span>
            </div>
          </div>
          <div className="profile-wave-graphic">
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
          </div>
        </div>
        
        <div className="profile-premium-card glass-panel">
          <div className="premium-header">
            <h3>Aura Premium Status</h3>
            <span className="premium-star-badge">★</span>
          </div>
          <p>Account level: Active</p>
          <div className="renewal-info">
            <span className="renewal-label">MEMBER SINCE</span>
            <span className="renewal-date">Jan 12, 2025</span>
          </div>
        </div>
      </div>

      {/* Settings Grid (Merged back) */}
      <div className="profile-settings-grid" style={{ marginTop: '2rem' }}>
        {/* Account Settings */}
        <div className="settings-card glass-panel">
          <div className="card-header-row">
            <User size={18} className="purple-icon" />
            <h4>Account Settings (Click to Edit)</h4>
          </div>
          <div className="settings-list">
            <div className="settings-item clickable" onClick={() => { setNewEmail(user?.email || ''); setShowEditEmail(true); }}>
              <div className="item-meta">
                <span className="item-label">Email Address</span>
                <span className="item-value">{user?.email || 'minhtu.music@aurastream.com'}</span>
              </div>
              <ChevronRight size={16} />
            </div>
            
            <div className="settings-item clickable" onClick={() => { setNewName(user?.username || ''); setShowEditName(true); }}>
              <div className="item-meta">
                <span className="item-label">Display Name</span>
                <span className="item-value">{user?.username || 'Minh Tú'}</span>
              </div>
              <ChevronRight size={16} />
            </div>
            
            <div className="settings-item clickable" onClick={() => { setNewPassword(''); setShowEditPassword(true); }}>
              <div className="item-meta">
                <span className="item-label">Privacy & Security</span>
                <span className="item-value">Change Password / Security Controls</span>
              </div>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* Audio Quality Settings */}
        <div className="settings-card glass-panel">
          <div className="card-header-row">
            <Sliders size={18} className="purple-icon" />
            <h4>Audio Quality</h4>
          </div>
          
          <div className="quality-setting-block">
            <div className="quality-meta-row">
              <span className="label">Streaming Quality</span>
              <span className="val-highlight">{qualityLabels[qualityLevel]}</span>
            </div>
            
            <div className="quality-slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max="3" 
                value={qualityLevel} 
                onChange={(e) => setQualityLevel(parseInt(e.target.value))}
                className="quality-slider-input"
              />
              <div className="slider-labels">
                <span>DATA SAVER</span>
                <span>NORMAL</span>
                <span>HIGH</span>
                <span>ULTRA HD</span>
              </div>
            </div>
          </div>
          
          <div className="normalization-toggle-row">
            <div className="toggle-info">
              <h5>Normalize Volume</h5>
              <p>Equalizes track loudness</p>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                checked={volumeNormalization}
                onChange={() => setVolumeNormalization(!volumeNormalization)} 
              />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      {/* History Row */}
      <div className="profile-recent-notifications-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2rem' }}>
        <div className="recent-played-history-card glass-panel">
          <div className="card-header-row">
            <Music size={18} className="purple-icon" />
            <h4>Recently Played</h4>
            <span className="view-all-link">View All</span>
          </div>
          <div className="recent-played-small-list">
            {recentlyPlayed.slice(0, 5).map(s => (
              <div key={s.id} className="recent-played-small-row clickable" onClick={() => handlePlayCard(s, recentlyPlayed)}>
                <TrackImage src={s.cover_url} alt={s.title} className="recent-small-img" />
                <div className="recent-small-meta">
                  <h5>{s.title}</h5>
                  <p>{s.artist_name}</p>
                </div>
                <Play size={12} className="play-icon-hover" />
              </div>
            ))}
            {recentlyPlayed.length === 0 && (
              <p className="no-history-text">No recently played history available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Email Modal */}
      {showEditEmail && (
        <div className="upload-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="upload-modal-container glass-panel animate-fade" style={{ maxWidth: '400px' }}>
            <div className="upload-modal-header">
              <h3>Đổi Địa Chỉ Email</h3>
              <button className="btn-close-modal" onClick={() => { setShowEditEmail(false); setErrorMsg(''); setSuccessMsg(''); }}>&times;</button>
            </div>
            <form onSubmit={handleUpdateEmail} className="upload-form">
              {errorMsg && <p className="auth-error-alert" style={{ fontSize: '0.8rem', padding: '8px', marginBottom: '10px' }}>{errorMsg}</p>}
              {successMsg && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: '10px' }}>{successMsg}</p>}
              <div className="form-group">
                <label>Email mới</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button type="submit" className="btn-upload-submit" disabled={isSubmitting}>Lưu email</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {showEditName && (
        <div className="upload-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="upload-modal-container glass-panel animate-fade" style={{ maxWidth: '400px' }}>
            <div className="upload-modal-header">
              <h3>Đổi Tên Hiển Thị</h3>
              <button className="btn-close-modal" onClick={() => { setShowEditName(false); setErrorMsg(''); setSuccessMsg(''); }}>&times;</button>
            </div>
            <form onSubmit={handleUpdateName} className="upload-form">
              {errorMsg && <p className="auth-error-alert" style={{ fontSize: '0.8rem', padding: '8px', marginBottom: '10px' }}>{errorMsg}</p>}
              {successMsg && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: '10px' }}>{successMsg}</p>}
              <div className="form-group">
                <label>Tên hiển thị mới</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nhập tên mới..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button type="submit" className="btn-upload-submit" disabled={isSubmitting}>Lưu tên</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditPassword && (
        <div className="upload-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="upload-modal-container glass-panel animate-fade" style={{ maxWidth: '400px' }}>
            <div className="upload-modal-header">
              <h3>Đổi Mật Khẩu</h3>
              <button className="btn-close-modal" onClick={() => { setShowEditPassword(false); setErrorMsg(''); setSuccessMsg(''); }}>&times;</button>
            </div>
            <form onSubmit={handleUpdatePassword} className="upload-form">
              {errorMsg && <p className="auth-error-alert" style={{ fontSize: '0.8rem', padding: '8px', marginBottom: '10px' }}>{errorMsg}</p>}
              {successMsg && <p style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: '10px' }}>{successMsg}</p>}
              <div className="form-group">
                <label>Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button type="submit" className="btn-upload-submit" disabled={isSubmitting}>Đổi mật khẩu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Artist Profile View
const ArtistProfileView = ({ artistId, songs, trendingArtists, handlePlayCard, setActiveTab }) => {
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const id = parseInt(artistId);
    const foundArtist = trendingArtists.find(a => a.id === id);
    if (foundArtist) {
      setArtist(foundArtist);
    } else {
      setArtist({
        id: id,
        name: 'Mỹ Tâm',
        avatar_url: '/assets/artists/hoang_thuy_linh.jpg',
        bio: 'Một trong những giọng ca xuất sắc hàng đầu của nền âm nhạc Việt Nam.'
      });
    }

    const filteredSongs = songs.filter(s => s.artist_id === id);
    setArtistSongs(filteredSongs);
  }, [artistId, songs, trendingArtists]);

  const formatListeners = (id) => {
    const counts = {
      1: '6,230,150',
      2: '4,562,891',
      3: '12,890,221',
      4: '38,102,990',
      7: '5,203,150',
      8: '3,890,221'
    };
    return counts[id] || '2,500,000';
  };

  const playPopularTrack = (track) => {
    handlePlayCard(track, artistSongs);
  };

  if (!artist) return <p className="loading-txt">Đang tải hồ sơ nghệ sĩ...</p>;

  const displaySongs = artistSongs.length > 0 ? artistSongs : [
    { id: 101, title: 'Hẹn Ước Từ Lâu', artist_name: artist.name, duration_seconds: 252, cover_url: '/assets/covers/anh_den_dem.jpg', play_count: '4,203,150 lượt nghe' },
    { id: 102, title: 'Đừng Hỏi Em', artist_name: artist.name, duration_seconds: 305, cover_url: '/assets/covers/anh_den_dem.jpg', play_count: '3,890,221 lượt nghe' },
    { id: 103, title: 'Người Hãy Quên Em Đi', artist_name: artist.name, duration_seconds: 225, cover_url: '/assets/covers/anh_den_dem.jpg', play_count: '2,115,678 lượt nghe' }
  ];

  return (
    <div className="artist-profile-view animate-fade">
      {/* Artist Hero Banner */}
      <div className="artist-banner-hero">
        <div className="artist-banner-overlay"></div>
        <div className="artist-hero-content">
          <div className="verified-badge-row">
            <span className="verified-badge-pill">
              <Check size={12} className="check-icon" /> NGHỆ SĨ XÁC THỰC
            </span>
          </div>
          <h1>{artist.name}</h1>
          <p className="monthly-listeners">{formatListeners(artist.id)} người nghe hàng tháng</p>
          <div className="artist-action-row">
            <button className="btn-artist-play-shuffle" onClick={() => displaySongs.length > 0 && playPopularTrack(displaySongs[0])}>
              <Play size={16} fill="currentColor" /> Phát ngẫu nhiên
            </button>
            <button className={`btn-artist-follow ${isFollowing ? 'following' : ''}`} onClick={() => setIsFollowing(!isFollowing)}>
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
            <button className="btn-artist-more">•••</button>
          </div>
        </div>
      </div>

      {/* Popular Section */}
      <div className="artist-sections-container">
        <section className="artist-popular-section">
          <div className="artist-section-header">
            <h3>Phổ biến</h3>
            <span className="see-all-link">Xem tất cả</span>
          </div>
          <div className="artist-popular-list">
            {displaySongs.slice(0, 3).map((s, idx) => (
              <div key={s.id} className="artist-popular-row clickable" onClick={() => playPopularTrack(s)}>
                <span className="row-num">{idx + 1}</span>
                <TrackImage src={s.cover_url} alt={s.title} className="artist-row-cover" />
                <div className="artist-row-meta">
                  <h4>{s.title}</h4>
                  <p>{s.play_count || '1,500,000 lượt nghe'}</p>
                </div>
                <span className="row-duration">{s.duration_seconds ? `${Math.floor(s.duration_seconds/60)}:${s.duration_seconds%60 < 10 ? '0' : ''}${s.duration_seconds%60}` : '4:12'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Discography Section */}
        <section className="artist-discography-section">
          <div className="artist-section-header">
            <h3>Danh sách đĩa nhạc</h3>
          </div>
          <div className="artist-discography-grid">
            <div className="album-card glass-panel clickable-card">
              <div className="album-cover-fallback">
                <Music size={24} />
              </div>
              <h4>Tâm 9</h4>
              <p>2017 &bull; ALBUM</p>
            </div>
            <div className="album-card glass-panel clickable-card">
              <div className="album-cover-fallback">
                <Music size={24} />
              </div>
              <h4>Tri Âm</h4>
              <p>2021 &bull; ALBUM</p>
            </div>
            <div className="album-card glass-panel clickable-card">
              <div className="album-cover-fallback">
                <Music size={24} />
              </div>
              <h4>The First Movie</h4>
              <p>2023 &bull; SINGLE</p>
            </div>
            <div className="album-card glass-panel clickable-card">
              <div className="album-cover-fallback">
                <Music size={24} />
              </div>
              <h4>Hào Quang</h4>
              <p>2022 &bull; SINGLE</p>
            </div>
          </div>
        </section>

        {/* Fans Also Like */}
        <section className="artist-fans-like-section">
          <div className="artist-section-header">
            <h3>Người hâm mộ cũng thích</h3>
          </div>
          <div className="artist-fans-grid">
            {trendingArtists.slice(0, 4).map(a => (
              <div key={a.id} className="artist-fan-circle-card clickable-card" onClick={() => setActiveTab(`artist-${a.id}`)}>
                <div className="fan-circle-avatar-wrapper">
                  <img src={a.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={a.name} className="fan-circle-avatar" />
                </div>
                <h4>{a.name}</h4>
                <p>NGHỆ SĨ</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Sub-component for User Playlists View (Standalone tab)
const UserPlaylistsView = ({ playlists, handleCreatePlaylist, setActiveTab }) => {
  return (
    <div className="library-page-view animate-fade">
      <div className="library-layout-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="library-main-column">
          <div className="library-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Danh sách phát của tôi</h2>
            <button className="btn-add-music-toggle" onClick={handleCreatePlaylist}>+ Tạo Playlist mới</button>
          </div>
          
          <div className="library-playlists-grid">
            {playlists.map(p => (
              <div 
                key={p.id} 
                className="playlist-grid-card glass-panel clickable-card"
                onClick={() => setActiveTab(`playlist-${p.id}`)}
              >
                <div className="playlist-cover-fallback">
                  <Music size={28} />
                </div>
                <h4>{p.name}</h4>
                <p>{p.songs?.length || 0} bài hát</p>
              </div>
            ))}
            
            {/* Create Playlist Card */}
            <div 
              className="playlist-grid-card glass-panel create-card clickable-card"
              onClick={handleCreatePlaylist}
            >
              <div className="playlist-cover-fallback create-fallback">
                <Plus size={28} />
              </div>
              <h4>Tạo Playlist Mới</h4>
              <p>Tạo danh sách phát cá nhân</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for User Library View
const UserLibraryView = ({ playlists, likedSongs, songs, trendingArtists, handlePlayCard, handleCreatePlaylist, setActiveTab, setShowUploadModal, activeSubTab, setActiveSubTab }) => {

  const displaySongs = likedSongs.length > 0 ? likedSongs : songs.slice(0, 3);

  return (
    <div className="library-page-view animate-fade">
      <div className="library-layout-grid">
        {/* Left column */}
        <div className="library-main-column">
          <h2>Thư viện âm nhạc</h2>
          
          <div className="library-liked-showcase glass-panel">
            <div className="liked-glow-bg"></div>
            <div className="liked-showcase-content">
              <span className="liked-tag">ĐÃ THÍCH GẦN ĐÂY</span>
              <h3>Bài hát Đã Thích</h3>
              <div className="liked-stats-row">
                <button className="btn-liked-play-circle" onClick={() => displaySongs.length > 0 && handlePlayCard(displaySongs[0], displaySongs)}>
                  <Play size={20} fill="currentColor" style={{ transform: 'translateX(1px)' }} />
                </button>
                <div className="stats-txt">
                  <span className="song-count">{likedSongs.length} bài hát</span>
                  <span className="update-time">Cập nhật 2 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="library-subtabs-row">
            <button 
              className={`subtab-btn ${activeSubTab === 'liked' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('liked')}
            >
              Bài hát đã thích
            </button>
            <button 
              className={`subtab-btn ${activeSubTab === 'albums' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('albums')}
            >
              Album
            </button>
            <button 
              className={`subtab-btn ${activeSubTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('artists')}
            >
              Nghệ sĩ
            </button>
          </div>
          
          <div className="library-subtab-content">
            {activeSubTab === 'liked' && (
              likedSongs.length === 0 ? (
                <div className="empty-panel glass-panel" style={{ padding: '2.5rem', textAlign: 'center', width: '100%' }}>
                  <Heart size={32} className="empty-icon text-red" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                  <p>Chưa có bài hát đã thích. Thả tim các bài hát để thêm vào đây.</p>
                </div>
              ) : (
                <div className="liked-songs-sub-list">
                  <div className="table-header-row">
                    <span className="col-num">#</span>
                    <span className="col-title">TIÊU ĐỀ</span>
                    <span className="col-plays">LƯỢT NGHE</span>
                    <span className="col-time">🕒</span>
                  </div>
                  
                  {likedSongs.map((s, idx) => (
                    <div key={s.id} className="search-result-row clickable" onClick={() => handlePlayCard(s, likedSongs)}>
                      <span className="row-number">{idx + 1}</span>
                      <TrackImage src={s.cover_url} alt={s.title} className="search-row-img" />
                      <div className="search-row-meta">
                        <h4>{s.title}</h4>
                        <p>{s.artist_name}</p>
                      </div>
                      <span className="row-plays-count">{(4.2 - (idx * 0.7)).toFixed(1)}M lượt nghe</span>
                      <span className="row-duration">{s.duration_seconds ? `${Math.floor(s.duration_seconds/60)}:${s.duration_seconds%60 < 10 ? '0' : ''}${s.duration_seconds%60}` : '3:42'}</span>
                    </div>
                  ))}
                </div>
              )
            )}
            
            {activeSubTab === 'albums' && (() => {
              const albums = Array.from(new Set(songs.map(s => s.album_name ? JSON.stringify({ name: s.album_name, artist: s.artist_name, cover_url: s.cover_url }) : null).filter(Boolean))).map(str => JSON.parse(str));
              return albums.length === 0 ? (
                <div className="empty-panel glass-panel" style={{ padding: '2.5rem', textAlign: 'center', width: '100%' }}>
                  <Music size={32} className="empty-icon" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                  <p>Chưa có album nào.</p>
                </div>
              ) : (
                <div className="library-playlists-grid">
                  {albums.map((album, idx) => (
                    <div key={idx} className="playlist-grid-card glass-panel">
                      <div className="playlist-cover-fallback">
                        <TrackImage src={album.cover_url} alt={album.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h4>{album.name}</h4>
                      <p>{album.artist} &bull; Album</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {activeSubTab === 'artists' && (
              trendingArtists.length === 0 ? (
                <div className="empty-panel glass-panel" style={{ padding: '2.5rem', textAlign: 'center', width: '100%' }}>
                  <User size={32} className="empty-icon" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                  <p>Chưa có nghệ sĩ nào.</p>
                </div>
              ) : (
                <div className="artist-fans-grid">
                  {trendingArtists.slice(0, 6).map(a => (
                    <div key={a.id} className="artist-fan-circle-card clickable-card" onClick={() => setActiveTab(`artist-${a.id}`)}>
                      <div className="fan-circle-avatar-wrapper">
                        <img src={a.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} alt={a.name} className="fan-circle-avatar" />
                      </div>
                      <h4>{a.name}</h4>
                      <p>NGHỆ SĨ</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="library-artists-suggestion">
            <h3 className="section-title">Nghệ sĩ bạn có thể thích</h3>
            <div className="artists-scroll-container">
              {trendingArtists.map(artist => (
                <div 
                  key={artist.id} 
                  className="artist-card" 
                  onClick={() => setActiveTab(`artist-${artist.id}`)}
                >
                  <ArtistImage src={artist.avatar_url} name={artist.name} className="artist-avatar-img" size="90px" />
                  <h4>{artist.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side utility columns */}
        <div className="library-utility-column">
          <div className="util-action-card glass-panel clickable-card" onClick={handleCreatePlaylist}>
            <div className="plus-icon-box">
              <Plus size={20} />
            </div>
            <div className="util-card-info">
              <h4>Tạo Playlist mới</h4>
              <p>Tổ chức âm nhạc theo cách của bạn</p>
            </div>
          </div>

          <div className="util-action-card glass-panel clickable-card" onClick={() => setShowUploadModal(true)}>
            <div className="plus-icon-box" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)', color: '#ffffff' }}>
              <Music size={20} />
            </div>
            <div className="util-card-info">
              <h4>Tải bài hát mới lên</h4>
              <p>Tải nhạc và tệp lời hát đồng bộ (.txt, .lrc)</p>
            </div>
          </div>
          
          <div className="util-device-card glass-panel">
            <div className="devices-header">
              <Sliders size={18} className="purple-icon" />
              <h4>Thiết bị kết nối</h4>
            </div>
            <div className="active-device-info">
              <div className="active-device-indicator"></div>
              <div>
                <h5>Thiết bị kết nối</h5>
                <p className="device-desc">Aura Echo Gen 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
