const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Optional auth - attach user if token present, but don't require it
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Restrict to founder role
exports.founderOnly = (req, res, next) => {
  if (req.user && req.user.role === 'founder') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Founder role required.' });
  }
};
