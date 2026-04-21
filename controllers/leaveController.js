const Leave = require('../models/Leave');
const User = require('../models/User');

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const { type, leaveType, startDate, endDate, reason } = req.body;
    const normalizedType = type || leaveType;

    if (!normalizedType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Leave type, start date and end date are required' });
    }
    
    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const leave = await Leave.create({
      userId: req.user._id,
      type: normalizedType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending'
    });
    
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's leaves
const getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id }).sort({ appliedDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update leave (only if pending)
const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, leaveType, startDate, endDate, reason } = req.body;
    const normalizedType = type || leaveType;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending leaves can be updated' });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      leave.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    leave.type = normalizedType || leave.type;
    leave.startDate = startDate || leave.startDate;
    leave.endDate = endDate || leave.endDate;
    leave.reason = reason || leave.reason;
    
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel leave
const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    
    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
    }
    
    await leave.deleteOne();
    res.json({ message: 'Leave cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getUserLeaves, updateLeave, cancelLeave };