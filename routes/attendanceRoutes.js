const express = require('express');
const { markAttendance, getUserAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/mark', markAttendance);
router.get('/my-attendance', getUserAttendance);

module.exports = router;