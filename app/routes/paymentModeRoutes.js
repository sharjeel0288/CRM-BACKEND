const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const paymentModeController = require('../controllers/paymentModeController');
const validation = require('../utils/validation');

const router = express.Router();

router.post('/payment-modes', validation.validatePaymentMode, paymentModeController.createPaymentMode);
router.get('/payment-modes',  paymentModeController.getAllPaymentModes);
router.get('/payment-modes/:id', paymentModeController.getPaymentModeById);
router.put('/payment-modes/:id',  paymentModeController.updatePaymentMode);
router.delete('/payment-modes/:id',  paymentModeController.deletePaymentMode);

module.exports = router;
