// app\routes\adminRoutes.js
const express = require('express');
const adminController = require('../controllers/adminController');
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// admin
router.post('/admin/signup', validation.validateAdminSignup, adminController.adminSignup);

// employee
router.post('/admin/create-employee', authMiddleware.authenticateAdmin, validation.validateEmployee, adminController.createEmployee);
router.delete('/admin/delete-employee/:id', authMiddleware.authenticateAdmin, adminController.deleteEmployee);
router.get('/admin/all-employees', authMiddleware.authenticateAdmin, adminController.getAllEmployees);
router.get('/admin/employee/:id', authMiddleware.authenticateAdmin, adminController.getEmployeeById);

// announcement
router.post('/admin/create-announcement', authMiddleware.authenticateAdmin, validation.validateAnnouncement, adminController.createAnnouncement);
router.delete('/admin/delete-announcement/:announcementId', authMiddleware.authenticateAdmin, adminController.deleteAnnouncement);
router.get('/admin/all-announcements', authMiddleware.authenticateAdmin, adminController.getAllAnnouncements); // New route to get all announcements
router.get('/admin/announcement/:announcementId', authMiddleware.authenticateAdmin, adminController.getAnnouncementById); // New route to get announcement by ID


// Get all quotes with quote items created by an employee with the "sales" department
router.get('/admin/quotes-by-employee/:employeeId', authMiddleware.authenticateAdmin, adminController.getAllQuotesByEmployeeId);

// Get all invoices and invoice items by employee ID
router.get('/admin/invoices-and-items-by-employee/:employeeId', authMiddleware.authenticateAdmin, adminController.getAllInvoicesAndItemsByEmployeeId);


module.exports = router;

