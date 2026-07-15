const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getSongs,
  getSongById,
  searchSongs,
  getTrendingArtists,
  getRecentlyPlayed,
  addRecentlyPlayed,
  getForYouMixes,
  uploadSong
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

// Ensure upload directory exists in client public folder
const uploadDir = path.join(__dirname, '../../client/public/assets/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename preserving extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'audio') {
      if (['.mp3', '.mp4', '.wav', '.m4a'].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận tệp nhạc (mp3, mp4, wav, m4a)!'), false);
      }
    } else if (file.fieldname === 'lyrics') {
      if (['.txt', '.lrc'].includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận tệp lời bài hát (txt, lrc)!'), false);
      }
    } else {
      cb(new Error('Trường tải lên không hợp lệ!'), false);
    }
  }
});

const router = express.Router();

router.get('/', getSongs);
router.get('/search', searchSongs);
router.get('/artists/trending', getTrendingArtists);
router.get('/mixes/for-you', getForYouMixes);

// Song uploading with manual lyrics upload (audio and lyrics files)
router.post('/upload', protect, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'lyrics', maxCount: 1 }]), uploadSong);

// Listening history requires user context
router.get('/history/recent', protect, getRecentlyPlayed);
router.post('/history', protect, addRecentlyPlayed);

// Specific lookup last to avoid routing issues
router.get('/:id', getSongById);

module.exports = router;
