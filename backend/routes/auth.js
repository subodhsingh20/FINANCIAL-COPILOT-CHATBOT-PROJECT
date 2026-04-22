const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getUserById,
} = require('../services/cloudantService');

const router = express.Router();

// Get user info
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      authProvider: user.authProvider,
      displayName: user.displayName,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
