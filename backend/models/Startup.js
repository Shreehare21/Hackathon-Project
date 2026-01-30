const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  logo: {
    type: String,
    default: ''
  },
  oneLinePitch: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  detailedDescription: {
    type: String,
    required: true,
    trim: true
  },
  fundsRaised: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  categoryTags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

startupSchema.index({ fundsRaised: -1 });
startupSchema.index({ createdAt: -1 });
startupSchema.index({ categoryTags: 1 });

module.exports = mongoose.model('Startup', startupSchema);
