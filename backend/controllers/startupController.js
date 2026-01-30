const Startup = require('../models/Startup');
const path = require('path');

// @desc    Get all startups (with optional sort)
// @route   GET /api/startups
exports.getStartups = async (req, res) => {
  try {
    const { sort = 'newest', category, search, author } = req.query;
    let query = {};
    if (req.user && author === 'me') query.author = req.user.id;
    if (category) query.categoryTags = category;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { oneLinePitch: new RegExp(search, 'i') },
        { detailedDescription: new RegExp(search, 'i') }
      ];
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'funds') {
      sortOption = { fundsRaised: -1 };
    } else if (sort === 'discussed') {
      sortOption = { commentCount: -1 };
    }
    
    const startups = await Startup.find(query)
      .populate('author', 'username')
      .sort(sortOption)
      .lean();
    
    // Add upvoteCount for each startup
    const startupsWithCounts = startups.map(s => ({
      ...s,
      upvoteCount: s.upvotes ? s.upvotes.length : 0,
      downvoteCount: s.downvotes ? s.downvotes.length : 0
    }));
    
    // If sorting by upvotes, sort by the computed count
    if (sort === 'upvotes') {
      startupsWithCounts.sort((a, b) => b.upvoteCount - a.upvoteCount);
    }
    
    res.json({ success: true, data: startupsWithCounts });
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single startup by ID
// @route   GET /api/startups/:id
exports.getStartupById = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('author', 'username')
      .lean();
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }
    res.json({ success: true, data: startup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create startup (founder only)
// @route   POST /api/startups
exports.createStartup = async (req, res) => {
  try {
    const { name, oneLinePitch, detailedDescription, fundsRaised, contactEmail, categoryTags } = req.body;
    if (!name || !oneLinePitch || !detailedDescription || !contactEmail) {
      return res.status(400).json({ success: false, message: 'Name, pitch, description and contact email are required.' });
    }
    let logoPath = '';
    if (req.file && req.file.filename) {
      logoPath = '/uploads/logos/' + req.file.filename;
    }
    const tags = Array.isArray(categoryTags) ? categoryTags : (typeof categoryTags === 'string' ? categoryTags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const startup = await Startup.create({
      name,
      logo: logoPath,
      oneLinePitch,
      detailedDescription,
      fundsRaised: Number(fundsRaised) || 0,
      contactEmail,
      categoryTags: tags,
      author: req.user.id
    });
    const populated = await Startup.findById(startup._id).populate('author', 'username').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update startup (author only)
// @route   PUT /api/startups/:id
exports.updateStartup = async (req, res) => {
  try {
    let startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    if (startup.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this startup.' });
    }
    const { name, oneLinePitch, detailedDescription, fundsRaised, contactEmail, categoryTags } = req.body;
    if (name) startup.name = name;
    if (oneLinePitch) startup.oneLinePitch = oneLinePitch;
    if (detailedDescription) startup.detailedDescription = detailedDescription;
    if (fundsRaised !== undefined) startup.fundsRaised = Number(fundsRaised);
    if (contactEmail) startup.contactEmail = contactEmail;
    if (categoryTags !== undefined) {
      startup.categoryTags = Array.isArray(categoryTags) ? categoryTags : (typeof categoryTags === 'string' ? categoryTags.split(',').map(t => t.trim()).filter(Boolean) : startup.categoryTags);
    }
    if (req.file && req.file.filename) {
      startup.logo = '/uploads/logos/' + req.file.filename;
    }
    startup.updatedAt = new Date();
    await startup.save();
    const populated = await Startup.findById(startup._id).populate('author', 'username').lean();
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete startup (author only)
// @route   DELETE /api/startups/:id
exports.deleteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    if (startup.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this startup.' });
    }
    await startup.deleteOne();
    res.json({ success: true, message: 'Startup deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote startup
// @route   POST /api/startups/:id/upvote
exports.upvoteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    const userId = req.user.id;
    startup.downvotes.pull(userId);
    if (startup.upvotes.includes(userId)) {
      startup.upvotes.pull(userId);
    } else {
      startup.upvotes.addToSet(userId);
    }
    await startup.save();
    res.json({ success: true, upvotes: startup.upvotes.length, downvotes: startup.downvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Downvote startup
// @route   POST /api/startups/:id/downvote
exports.downvoteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    const userId = req.user.id;
    startup.upvotes.pull(userId);
    if (startup.downvotes.includes(userId)) {
      startup.downvotes.pull(userId);
    } else {
      startup.downvotes.addToSet(userId);
    }
    await startup.save();
    res.json({ success: true, upvotes: startup.upvotes.length, downvotes: startup.downvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow / unfollow startup
// @route   POST /api/startups/:id/follow
exports.followStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    const userId = req.user.id;
    const user = await require('../models/User').findById(userId);
    if (startup.followers.includes(userId)) {
      startup.followers.pull(userId);
      user.followedStartups.pull(startup._id);
    } else {
      startup.followers.addToSet(userId);
      user.followedStartups.addToSet(startup._id);
    }
    await startup.save();
    await user.save();
    res.json({ success: true, following: startup.followers.includes(userId), followers: startup.followers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
