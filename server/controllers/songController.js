const pool = require('../config/db');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
const getSongs = async (req, res) => {
  try {
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.id as artist_id, a.name as artist_name, a.avatar_url as artist_avatar
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      ORDER BY s.title ASC
    `);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving songs', error: error.message });
  }
};

// @desc    Get song by ID (includes lyrics)
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
  const { id } = req.params;
  try {
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds, s.lyrics_json,
             a.id as artist_id, a.name as artist_name, a.avatar_url as artist_avatar
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = ?
    `, [id]);

    if (songs.length === 0) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(songs[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving song details', error: error.message });
  }
};

// @desc    Search songs or artists
// @route   GET /api/songs/search
// @access  Public
const searchSongs = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Query parameter "q" is required' });
  }

  try {
    const wildCardQuery = `%${q}%`;
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.id as artist_id, a.name as artist_name, a.avatar_url as artist_avatar
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.title LIKE ? OR a.name LIKE ? OR s.album_name LIKE ?
      LIMIT 10
    `, [wildCardQuery, wildCardQuery, wildCardQuery]);

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error searching songs', error: error.message });
  }
};

// @desc    Get trending artists
// @route   GET /api/songs/artists/trending
// @access  Public
const getTrendingArtists = async (req, res) => {
  try {
    const [artists] = await pool.execute(`
      SELECT id, name, avatar_url, bio FROM artists LIMIT 10
    `);
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving trending artists', error: error.message });
  }
};

// @desc    Get recently played songs
// @route   GET /api/songs/history/recent
// @access  Private
const getRecentlyPlayed = async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT DISTINCT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.id as artist_id, a.name as artist_name, a.avatar_url as artist_avatar,
             lh.played_at
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = ?
      ORDER BY lh.played_at DESC
      LIMIT 8
    `, [req.user.id]);

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving listening history', error: error.message });
  }
};

// @desc    Record a track listening event
// @route   POST /api/songs/history
// @access  Private
const addRecentlyPlayed = async (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required' });
  }

  try {
    await pool.execute(
      'INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)',
      [req.user.id, songId]
    );
    res.status(201).json({ message: 'Listening history recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording history', error: error.message });
  }
};

// @desc    Get custom "For You" mixes
// @route   GET /api/songs/mixes/for-you
// @access  Public
const getForYouMixes = async (req, res) => {
  try {
    const [songs] = await pool.execute(`
      SELECT s.id, s.title, s.album_name, s.cover_url, s.audio_url, s.duration_seconds,
             a.name as artist_name
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
    `);

    // Dynamic categorizations to form the mixes shown in mockup (Mix 1: Daily Mix, Mix 2: Chill/Indie, Mix 3: Electronic)
    const mix1 = songs.filter(s => [1, 2, 3].includes(s.id)); // Đen Vâu, Hoàng Thuỳ Linh, Phương Mỹ Chi
    const mix2 = songs.filter(s => [4, 7, 9].includes(s.id)); // Ballad & Indie (Thành Đạt, Vũ, Taylor Swift)
    const mix3 = songs.filter(s => [5, 6, 8, 10].includes(s.id)); // Electronic/Pop (M83, The Weeknd, Dua Lipa, Daft Punk)

    res.json([
      {
        id: 1,
        title: "Daily Mix 1",
        description: "Đen Vâu, Hoàng Thuỳ Linh, Phương Mỹ Chi...",
        cover_url: "/assets/mixes/mix1.jpg",
        songs: mix1
      },
      {
        id: 2,
        title: "Chill & Acoustic Mix 2",
        description: "Vũ, Thành Đạt, Taylor Swift...",
        cover_url: "/assets/mixes/mix2.jpg",
        songs: mix2
      },
      {
        id: 3,
        title: "Energy Mix 3",
        description: "The Weeknd, Daft Punk, Dua Lipa...",
        cover_url: "/assets/mixes/mix3.jpg",
        songs: mix3
      }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Error generating mixes', error: error.message });
  }
};

// Helper function to get audio file duration using ffprobe
const getAudioDuration = (filePath) => {
  return new Promise((resolve) => {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('ffprobe duration detection error:', stderr || error.message);
        resolve(180); // Default fallback of 3 minutes
      } else {
        const seconds = parseFloat(stdout.trim());
        resolve(isNaN(seconds) ? 180 : Math.floor(seconds));
      }
    });
  });
};

