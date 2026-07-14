const express = require('express');
const {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  likeSong,
  unlikeSong,
  getLikedSongs
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Guard all playlist endpoints

router.get('/', getUserPlaylists);
router.post('/', createPlaylist);

// Liked songs
router.get('/likes', getLikedSongs);
router.post('/likes/:songId', likeSong);
router.delete('/likes/:songId', unlikeSong);

// Custom playlist modifications
router.get('/:id', getPlaylistById);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
