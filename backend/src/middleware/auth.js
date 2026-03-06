const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to populate req.user if token is valid, but doesn't block request if not
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
    console.warn("Optional auth failed (ignoring):", error.message);
  }
  next();
};

module.exports = { authenticateToken, optionalAuth };