// Helper function to parse lyrics from LRC or plain TXT files
const parseLyrics = (fileContent, durationSeconds) => {
  const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const lrcRegex = /^\[(\d+):(\d+)(?:\.(\d+))?\](.*)$/;
  
  const parsedLrc = [];
  
  for (const line of lines) {
    const match = line.match(lrcRegex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3], 10) : 0;
      const text = match[4].trim();
      
      const timeInSecs = min * 60 + sec + (ms > 0 ? ms / 100 : 0);
      parsedLrc.push({ time: Math.floor(timeInSecs), text });
    }
  }

  // If standard LRC tags are successfully parsed, sort and return them
  if (parsedLrc.length > 0) {
    return parsedLrc.sort((a, b) => a.time - b.time);
  }

  // Fallback: If plain TXT (no timestamps), distribute lines evenly across the song's duration
  const totalLines = lines.length;
  if (totalLines === 0) return [];
  
  const step = durationSeconds / totalLines;
  return lines.map((text, idx) => ({
    time: Math.floor(idx * step),
    text
  }));
};

// @desc    Upload a new song and manual lyrics file (LRC/TXT)
// @route   POST /api/songs/upload
// @access  Public (or Private)
const uploadSong = async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const lyricsFile = req.files?.lyrics?.[0];

  if (!audioFile || !lyricsFile) {
    // Clean up any uploaded file on missing inputs
    if (audioFile) try { fs.unlinkSync(audioFile.path); } catch (e) {}
    if (lyricsFile) try { fs.unlinkSync(lyricsFile.path); } catch (e) {}
    return res.status(400).json({ message: 'Both audio file and lyrics file are required!' });
  }

  const { title, artist_id, album_name } = req.body;
  if (!title || !artist_id) {
    // Clean up uploaded files
    try { fs.unlinkSync(audioFile.path); } catch (e) {}
    try { fs.unlinkSync(lyricsFile.path); } catch (e) {}
    return res.status(400).json({ message: 'Title and artist_id are required!' });
  }

  try {
    // Detect audio file duration using ffprobe
    const durationSeconds = await getAudioDuration(audioFile.path);
    
    // Read and parse lyrics file
    const lyricsContent = fs.readFileSync(lyricsFile.path, 'utf8');
    const lyricsJson = parseLyrics(lyricsContent, durationSeconds);
    const lyricsJsonStr = JSON.stringify(lyricsJson);

    const audioUrl = `/assets/uploads/${audioFile.filename}`;
    const coverUrl = '/assets/covers/anh_den_dem.jpg'; // Placeholder cover

    // Insert song metadata and parsed lyrics JSON into DB
    const [result] = await pool.execute(`
      INSERT INTO songs (title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, artist_id, album_name || 'Single', coverUrl, audioUrl, durationSeconds, lyricsJsonStr]);

    // Clean up temporary lyrics file since it's already saved in DB
    try { fs.unlinkSync(lyricsFile.path); } catch (e) {}

    res.status(201).json({
      message: 'Song and lyrics uploaded and synchronized successfully!',
      songId: result.insertId,
      title,
      durationSeconds,
      lyricsJson,
      audioUrl
    });
  } catch (error) {
    console.error('Upload processing failed:', error.message);
    // Cleanup files on error
    try { fs.unlinkSync(audioFile.path); } catch (e) {}
    try { fs.unlinkSync(lyricsFile.path); } catch (e) {}
    res.status(500).json({ message: 'Internal server error during upload processing', error: error.message });
  }
};

module.exports = {
  getSongs,
  getSongById,
  searchSongs,
  getTrendingArtists,
  getRecentlyPlayed,
  addRecentlyPlayed,
  getForYouMixes,
  uploadSong
};
