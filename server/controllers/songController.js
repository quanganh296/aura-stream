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

// Helper function to post-process raw lyrics using Gemini AI
const correctLyricsWithGemini = async (rawLyricsJsonString, songTitle) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Notice: GEMINI_API_KEY is not set. Skipping Gemini post-processing lyric correction.');
    return rawLyricsJsonString;
  }

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
Bạn là một chuyên gia hiệu đính và biên tập âm nhạc V-Pop. 
Tôi có một danh sách lời bài hát thô nhận diện qua âm thanh của bài hát "${songTitle}". 
Lời bài hát thô này có một số lỗi chính tả tiếng Việt (nhầm dấu, nhầm âm) và đặc biệt là lỗi nhận diện các câu tiếng Anh chen giữa bài hát sang từ tiếng Việt nghe đồng âm (ví dụ: "đang mì bên bên không" thực chất phải là "take me back back home", "room 9.5" thực chất là "from 9 to 5", "Nhật sẽ" -> "Nhạc giờ").

Hãy đối chiếu, sửa các lỗi chính tả và sửa các lỗi đồng âm này về đúng lời gốc tiếng Việt và tiếng Anh chính xác nhất có thể.

YÊU CẦU:
1. Hãy sửa trường "text" trong các phần tử JSON. Giữ nguyên trường "time" không thay đổi.
2. Trả về kết quả dưới dạng một mảng JSON có cùng định dạng chính xác như đầu vào: [{"time": number, "text": string}].
3. Chỉ trả về duy nhất chuỗi mảng JSON hợp lệ, không thêm bất kỳ văn bản giải thích nào khác ngoài JSON.

Dữ liệu lời bài hát thô dạng JSON:
${rawLyricsJsonString}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Validate JSON structure
    JSON.parse(text); 
    console.log('Gemini lyrics post-correction completed successfully.');
    return text;
  } catch (error) {
    console.error('Gemini post-processing failed:', error.message);
    return rawLyricsJsonString; // Fallback to raw lyrics
  }
};

// @desc    Upload a new song and automatically transcribe lyrics
// @route   POST /api/songs/upload
// @access  Public (or Private)
const uploadSong = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio/video file uploaded' });
  }

  const { title, artist_id, album_name } = req.body;
  if (!title || !artist_id) {
    // Clean up uploaded file if validation fails
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {}
    return res.status(400).json({ message: 'Title and artist_id are required' });
  }

  const filePath = req.file.path; // Absolute path to uploaded file
  const audioUrl = `/assets/uploads/${req.file.filename}`; // Static URL for client playing
  const coverUrl = '/assets/covers/anh_den_dem.jpg'; // Placeholder cover

  // Execute python transcribe script
  const scriptPath = path.join(__dirname, '../scripts/transcribe.py');
  
  // Note: we wrap file path in quotes to handle whitespaces in filename
  const cmd = `python "${scriptPath}" "${filePath}"`;

  exec(cmd, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Transcription error: ${stderr || error.message}`);
      // Fallback: insert song with empty lyrics if transcription fails
      try {
        const [result] = await pool.execute(`
          INSERT INTO songs (title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, artist_id, album_name || 'Single', coverUrl, audioUrl, 180, '[]']);
        
        return res.status(201).json({ 
          message: 'Song uploaded, but automatic transcription failed. Song inserted with default settings.',
          songId: result.insertId,
          audioUrl,
          transcriptionError: stderr || error.message
        });
      } catch (dbError) {
        return res.status(500).json({ message: 'Error inserting song after transcription failure', error: dbError.message });
      }
    }

    try {
      // Parse JSON output from Python script
      const data = JSON.parse(stdout.trim());
      const durationSeconds = data.duration_seconds || 180;
      const rawLyricsJson = data.lyrics_json || '[]';

      // Correct lyrics spelling using Gemini AI
      const finalLyricsJson = await correctLyricsWithGemini(rawLyricsJson, title);

      // Insert song details into database
      const [result] = await pool.execute(`
        INSERT INTO songs (title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, artist_id, album_name || 'Single', coverUrl, audioUrl, durationSeconds, finalLyricsJson]);

      res.status(201).json({
        message: 'Song uploaded and transcribed successfully!',
        songId: result.insertId,
        title,
        durationSeconds,
        lyricsJson: JSON.parse(finalLyricsJson),
        audioUrl
      });
    } catch (parseError) {
      console.error(`Parse error of transcription stdout: ${parseError.message}`);
      try {
        const [result] = await pool.execute(`
          INSERT INTO songs (title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, artist_id, album_name || 'Single', coverUrl, audioUrl, 180, '[]']);

        res.status(201).json({
          message: 'Song uploaded, but error parsing transcription results.',
          songId: result.insertId,
          audioUrl
        });
      } catch (dbError) {
        return res.status(500).json({ message: 'Error inserting song after parse failure', error: dbError.message });
      }
    }
  });
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
