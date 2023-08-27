const express = require('express');
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


// Get announcements by employee email
router.get('/employee/announcements', authMiddleware.authenticateEmployee, employeeController.getAnnouncementsByEmployeeEmail);

// Change announcement status
router.patch('/employee/announcement/:id/status',authMiddleware.authenticateEmployee, employeeController.changeAnnouncementStatus);


// Get quotes or invoices based on the department of the employee
router.get('/employee/documents', authMiddleware.authenticateEmployee, employeeController.getDocumentsByDepartment);


router.get('/employee/lost-quotes',authMiddleware.authenticateSalesEmployee, employeeController.getLostQuotesByEmployee);
router.put('/employee/lost-quotes/:lostQuoteId/mark-as-done', employeeController.markAsDone);


module.exports = router;
