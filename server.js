const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
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

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'HR API is working!',
    status: 'active'
  });
});

// Health check with MongoDB status
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

// ✅ FIXED: MongoDB connection with timeout options and retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 50000,     // 50 seconds - Wait for server selection
      socketTimeoutMS: 60000,              // 60 seconds - Socket timeout
      connectTimeoutMS: 50000,             // 50 seconds - Connection timeout
      heartbeatFrequencyMS: 10000,         // 10 seconds - Heartbeat every 10s
      retryWrites: true,
      maxPoolSize: 10,
    });
    console.log('✅ MongoDB connected successfully');
    console.log('📀 Database:', mongoose.connection.name);
    console.log('📍 Host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Call the connection function
connectDB();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});