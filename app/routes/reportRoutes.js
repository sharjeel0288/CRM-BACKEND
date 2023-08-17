const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/reports/admin',  reportController.getReports);
router.get('/reports/sales', authMiddleware.authenticateSalesEmployee, reportController.getSalesReports);
router.get('/reports/accounts', authMiddleware.authenticateAccountsEmployee, reportController.getAccountsReports);

module.exports = router;
