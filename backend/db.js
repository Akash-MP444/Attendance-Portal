const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;
let client = null;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ MongoDB Connected');
    
    // Create indexes
    await db.collection('students').createIndex({ studentId: 1 }, { unique: true });
    await db.collection('teachers').createIndex({ teacherId: 1 }, { unique: true });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not initialized!');
  return db;
};

module.exports = { connectDB, getDB };