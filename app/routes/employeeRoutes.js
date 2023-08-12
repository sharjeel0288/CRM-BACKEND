const express = require('express');
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


// Get announcements by employee email
router.get('/employee/announcements', authMiddleware.authenticateEmployee, employeeController.getAnnouncementsByEmployeeEmail);

// Change announcement status
router.patch('/employee/announcement/:id/status',authMiddleware.authenticateEmployee, employeeController.changeAnnouncementStatus);

module.exports = router;
