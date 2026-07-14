const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'vibemusic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testFilePath = 'd:\\MyMusicApp\\Nhactest\\TIA - Ai Đưa Em Về _ Official M_V _ Ft. Lê Thiện Hiếu (Low Cortisol Song).mp4';

async function run() {
  console.log('--- STARTING AI AUTOMATED LYRIC EXTRACTION TEST ---');
  console.log(`Source File: ${testFilePath}`);
  
  if (!fs.existsSync(testFilePath)) {
    console.error(`Error: File does not exist at ${testFilePath}`);
    process.exit(1);
  }

  const scriptPath = path.join(__dirname, 'transcribe.py');
  console.log(`Running Python script: python "${scriptPath}" "${testFilePath}"`);
  
  // Start timer
  const startTime = Date.now();
  
  exec(`python "${scriptPath}" "${testFilePath}"`, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing transcription: ${stderr || error.message}`);
      process.exit(1);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Transcription completed in ${duration}s!`);
    
    try {
      const data = JSON.parse(stdout.trim());
      const durationSeconds = data.duration_seconds;
      const lyricsJson = data.lyrics_json;
      const parsedLyrics = JSON.parse(lyricsJson);
      
      console.log(`\n--- TRANSCRIPTION DETAILS ---`);
      console.log(`Detected Duration: ${durationSeconds} seconds (${Math.floor(durationSeconds/60)}m ${durationSeconds%60}s)`);
      console.log(`Total Lyric Lines Extracted: ${parsedLyrics.length}`);
      console.log(`Sample Lyrics (First 5 lines):`);
      parsedLyrics.slice(0, 5).forEach(l => {
        console.log(`  [${l.time}s]: ${l.text}`);
      });
      
      // Save it to database
      console.log('\nInserting song into MySQL database...');
      
      // We will copy the file to client/public/assets/uploads/test_song.mp4
      const destDir = path.join(__dirname, '../../client/public/assets/uploads');
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      const destPath = path.join(destDir, 'test_song.mp4');
      fs.copyFileSync(testFilePath, destPath);
      console.log(`Copied media to client static assets: ${destPath}`);
      
      const audioUrl = '/assets/uploads/test_song.mp4';
      const coverUrl = '/assets/covers/anh_den_dem.jpg'; // placeholder
      const title = 'Ai Đưa Em Về';
      const artistId = 2; // Đen Vâu (as a placeholder artist)
      const albumName = 'Single';
      
      const [result] = await pool.execute(`
        INSERT INTO songs (title, artist_id, album_name, cover_url, audio_url, duration_seconds, lyrics_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, artistId, albumName, coverUrl, audioUrl, durationSeconds, lyricsJson]);
      
      console.log(`\n🎉 SUCCESS! Song inserted with ID: ${result.insertId}`);
      console.log(`Title: ${title}`);
      console.log(`Audio URL: ${audioUrl}`);
      console.log(`Lyrics: Saved to DB (matches synchronized scrolling format)`);
      
      process.exit(0);
    } catch (parseError) {
      console.error('Error parsing transcription stdout:', parseError.message);
      console.log('Raw output was:', stdout);
      process.exit(1);
    }
  });
}

run();
