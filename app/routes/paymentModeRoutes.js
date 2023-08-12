const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const paymentModeController = require('../controllers/paymentModeController');
const validation = require('../utils/validation');

const router = express.Router();

router.post('/payment-modes', authMiddleware.authenticateAdmin, validation.validatePaymentMode, paymentModeController.createPaymentMode);
router.get('/payment-modes', authMiddleware.authenticateAdmin, paymentModeController.getAllPaymentModes);
router.get('/payment-modes/:id', authMiddleware.authenticateAdmin, paymentModeController.getPaymentModeById);
router.put('/payment-modes/:id', authMiddleware.authenticateAdmin, validation.validatePaymentMode, paymentModeController.updatePaymentMode);
router.delete('/payment-modes/:id', authMiddleware.authenticateAdmin, paymentModeController.deletePaymentMode);

module.exports = router;
