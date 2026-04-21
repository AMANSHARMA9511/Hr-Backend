const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// Better CORS configuration
app.use(cors({
  origin: [
    'https://hr-frontend-five-phi.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HR API is working!',
    status: 'active'
  });
});

// ✅ IMPORTANT: Add this /api route
app.get('/api', (req, res) => {
  res.json({
    message: 'HR Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      login: '/api/auth/login',
      register: '/api/auth/register',
      leave: '/api/leave',
      attendance: '/api/attendance',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});