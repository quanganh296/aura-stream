const express = require('express');
const {
  getSongs,
  getSongById,
  searchSongs,
  getTrendingArtists,
  getRecentlyPlayed,
  addRecentlyPlayed,
  getForYouMixes
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSongs);
router.get('/search', searchSongs);
router.get('/artists/trending', getTrendingArtists);
router.get('/mixes/for-you', getForYouMixes);

// Listening history requires user context
router.get('/history/recent', protect, getRecentlyPlayed);
router.post('/history', protect, addRecentlyPlayed);

// Specific lookup last to avoid routing issues
router.get('/:id', getSongById);

module.exports = router;
