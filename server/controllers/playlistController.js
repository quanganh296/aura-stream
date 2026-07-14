const pool = require('../config/db');

// @desc    Get user's custom playlists
// @route   GET /api/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    const [playlists] = await pool.execute(
      'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving playlists', error: error.message });
  }
};

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  const { name, isPrivate } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO playlists (name, user_id, is_private) VALUES (?, ?, ?)',
      [name, req.user.id, isPrivate !== undefined ? isPrivate : true]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      user_id: req.user.id,
      is_private: isPrivate !== undefined ? isPrivate : true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating playlist', error: error.message });
  }
};

// @desc    Get playlist details including songs
// @route   GET /api/playlists/:id
// @access  Private
const getPlaylistById = async (req, res) => {
  const { id } = req.params;
  try {
    const [playlists] = await pool.execute(
      'SELECT * FROM playlists WHERE id = ?',
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const playlist = playlists[0];

    // Fetch songs in this playlist
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.id as artist_id, a.name as artist_name
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC
    `, [id]);

    playlist.songs = songs;
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist songs', error: error.message });
  }
};

// @desc    Add a song to a playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
const addSongToPlaylist = async (req, res) => {
  const { id } = req.params; // Playlist ID
  const { songId } = req.body;

  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required' });
  }

  try {
    // Check if playlist belongs to user
    const [playlists] = await pool.execute(
      'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (playlists.length === 0) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Check if song is already in the playlist
    const [existing] = await pool.execute(
      'SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [id, songId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Song is already in this playlist' });
    }

    // Get current position count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM playlist_songs WHERE playlist_id = ?',
      [id]
    );
    const position = countResult[0].count;

    await pool.execute(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
      [id, songId, position]
    );

    res.json({ message: 'Song added to playlist successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to playlist', error: error.message });
  }
};

// @desc    Remove a song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
const removeSongFromPlaylist = async (req, res) => {
  const { id, songId } = req.params;

  try {
    // Check ownership
    const [playlists] = await pool.execute(
      'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (playlists.length === 0) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    await pool.execute(
      'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [id, songId]
    );

    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from playlist', error: error.message });
  }
};

// @desc    Like a song
// @route   POST /api/playlists/likes/:songId
// @access  Private
const likeSong = async (req, res) => {
  const { songId } = req.params;

  try {
    // Check if already liked
    const [existing] = await pool.execute(
      'SELECT * FROM user_likes WHERE user_id = ? AND song_id = ?',
      [req.user.id, songId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Song already liked' });
    }

    await pool.execute(
      'INSERT INTO user_likes (user_id, song_id) VALUES (?, ?)',
      [req.user.id, songId]
    );

    res.json({ message: 'Song added to Liked Songs' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking song', error: error.message });
  }
};

// @desc    Unlike a song
// @route   DELETE /api/playlists/likes/:songId
// @access  Private
const unlikeSong = async (req, res) => {
  const { songId } = req.params;

  try {
    await pool.execute(
      'DELETE FROM user_likes WHERE user_id = ? AND song_id = ?',
      [req.user.id, songId]
    );
    res.json({ message: 'Song removed from Liked Songs' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking song', error: error.message });
  }
};

// @desc    Get user's liked songs
// @route   GET /api/playlists/likes
// @access  Private
const getLikedSongs = async (req, res) => {
  try {
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.id as artist_id, a.name as artist_name, ul.created_at
      FROM user_likes ul
      JOIN songs s ON ul.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE ul.user_id = ?
      ORDER BY ul.created_at DESC
    `, [req.user.id]);

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving liked songs', error: error.message });
  }
};

module.exports = {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  likeSong,
  unlikeSong,
  getLikedSongs
};
