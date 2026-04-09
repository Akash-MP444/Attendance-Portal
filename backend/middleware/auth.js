const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();

    const collection = decoded.role === 'student' ? 'students' : 'teachers';
    const user = await db.collection(collection).findOne({ _id: new ObjectId(decoded.id) });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    delete user.password;
    req.user = user;
    req.user.role = decoded.role;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};