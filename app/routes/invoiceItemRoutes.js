// app/routes/invoiceItemRoutes.js

const express = require('express');
const invoiceItemController = require('../controllers/invoiceItemController');
const authMiddleware = require('../middleware/authMiddleware');
const validation = require('../utils/validation');

const router = express.Router();

router.post('/invoice/:invoice_id/item/add', authMiddleware.authAdminSales, validation.validateInvoiceItem, invoiceItemController.addInvoiceItem);
router.delete('/invoice/item/:id/delete', authMiddleware.authAdminSales, invoiceItemController.deleteInvoiceItem);
router.put('/invoice/item/:id/edit', authMiddleware.authAdminSales,  invoiceItemController.editInvoiceItem);

module.exports = router;

