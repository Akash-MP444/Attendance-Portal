const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// Public subject averages
router.get('/subjects/averages', auth, roles(['teacher','admin','student']), attendanceController.subjectAverages);

// Low attendance list (teacher/admin)
router.get('/low', auth, roles(['teacher','admin']), attendanceController.lowAttendance);

// Export low attendance CSV (teacher/admin)
router.get('/low/export', auth, roles(['teacher','admin']), attendanceController.exportLowAttendanceCsv);

// Student summary (student or teacher/admin)
router.get('/students/:studentId/summary', auth, roles([]), attendanceController.studentSummary);

module.exports = router;
