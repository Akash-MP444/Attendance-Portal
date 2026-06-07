const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, getDB } = require('./db');
const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const rateLimit = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// Basic security headers
app.use(helmet());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimit);

// CORS - allow localhost dev origins and configurable ALLOWED_ORIGIN in prod
const allowedOrigins = [process.env.ALLOWED_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // otherwise reject
    return callback(new Error('Not allowed by CORS'), false);
  },
  optionsSuccessStatus: 200
};
app.use((req, res, next) => {
  cors(corsOptions)(req, res, err => {
    if (err) {
      // log and continue so developer sees CORS issues
      console.warn('CORS error:', err.message);
      return res.status(403).json({ success: false, message: 'CORS Error' });
    }
    next();
  });
});

// Body parser
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/analytics', require('./routes/analytics'));

// --- AUTO DATABASE SEED ROUTE --- //
app.get('/api/initialize', async (req, res) =>
{
  try {
    const db = getDB();

    // Check if data already exists
    const existingStudent = await db.collection('students').findOne({});
    const existingTeacher = await db.collection('teachers').findOne({});
    if (existingStudent || existingTeacher) {
      console.log('Data exists, clearing and reinitializing...');
      await db.collection('students').deleteMany({});
      await db.collection('teachers').deleteMany({});
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

// Centralized error handler
app.use(errorHandler);

// Start Server with error handling for address-in-use
const PORT = config.port || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 MongoDB connected and ready`);
  console.log(`👉 Initialize sample data at: POST http://localhost:${PORT}/api/initialize`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Ensure no other server is running on this port.`);
    process.exit(1);
  }
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } catch (e) {
    console.error('Error during shutdown', e);
    process.exit(1);
  }
});
