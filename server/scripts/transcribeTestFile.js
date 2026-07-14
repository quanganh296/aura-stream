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
      const rawLyricsJson = data.lyrics_json;
      
      console.log('Running Gemini AI post-correction...');
      const finalLyricsJson = await correctLyricsWithGemini(rawLyricsJson, 'Ai Đưa Em Về');
      const parsedLyrics = JSON.parse(finalLyricsJson);
      
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
      `, [title, artistId, albumName, coverUrl, audioUrl, durationSeconds, finalLyricsJson]);
      
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
