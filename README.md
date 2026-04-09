# Attendance Portal

A comprehensive student attendance management system built with Node.js, Express, and MongoDB.

## Features

- **Student Management**: Track student attendance across multiple subjects
- **Teacher Dashboard**: View and update student attendance records
- **Bulk Attendance Updates**: Update attendance for multiple students at once
- **Authentication**: Secure JWT-based authentication for students and teachers
- **Input Validation**: Comprehensive validation for all API inputs
- **Database Seeding**: Initialize the database with sample data
- **RESTful API**: Clean and intuitive API endpoints
- **Role-based Access Control**: Proper permissions for different user types

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Akash-MP444/Attendance-Portal.git
   cd Attendance-Portal
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/student_attendance
   JWT_SECRET=your-super-secret-key-here
   PORT=5000
   ```

5. Start MongoDB service (if running locally)

6. Run the server:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login for students and teachers
- `GET /api/auth/profile` - Get current user profile

### Students
- `GET /api/students` - Get all students (teachers only)
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id/attendance` - Update student attendance (teachers only)
- `PUT /api/students/bulk-attendance` - Bulk update attendance for multiple students (teachers only)

### Utilities
- `GET /api/initialize` - Initialize database with sample data
- `GET /api/health` - Health check

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Input Validation

The API includes comprehensive input validation:
- Required fields are checked
- Data types are validated (strings, integers)
- Passwords must be at least 6 characters
- Attendance values must be non-negative integers
- Bulk operations validate array structures

## Error Handling

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

## Project Structure

```
backend/
├── db.js                 # Database connection
├── server.js             # Main server file
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── students.js       # Student management routes
│   └── teachers.js       # Teacher-specific routes
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (not in repo)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.