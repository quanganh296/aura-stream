const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'vibemusic_db'
  });

  try {
    // Query the last song inserted for "Ai Đưa Em Về"
    const [rows] = await pool.execute('SELECT title, lyrics_json FROM songs WHERE title = "Ai Đưa Em Về" ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      console.error('Song not found in database');
      process.exit(1);
    }

    const { title, lyrics_json } = rows[0];
    const lyrics = typeof lyrics_json === 'string' ? JSON.parse(lyrics_json) : (lyrics_json || []);

    let txtContent = `BÀI HÁT: ${title.toUpperCase()}\n`;
    txtContent += `==========================================\n\n`;

    lyrics.forEach(line => {
      const minutes = Math.floor(line.time / 60);
      const seconds = line.time % 60;
      const timeStr = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
      txtContent += `${timeStr} ${line.text}\n`;
    });

    const outputPath = path.join(__dirname, '../../lyrics.txt');
    fs.writeFileSync(outputPath, txtContent, 'utf-8');

    console.log(`Lyrics successfully written to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error saving lyrics:', error);
    process.exit(1);
  }
}

run();
