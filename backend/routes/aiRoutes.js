const express = require('express');
const router = express.Router();
const { improvePitch } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/improve-pitch', protect, improvePitch);

module.exports = router;
