// app\routes\invoiceRoutes.js

const express = require('express');
const invoiceController = require('../controllers/invoiceController'); // Corrected import
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');
const invoiceItemRoutes = require('./invoiceItemRoutes');
const PDFController = require('../controllers/PDFController');
const paymentRoutes = require('./paymentRoutes');
const router = express.Router();

router.get('/invoice/:id/pdf', PDFController.GetInvoicePdfDetails);
router.post('/invoice/create', validation.validateInvoice, invoiceController.createInvoice); // Corrected route and validation
router.get('/invoice/all', invoiceController.getAllInvoices); // Corrected route
router.get('/invoice/:id', invoiceController.getInvoiceById); // Corrected route
router.put('/invoice/:id/edit', invoiceController.editInvoiceData); // Corrected route and validation
router.delete('/invoice/:id/delete', invoiceController.deleteInvoice); // Corrected route

router.use(invoiceItemRoutes);
router.use(paymentRoutes);

module.exports = router;

