const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
} = require('../services/cloudantService');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedUsername = username?.trim();

    if (!trimmedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const [existingByEmail, existingByUsername] = await Promise.all([
      getUserByEmail(normalizedEmail),
      getUserByUsername(trimmedUsername),
    ]);

    if (existingByEmail || existingByUsername) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      username: trimmedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if(!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await getUserByEmail(normalizedEmail);
    if(!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
