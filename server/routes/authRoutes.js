
const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { hashPassword, comparePassword } = require("../utils/hashing");
const { signToken } = require("../utils/jwt");
const auth = require("../middleware/authMiddleware");
const cookie = require('cookie');

const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }));
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    
    // Support legacy "name" field if sent
    const fName = first_name || req.body.name?.split(' ')[0] || 'User';
    const lName = last_name || req.body.name?.split(' ').slice(1).join(' ') || '';

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password.length < 6) return res.status(400).json({ message: 'Password too short (min 6)' });

    // Check uniqueness
    const eQ = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (eQ.rows.length > 0) return res.status(409).json({ message: 'Email already registered' });

    // Generate username
    const base = `${fName}${lName}`.replace(/\s+/g, '').toLowerCase() || email.split('@')[0];
    let username = base;
    let i = 0;
    while (true) {
        const uQ = await db.query('SELECT id FROM users WHERE username=$1', [username]);
        if (uQ.rows.length === 0) break;
        i += 1;
        username = `${base}${i}`;
    }

    const password_hash = await hashPassword(password);

    // Insert User
    // Note: Assuming table 'users' exists as per your schema
    const insert = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id, username, email, role`,
      [fName, lName, username, email.toLowerCase(), password_hash, 'user']
    );

    const user = insert.rows[0];
    const token = signToken({ id: user.id, role: user.role, username: user.username, email: user.email });

    setAuthCookie(res, token);

    return res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, name: `${fName} ${lName}` } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const q = await db.query('SELECT id, username, email, password_hash, role, first_name, last_name FROM users WHERE email=$1', [email.toLowerCase()]);
    const user = q.rows[0];
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, role: user.role, username: user.username, email: user.email });

    setAuthCookie(res, token);

    return res.json({ 
        success: true, 
        token, 
        user: { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role,
            name: `${user.first_name} ${user.last_name}`.trim()
        } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }));
  return res.json({ success: true });
});

// Me
router.get("/me", auth, async (req, res) => {
  try {
    const q = await db.query('SELECT id, first_name, last_name, username, email, role, created_at FROM users WHERE id=$1', [req.user.id]);
    if (q.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = q.rows[0];
    res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`.trim(),
        username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
