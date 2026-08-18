const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user (prepared statement)
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const userId = result.insertId;

    const newUser = {
      id: userId,
      username,
      email
    };

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      token: generateToken(newUser)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { identity, password } = req.body; // identity can be username or email

  if (!identity || !password) {
    return res.status(400).json({ message: 'Please provide credentials' });
  }

  try {
    // Find user by username or email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identity, identity]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile', error: error.message });
  }
};

// @desc    Update user profile (username, email, or password)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.user.id;

  try {
    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    if (username) {
      // Check if username already taken by another user
      const [existing] = await pool.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      // Check if email already taken
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(userId);

    await pool.execute(query, params);

    // Get updated user details
    const [updatedUsers] = await pool.execute(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUsers[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Authenticate or register user via Social Provider (Google, Facebook, Twitch, Apple, X)
// @route   POST /api/auth/social-login
// @access  Public
const socialLogin = async (req, res) => {
  const { provider, email, name, avatar_url } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ message: 'Social login requires provider and email' });
  }

  try {
    // 1. Check if user exists by email
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    let user;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Update avatar if provided and not set
      if (avatar_url && !user.avatar_url) {
        await pool.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, user.id]);
        user.avatar_url = avatar_url;
      }
    } else {
      // 2. Create new social user
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
      if (!baseUsername) baseUsername = 'user';
      let username = baseUsername;
      
      // Ensure unique username
      const [userMatches] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      if (userMatches.length > 0) {
        username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Generate dummy password hash for social accounts
      const salt = await bcrypt.genSalt(10);
      const randomPasswordHash = await bcrypt.hash(`social_${provider}_${Date.now()}`, salt);

      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
        [username, email, randomPasswordHash, avatar_url || null]
      );

      user = {
        id: result.insertId,
        username,
        email,
        avatar_url: avatar_url || null
      };
    }

    // 3. Issue JWT token
    const token = generateToken(user);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      provider,
      token
    });
  } catch (error) {
    console.error('Social Login Error:', error);
    res.status(500).json({ message: 'Server error during social authentication', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  socialLogin
};
