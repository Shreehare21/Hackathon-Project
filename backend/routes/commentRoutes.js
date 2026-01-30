const express = require('express');
const router = express.Router();
const { upvoteComment, downvoteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/:id/upvote', protect, upvoteComment);
router.post('/:id/downvote', protect, downvoteComment);

module.exports = router;
