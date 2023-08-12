// app/routes/quoteItemRoutes.js

const express = require('express');
const quoteItemController = require('../controllers/quoteItemController');
const authMiddleware = require('../middleware/authMiddleware');
const validation = require('../utils/validation');

const router = express.Router();

router.post('/quote/:quote_id/item/add',  authMiddleware.authAdminAccounts, validation.validateQuoteItem, quoteItemController.addQuoteItem);
router.delete('/quote/item/:id/delete', authMiddleware.authAdminAccounts, quoteItemController.deleteQuoteItem);
router.put('/quote/item/:id/edit',  authMiddleware.authAdminAccounts, validation.validateQuoteItem, quoteItemController.editQuoteItem);

module.exports = router;
