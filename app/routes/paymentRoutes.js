const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/payment/make', authMiddleware.authAdminAccounts, validation.validatePayment,paymentController.makePayment);
router.get('/payment/invoice/:invoiceId', authMiddleware.authAdminAccounts, paymentController.getAllPaymentsForInvoice);

router.get('/payment/:id', authMiddleware.authAdminAccounts,paymentController.getPaymentById);
router.put('/payment/:id/edit', authMiddleware.authAdminAccounts, paymentController.editPaymentData);
router.delete('/payment/:id/delete', authMiddleware.authAdminAccounts,paymentController.deletePayment);

module.exports = router;
