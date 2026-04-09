const express = require('express');
const { getDB } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all teachers (for admins, but since no admin, maybe restrict)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const db = getDB();
    const teachers = await db.collection('teachers').find({}, { projection: { password: 0 } }).toArray();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students by subject (for teachers)
router.get('/students/:subject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if teacher teaches this subject
    if (!req.user.subjects.includes(req.params.subject)) {
      return res.status(403).json({ message: 'You do not teach this subject' });
    }

    const db = getDB();
    const students = await db.collection('students').find(
      {},
      {
        projection: {
          password: 0,
          attendance: {
            $elemMatch: { subject: req.params.subject }
          }
        }
      }
    ).toArray();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance statistics for a subject
router.get('/stats/:subject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.user.subjects.includes(req.params.subject)) {
      return res.status(403).json({ message: 'You do not teach this subject' });
    }

    const db = getDB();
    const students = await db.collection('students').find({}).toArray();

    const attendanceData = students.map(student => {
      const subjectAttendance = student.attendance.find(a => a.subject === req.params.subject);
      return {
        studentId: student.studentId,
        name: student.name,
        percentage: subjectAttendance ? subjectAttendance.percentage : 0
      };
    });

    const avgPercentage = attendanceData.reduce((sum, s) => sum + s.percentage, 0) / attendanceData.length;
    const above75 = attendanceData.filter(s => s.percentage >= 75).length;
    const below50 = attendanceData.filter(s => s.percentage < 50).length;

    res.json({
      subject: req.params.subject,
      totalStudents: attendanceData.length,
      averagePercentage: parseFloat(avgPercentage.toFixed(2)),
      studentsAbove75: above75,
      studentsBelow50: below50,
      attendanceData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;