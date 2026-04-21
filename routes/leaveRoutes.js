const express = require('express');
const { applyLeave, getUserLeaves, updateLeave, cancelLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/apply', applyLeave);
router.get('/my-leaves', getUserLeaves);
router.put('/:id', updateLeave);
router.delete('/:id', cancelLeave);

module.exports = router;