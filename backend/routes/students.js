const express = require('express');
const { getDB } = require('../db');
const auth = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Get all students (for teachers/admins)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = getDB();
    const students = await db.collection('students').find({}, { projection: { password: 0 } }).toArray();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const db = getDB();
    const student = await db.collection('students').findOne(
      { studentId: req.params.id },
      { projection: { password: 0 } }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Students can only view their own data, teachers can view all
    if (req.user.role === 'student' && req.user.studentId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance (for teachers)
router.put('/:id/attendance', auth, [
  param('id').notEmpty().withMessage('Student ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('attendedClasses').isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer'),
  body('totalClasses').isInt({ min: 1 }).withMessage('Total classes must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subject, attendedClasses, totalClasses } = req.body;

    // Check if teacher teaches this subject
    if (!req.user.subjects.includes(subject)) {
      return res.status(403).json({ message: 'You do not teach this subject' });
    }

    const db = getDB();
    const student = await db.collection('students').findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceIndex = student.attendance.findIndex(a => a.subject === subject);
    if (attendanceIndex === -1) {
      return res.status(400).json({ message: 'Subject not found in student attendance' });
    }

    student.attendance[attendanceIndex].attendedClasses = attendedClasses;
    student.attendance[attendanceIndex].totalClasses = totalClasses;
    student.attendance[attendanceIndex].percentage = parseFloat(((attendedClasses / totalClasses) * 100).toFixed(2));

    await db.collection('students').updateOne(
      { studentId: req.params.id },
      { $set: { attendance: student.attendance, updatedAt: new Date() } }
    );

    res.json({ message: 'Attendance updated successfully', attendance: student.attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update attendance for multiple students (for teachers)
router.put('/bulk-attendance', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('updates').isArray({ min: 1 }).withMessage('Updates must be an array with at least one item'),
  body('updates.*.studentId').notEmpty().withMessage('Student ID is required for each update'),
  body('updates.*.attendedClasses').isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer'),
  body('updates.*.totalClasses').isInt({ min: 1 }).withMessage('Total classes must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subject, updates } = req.body;
    const db = getDB();

    const results = [];
    for (const update of updates) {
      const { studentId, attendedClasses, totalClasses } = update;
      const student = await db.collection('students').findOne({ studentId });
      if (!student) {
        results.push({ studentId, success: false, message: 'Student not found' });
        continue;
      }

      const attendanceIndex = student.attendance.findIndex(a => a.subject === subject);
      if (attendanceIndex === -1) {
        results.push({ studentId, success: false, message: 'Subject not found in student attendance' });
        continue;
      }

      student.attendance[attendanceIndex].attendedClasses = attendedClasses;
      student.attendance[attendanceIndex].totalClasses = totalClasses;
      student.attendance[attendanceIndex].percentage = parseFloat(((attendedClasses / totalClasses) * 100).toFixed(2));

      await db.collection('students').updateOne(
        { studentId },
        { $set: { attendance: student.attendance, updatedAt: new Date() } }
      );

      results.push({ studentId, success: true, attendance: student.attendance.find(a => a.subject === subject) });
    }

    res.json({ message: 'Bulk attendance update completed', results });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;