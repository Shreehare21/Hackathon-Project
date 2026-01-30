const Comment = require('../models/Comment');
const Startup = require('../models/Startup');

// Build nested comment tree
function buildCommentTree(comments, parentId = null) {
  return comments
    .filter(c => (c.parent ? c.parent.toString() : null) === parentId)
    .map(c => ({
      ...c,
      replies: buildCommentTree(comments, c._id.toString())
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

// @desc    Get comments for a startup (nested)
// @route   GET /api/startups/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ startup: req.params.id })
      .populate('author', 'username')
      .lean();
    const tree = buildCommentTree(comments);
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment (or reply)
// @route   POST /api/startups/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      startup: req.params.id,
      parent: parentId || null
    });
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, { $push: { replies: comment._id } });
    }
    startup.commentCount = await Comment.countDocuments({ startup: req.params.id });
    await startup.save();
    const populated = await Comment.findById(comment._id).populate('author', 'username').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote comment
// @route   POST /api/comments/:id/upvote
exports.upvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    const userId = req.user.id;
    comment.downvotes.pull(userId);
    if (comment.upvotes.includes(userId)) {
      comment.upvotes.pull(userId);
    } else {
      comment.upvotes.addToSet(userId);
    }
    await comment.save();
    res.json({ success: true, upvotes: comment.upvotes.length, downvotes: comment.downvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Downvote comment
// @route   POST /api/comments/:id/downvote
exports.downvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    const userId = req.user.id;
    comment.upvotes.pull(userId);
    if (comment.downvotes.includes(userId)) {
      comment.downvotes.pull(userId);
    } else {
      comment.downvotes.addToSet(userId);
    }
    await comment.save();
    res.json({ success: true, upvotes: comment.upvotes.length, downvotes: comment.downvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
