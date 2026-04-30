// ── Auth routes ───────────────────────────────────────────────────────────────
// POST /api/auth/register  – create account + send verification email
// POST /api/auth/login     – login (only if email is verified)
// GET  /api/auth/verify/:token – click link from email → mark verified

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');       // built-in Node module, no install needed
const User     = require('../models/User');

const router = express.Router();

// ─── Nodemailer transporter ───────────────────────────────────────────────────
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Helper: send verification email ─────────────────────────────────────────
// async function sendVerificationEmail(email, token) {
//   const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
//   await transporter.sendMail({
//     from:    `"ReLoop UMass" <${process.env.EMAIL_USER}>`,
//     to:      email,
//     subject: 'Verify your ReLoop UMass account',
//     html: `...`,
//   });
// }

// ─── POST /api/auth/register ──────────────────────────────────────────────────
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

    // Hash password into passwordHash (matches the schema field name).
    const salt         = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate a random verification token.
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      name,
      email:             email.toLowerCase(),
      passwordHash,                           // ← correct field name
      verificationToken,
      verified:          true,               // must verify email before logging in
    });

    // await sendVerificationEmail(newUser.email, verificationToken);

    return res.status(201).json({
      message: 'Account created! Please check your @umass.edu inbox to verify your email before logging in.',
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ─── GET /api/auth/verify/:token ─────────────────────────────────────────────
// The link in the email hits this endpoint.
// Marks the user as verified and redirects to the login page.
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired verification link.' });

    user.verified          = true;
    user.verificationToken = null; // clear the token — one-time use
    await user.save();

    // Redirect to the frontend login page with a success flag.
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);

  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
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

    // Block login if email not verified yet.
    if (!user.verified)
      return res.status(403).json({ message: 'Please verify your @umass.edu email before logging in. Check your inbox.' });

    // Compare against passwordHash (correct field name).
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;