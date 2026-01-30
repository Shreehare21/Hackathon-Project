const Startup = require('../models/Startup');

// @desc    Leaderboard - sort by funds raised, upvotes, or most discussed
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { sort = 'funds' } = req.query;
    let sortField = 'fundsRaised';
    if (sort === 'upvotes') sortField = 'upvoteCount';
    if (sort === 'discussed') sortField = 'commentCount';
    const startups = await Startup.aggregate([
      { $addFields: { upvoteCount: { $size: { $ifNull: ['$upvotes', []] } } } },
      { $sort: { [sortField]: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorDoc' } },
      { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
      { $addFields: { author: { username: '$authorDoc.username' } } },
      { $project: { authorDoc: 0 } }
    ]);
    const data = startups.map(s => ({
      ...s,
      upvoteCount: s.upvoteCount || 0,
      downvoteCount: (s.downvotes || []).length
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
