const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function setAuthCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000
});
}

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password: hashed });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, user._id);
    res.status(201).json({ email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, user._id);
    res.json({ email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// router.get('/me', async (req, res) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ error: 'Not logged in' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('email');
//     if (!user) return res.status(401).json({ error: 'Not logged in' });
//     res.json({ email: user.email });
//   } catch {
//     res.status(401).json({ error: 'Not logged in' });
//   }
// });
router.get('/me', async (req, res) => {
  console.log('Cookies:', req.cookies);

  let token = req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not logged in',
      debug: 'No token cookie or authorization header received'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);

    const user = await User.findById(decoded.userId).select('email');

    if (!user) {
      return res.status(401).json({
        error: 'Not logged in',
        debug: 'User not found'
      });
    }

    res.json({ email: user.email });
  } catch (err) {
    console.log('JWT ERROR:', err.message);

    res.status(401).json({
      error: 'Not logged in',
      debug: err.message
    });
  }
});

module.exports = router;
