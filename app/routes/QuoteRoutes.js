// app\routes\QuoteRoutes.js
const express = require('express');
const quoteController = require('../controllers/QuoteController');
const validation = require('../utils/validation');
const authMiddleware = require('../middleware/authMiddleware');
const quoteItemRoutes = require('./quoteItemRoutes');
const router = express.Router();

router.post('/quote/create', authMiddleware.authAdminSales,validation.validateQuote, quoteController.createQuote);
router.get('/quote/all', quoteController.getAllQuotes);
router.get('/quote/:id',authMiddleware.authAdminSales, quoteController.getQuoteById);
router.put('/quote/:id/edit',authMiddleware.authAdminSales, quoteController.editQuoteData); 
router.delete('/quote/:id/delete', authMiddleware.authAdminSales,quoteController.deleteQuote); 

router.use(quoteItemRoutes);

module.exports = router;
