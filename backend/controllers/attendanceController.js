const attendanceService = require('../services/attendanceService');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

async function subjectAverages(req, res, next) {
  try {
    const results = await attendanceService.getSubjectAverages();
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

async function lowAttendance(req, res, next) {
  try {
    const threshold = parseFloat(req.query.threshold) || 75;
    const results = await attendanceService.getLowAttendance(threshold);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

async function studentSummary(req, res, next) {
  try {
    const studentId = req.params.studentId;
    const summary = await attendanceService.getStudentSummary(studentId);
    if (!summary) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

async function exportLowAttendanceCsv(req, res, next) {
  try {
    const threshold = parseFloat(req.query.threshold) || 75;
    const rows = await attendanceService.getLowAttendance(threshold);

    const csvStringifier = createCsvWriter({
      header: [
        { id: 'studentId', title: 'Student ID' },
        { id: 'name', title: 'Name' },
        { id: 'subject', title: 'Subject' },
        { id: 'percentage', title: 'Percentage' }
      ]
    });

    const header = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="low_attendance_${threshold}.csv"`);
    res.send(header + body);
  } catch (err) {
    next(err);
  }
}

module.exports = { subjectAverages, lowAttendance, studentSummary, exportLowAttendanceCsv };
