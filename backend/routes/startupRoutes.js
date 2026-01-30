const express = require('express');
const router = express.Router();
const {
  getStartups,
  getStartupById,
  createStartup,
  updateStartup,
  deleteStartup,
  upvoteStartup,
  downvoteStartup,
  followStartup
} = require('../controllers/startupController');
const { getComments, addComment } = require('../controllers/commentController');
const { protect, founderOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, getStartups);
router.get('/:id', optionalAuth, getStartupById);
router.get('/:id/comments', getComments);

// Protected routes
router.post('/', protect, founderOnly, upload.single('logo'), createStartup);
router.put('/:id', protect, upload.single('logo'), updateStartup);
router.delete('/:id', protect, deleteStartup);
router.post('/:id/upvote', protect, upvoteStartup);
router.post('/:id/downvote', protect, downvoteStartup);
router.post('/:id/follow', protect, followStartup);
router.post('/:id/comments', protect, addComment);

module.exports = router;
