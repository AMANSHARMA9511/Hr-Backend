const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('userId', 'name email').sort({ appliedDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/reject leave
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    // If approving, update leave balance
    if (status === 'Approved' && leave.status === 'Pending') {
      const user = await User.findById(leave.userId);
      if (user.leaveBalance >= leave.totalDays) {
        user.leaveBalance -= leave.totalDays;
        await user.save();
      } else {
        return res.status(400).json({ message: 'Insufficient leave balance' });
      }
    }
    
    // If rejecting and was approved before, add back balance
    if (status === 'Rejected' && leave.status === 'Approved') {
      const user = await User.findById(leave.userId);
      user.leaveBalance += leave.totalDays;
      await user.save();
    }
    
    leave.status = status;
    await leave.save();
    
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let filter = {};
    
    if (employeeId) filter.userId = employeeId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(filter).populate('userId', 'name email');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllEmployees, getAllLeaves, updateLeaveStatus, getAllAttendance };