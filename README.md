# 🎓 Attendance Portal

A full-stack Attendance Management System built using **Node.js, Express.js, MongoDB, JWT Authentication, and Role-Based Access Control**. The system enables teachers to manage attendance records efficiently while allowing students to view their attendance information securely.

---

## 🚀 Features

### Authentication & Security

* JWT-based Authentication
* Secure Password Hashing using bcryptjs
* Protected API Routes
* Role-Based Access Control (RBAC)
* Input Validation and Error Handling

### Student Features

* Secure Login
* View Attendance Details
* View Attendance Percentage
* Access Personal Profile

### Teacher Features

* Secure Login
* View All Students
* Update Student Attendance
* Bulk Attendance Updates
* Manage Attendance Records

### System Features

* MongoDB Database Integration
* RESTful API Architecture
* Database Seeding with Sample Data
* Centralized Error Handling
* CORS Support
* Environment Variable Configuration

---

## 🛠️ Tech Stack

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Backend Runtime           |
| Express.js | API Framework             |
| MongoDB    | Database                  |
| JWT        | Authentication            |
| bcryptjs   | Password Hashing          |
| CORS       | Cross-Origin Requests     |
| dotenv     | Environment Configuration |

---

## 📂 Project Structure

```text
Attendance-Portal/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   └── teachers.js
│   │
│   ├── package.json
│   ├── .env
│   └── README.md
│
└── frontend/
    └── index.html
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Akash-MP444/Attendance-Portal.git
cd Attendance-Portal
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/student_attendance
JWT_SECRET=your-secret-key
PORT=5000
```

---

### 4. Start MongoDB

Ensure MongoDB service is running.

---

### 5. Start Backend Server

Development Mode:

```bash
npm run dev
```

Production Mode:

```bash
npm start
```

Expected Output:

```text
🚀 Server running on port 5000
📦 MongoDB connected and ready
```

---

### 6. Initialize Sample Data

Open:

```text
http://localhost:5000/api/initialize
```

or send:

```bash
curl -X POST http://localhost:5000/api/initialize
```

---

### 7. Start Frontend

⚠️ Do NOT open `index.html` directly.

Serve the frontend using a local server:

```bash
cd frontend
python -m http.server 3000
```

or

```bash
npx serve . -l 3000
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Demo Credentials

### Student Login

```text
Student ID: 2023001
Password: password123
```

### Teacher Login

```text
Teacher ID: T001
Password: password123
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| POST   | /api/auth/login   | User Login           |
| GET    | /api/auth/profile | Current User Profile |

---

### Students

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | /api/students                 | Get All Students       |
| GET    | /api/students/:id             | Get Student            |
| PUT    | /api/students/:id/attendance  | Update Attendance      |
| PUT    | /api/students/bulk-attendance | Bulk Attendance Update |

---

### Utilities

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| GET    | /api/health     | Health Check     |
| POST   | /api/initialize | Seed Sample Data |

---

## ✅ API Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": []
}
```

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing with bcryptjs
* Role-Based Authorization
* Protected Routes
* Input Validation
* Environment Variable Protection

---

## 📈 Future Improvements

* Attendance Analytics Dashboard
* Subject-wise Attendance Reports
* Charts and Data Visualization
* CSV / Excel Export
* Admin Dashboard
* Email Notifications
* QR Code Attendance System
* Docker Support
* Automated Testing
* CI/CD Pipeline

---

## 👨‍💻 Author

**Akash MP**

GitHub: https://github.com/Akash-MP444

---

