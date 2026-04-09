const express = require('express');
const { getDB } = require('../db');
const auth = require('../middleware/auth');

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
router.put('/:id/attendance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { subject, attendedClasses, totalClasses } = req.body;
    if (!subject || attendedClasses === undefined || totalClasses === undefined) {
      return res.status(400).json({ message: 'Please provide subject, attendedClasses, and totalClasses' });
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

module.exports = router;