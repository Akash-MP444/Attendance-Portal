const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Login route for both students and teachers
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be studentId or teacherId
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide identifier and password' });
    }

    const db = getDB();

    // Check if it's a student
    let user = await db.collection('students').findOne({ studentId: identifier });
    let role = 'student';

    if (!user) {
      // Check if it's a teacher
      user = await db.collection('teachers').findOne({ teacherId: identifier });
      role = 'teacher';
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user: { ...user, role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;