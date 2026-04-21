const express = require('express');
const { getAllEmployees, getAllLeaves, updateLeaveStatus, getAllAttendance } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/employees', getAllEmployees);
router.get('/leaves', getAllLeaves);
router.put('/leaves/:id', updateLeaveStatus);
router.get('/attendance', getAllAttendance);

module.exports = router;