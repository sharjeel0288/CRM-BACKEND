const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/payment/make', validation.validatePayment,paymentController.makePayment);
router.get('/payment/invoice/:invoiceId', paymentController.getAllPaymentsForInvoice);

router.get('/payment/:id', authMiddleware.authAdminAccounts,paymentController.getPaymentById);
router.put('/payment/:id/edit',  paymentController.editPaymentData);
router.delete('/payment/:id/delete', authMiddleware.authAdminAccounts,paymentController.deletePayment);

module.exports = router;
