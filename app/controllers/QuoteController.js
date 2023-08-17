// app\controllers\QuoteController.js
const Quote = require('../model/Quote');

const createQuote = async (req, res) => {
    try {
        const quoteData = req.body.quoteData;
        const quoteItemsData = req.body.quoteItemsData;

        const newQuoteId = await Quote.createQuote(quoteData, quoteItemsData);
        res.status(201).json({ success: true, message: 'Quote created successfully', quoteId: newQuoteId });
    } catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote', error: error.message });
    }
};
const getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote.getAllQuotes();
        const QuotesWithDetails = [];

        for (const quote of quotes) {
            const quotesData = await Quote.getQuoteById(quote.id);
            const quotesItemsData = await Quote.getQuoteItemsByQuoteId(quote.id);

            QuotesWithDetails.push({
                quotesData,
                quotesItemsData
            });
        }

        res.status(200).json({ success: true, Quote: QuotesWithDetails });
    } catch (error) {
        console.error('Get all Quote error:', error);
        res.status(500).json({ success: false, message: 'Failed to get Quote', error: error.message });
    }
};

const getQuoteById = async (req, res) => {
    const quoteId = req.params.id;

    try {
        const quoteData = await Quote.getQuoteById(quoteId);
        if (!quoteData) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        const quoteItemsData = await Quote.getQuoteItemsByQuoteId(quoteId);

        const quoteWithDetails = {
            quoteData,
            quoteItemsData
        };

        res.status(200).json({ success: true, quote: quoteWithDetails });
    } catch (error) {
        console.error('Get quote by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quote', error: error.message });
    }
};


const editQuoteData = async (req, res) => {
    const quoteId = req.params.id;
    const updatedQuoteData = req.body;

    try {
        const existingQuote = await Quote.getQuoteById(quoteId);
        if (!existingQuote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Update the quote data fields
        await Quote.updateQuoteData(quoteId, updatedQuoteData);

        res.status(200).json({ success: true, message: 'Quote data updated successfully' });
    } catch (error) {
        console.error('Edit quote data error:', error);
        res.status(500).json({ success: false, message: 'Failed to update quote data', error: error.message });
    }

};

const deleteQuote = async (req, res) => {
    const quoteId = req.params.id;

    try {
        const existingQuote = await Quote.getQuoteById(quoteId);
        if (!existingQuote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Delete quote items first
        await Quote.deleteQuoteItems(quoteId);

        // Delete the quote data
        await Quote.deleteQuote(quoteId);

        res.status(200).json({ success: true, message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Delete quote error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete quote', error: error.message });
    }
};


module.exports = {
    createQuote,
    getAllQuotes,
    getQuoteById,
    editQuoteData,
    deleteQuote,
};
