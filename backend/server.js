const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));

// --- AUTO DATABASE SEED ROUTE --- //
app.get('/api/initialize', async (req, res) =>
{
  try {
    const db = getDB();

    // Check if data already exists
    const existingStudent = await db.collection('students').findOne({});
    const existingTeacher = await db.collection('teachers').findOne({});
    if (existingStudent || existingTeacher) {
      return res.json({ message: 'Sample data already exists' });
    }

    const bcrypt = require('bcryptjs');

    // Subjects list
    const subjects = [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Computer Science',
      'Biology'
    ];

    // Generate 30 sample students
    const students = [];
    for (let i = 1; i <= 30; i++) {
      const attendance = subjects.map(subject => {
        const totalClasses = 30;
        const attendedClasses = Math.floor(Math.random() * totalClasses);
        return {
          subject,
          totalClasses,
          attendedClasses,
          percentage: parseFloat(((attendedClasses / totalClasses) * 100).toFixed(2))
        };
      });

      students.push({
        studentId: `2023${i.toString().padStart(3, '0')}`,
        name: `Student ${i}`,
        email: `student${i}@college.edu`,
        class: `Class ${String.fromCharCode(65 + (i % 3))}`, // Class A, B, or C
        password: await bcrypt.hash('password123', 12),
        attendance,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Generate 3 sample teachers
    const teachers = [
      {
        teacherId: 'T001',
        name: 'Dr. Alice Smith',
        email: 'alice.smith@college.edu',
        password: await bcrypt.hash('password123', 12),
        subjects: ['Mathematics', 'Physics'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teacherId: 'T002',
        name: 'Prof. John Brown',
        email: 'john.brown@college.edu',
        password: await bcrypt.hash('password123', 12),
        subjects: ['Chemistry', 'Biology'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teacherId: 'T003',
        name: 'Ms. Clara Wilson',
        email: 'clara.wilson@college.edu',
        password: await bcrypt.hash('password123', 12),
        subjects: ['Computer Science'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert data into MongoDB
    await db.collection('students').insertMany(students);
    await db.collection('teachers').insertMany(teachers);

    res.json({
      message: '✅ Database initialized with 30 students and 3 teachers',
      sampleLogin: {
        student: { studentId: '2023001', password: 'password123' },
        teacher: { teacherId: 'T001', password: 'password123' }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initializing data', error: error.message });
  }
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ message: '✅ Server is running and healthy!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 MongoDB connected and ready`);
  console.log(`👉 Initialize sample data at: POST http://localhost:${PORT}/api/initialize`);
});
