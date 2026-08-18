const pool = require('./db');

const initDatabase = async () => {
  try {
    console.log('Initializing database tables if not exist...');
    
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Artists Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Songs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        artist_id INT NOT NULL,
        album_name VARCHAR(150) DEFAULT NULL,
        cover_url VARCHAR(255) DEFAULT NULL,
        audio_url VARCHAR(255) NOT NULL,
        lyrics_json JSON DEFAULT NULL,
        duration_seconds INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Playlists Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        is_private BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Playlist Songs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INT NOT NULL,
        song_id INT NOT NULL,
        position INT DEFAULT 0,
        PRIMARY KEY (playlist_id, song_id),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. User Likes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_likes (
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, song_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Listening History Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listening_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Auto-seed initial artists & songs if empty
    const [artistRows] = await pool.query('SELECT COUNT(*) as count FROM artists');
    if (artistRows[0].count === 0) {
      console.log('Seeding initial artists data...');
      await pool.query(`
        INSERT INTO artists (id, name, avatar_url, bio) VALUES
        (1, 'Cyber Architect', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Pioneer of cyberpunk 8D electronic soundscapes.'),
        (2, 'Luna Sol', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'Soulful indie pop and ambient electronic producer.'),
        (3, 'The Verse King', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Urban hip-hop and lo-fi storytelling maestro.');
      `);
    }

    const [songRows] = await pool.query('SELECT COUNT(*) as count FROM songs');
    if (songRows[0].count === 0) {
      console.log('Seeding initial songs data...');
      await pool.query(`
        INSERT INTO songs (id, title, artist_id, album_name, cover_url, audio_url, duration_seconds) VALUES
        (1, 'Neon Dreams', 1, 'Echoes of Time', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', 222),
        (2, 'Midnight Horizon', 2, 'Dust & Gold', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', 255),
        (3, 'Street Static', 3, 'Concrete Jungle', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', 178);
      `);
    }

    console.log('Database tables successfully initialized!');
  } catch (err) {
    console.error('Error initializing database tables:', err.message);
  }
};

module.exports = initDatabase;
