const { getDB } = require('../db');

async function getSubjectAverages() {
  const db = getDB();
  // unwind attendance array and group by subject to compute averages
  const pipeline = [
    { $unwind: '$attendance' },
    { $group: {
      _id: '$attendance.subject',
      averagePercentage: { $avg: '$attendance.percentage' },
      totalStudents: { $sum: 1 }
    }},
    { $project: { subject: '$_id', averagePercentage: { $round: ['$averagePercentage', 2] }, totalStudents: 1, _id: 0 } }
  ];
  const results = await db.collection('students').aggregate(pipeline).toArray();
  return results;
}

async function getLowAttendance(threshold = 75) {
  const db = getDB();
  const pipeline = [
    { $unwind: '$attendance' },
    { $match: { 'attendance.percentage': { $lt: threshold } } },
    { $project: { studentId: 1, name: 1, subject: '$attendance.subject', percentage: '$attendance.percentage', _id: 0 } }
  ];
  return await db.collection('students').aggregate(pipeline).toArray();
}

async function getStudentSummary(studentId) {
  const db = getDB();
  const student = await db.collection('students').findOne({ studentId }, { projection: { password: 0 } });
  if (!student) return null;
  const overall = student.attendance.reduce((acc, cur) => acc + cur.percentage, 0) / (student.attendance.length || 1);
  return { studentId: student.studentId, name: student.name, class: student.class, overallPercentage: parseFloat(overall.toFixed(2)), attendance: student.attendance };
}

module.exports = { getSubjectAverages, getLowAttendance, getStudentSummary };
