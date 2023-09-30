// app\routes\QuoteRoutes.js
const express = require('express');
const quoteController = require('../controllers/QuoteController');
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');
const PDFController = require('../controllers/PDFController');
const quoteItemRoutes = require('./quoteItemRoutes');
const router = express.Router();

router.get('/quote/getAllApprovedByClientQuotes', quoteController.getAllApprovedByClientQuotes);

router.get('/quote/:id/pdf', authMiddleware.authAdminSales, PDFController.GetQuotePdfDetails);
router.post('/quote/create', validation.validateQuote, quoteController.createQuote);
router.get('/quote/all', quoteController.getAllQuotes);
router.get('/quote/:id', authMiddleware.authAdminSales, quoteController.getQuoteById);
router.put('/quote/:id/edit', authMiddleware.authAdminSales, quoteController.editQuoteData);
router.delete('/quote/:id/delete', authMiddleware.authAdminSales, quoteController.deleteQuote);
router.patch('/quotes/:quoteId/approval', quoteController.updateApprovalStatus);
router.get('/quote/:status/adminStatus', quoteController.getAllQuotesWithAdminStatus);
router.get('/quote/assignQuote/:employeeId', quoteController.getAllAssignedQuotes);
router.patch('/quote/:quoteId/approvedByClient', quoteController.updateApprovedByClient);
router.post('/quote/convertQuoteToInvoice', quoteController.convertQuoteToInvoice);
router.post('/quote/convertQuoteToInvoice', quoteController.convertQuoteToInvoice);

router.patch('/quote/updateAssignedStatus/:quoteId', quoteController.updateAssignedQuoteStatus);


router.use(quoteItemRoutes);

module.exports = router;
