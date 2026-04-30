const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const User    = require('../models/User');
const { sendVerificationEmail } = require('../config/mailer');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required.' });

    if (!email.toLowerCase().endsWith('@umass.edu'))
      return res.status(403).json({ message: 'Only @umass.edu email addresses are allowed.' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash      = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      name,
      email:             email.toLowerCase(),
      passwordHash,
      verificationToken,
      verified:          false,
    });

    await sendVerificationEmail(email.toLowerCase(), verificationToken);

    const mailConfigured = !!process.env.RESEND_API_KEY;
    const message = mailConfigured
      ? 'Account created! Please check your @umass.edu inbox to verify your email before logging in.'
      : 'Account created! (Email verification skipped — mail not configured.)';

    return res.status(201).json({ message });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user)
      return res.status(400).json({ message: 'Invalid or expired verification link.' });

    user.verified          = true;
    user.verificationToken = null;
    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    if (!email.toLowerCase().endsWith('@umass.edu'))
      return res.status(403).json({ message: 'Only @umass.edu email addresses are allowed.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const mailConfigured = !!process.env.RESEND_API_KEY;
    if (mailConfigured && !user.verified)
      return res.status(403).json({ message: 'Please verify your @umass.edu email before logging in. Check your inbox.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
