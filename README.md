# 🚀 Backend - Employee Leave & Attendance Management System

## 📌 Overview
This backend service powers the Employee Leave & Attendance Management System. It provides REST APIs for authentication, leave management, attendance tracking, and admin controls.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt (Password hashing)

---

## 📂 Project Structure
backend/
│── controllers/
│── models/
│── routes/
│── middleware/
│── config/
│── server.js



---

## 🔐 Features

### 1. Authentication
- User Registration (Employee/Admin)
- Login with JWT
- Password hashing using bcrypt

### 2. Role-Based Access
- Employee: Limited access (own data only)
- Admin: Full system access

### 3. Leave Management
- Apply for leave
- Edit/Cancel pending leave
- Admin can approve/reject leave
- Leave balance auto-update

### 4. Attendance Management
- Mark daily attendance
- Restriction: One record per day
- No future attendance allowed
- Admin can view all records
