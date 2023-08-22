// app/routes/invoiceItemRoutes.js

const express = require('express');
const invoiceItemController = require('../controllers/invoiceItemController');
const authMiddleware = require('../middleware/authMiddleware');
const validation = require('../utils/validation');

const router = express.Router();

router.post('/invoice/:invoice_id/item/add',  validation.validateInvoiceItem, invoiceItemController.addInvoiceItem);
router.delete('/invoice/item/:id/delete',  invoiceItemController.deleteInvoiceItem);
router.put('/invoice/item/:id/edit',   invoiceItemController.editInvoiceItem);

module.exports = router;

