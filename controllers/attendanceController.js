const Attendance = require('../models/Attendance');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;

    if (!date || !status) {
      return res.status(400).json({ message: 'Date and status are required' });
    }

    const attendanceDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if date is future
    if (attendanceDate > todayStart) {
      return res.status(400).json({ message: 'Cannot mark attendance for future dates' });
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }
    
    const attendance = await Attendance.create({
      userId: req.user._id,
      date: attendanceDate,
      status
    });
    
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's attendance
const getUserAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, getUserAttendance };