// app/controllers/quoteItemController.js

const QuoteItem = require('../model/QuoteItem');

const addQuoteItem = async (req, res) => {
  try {
    const { quote_id } = req.params;
    const newItemId = await QuoteItem.addQuoteItem(quote_id, req.body);
    res.status(201).json({ success: true, message: 'Quote item added successfully', itemId: newItemId });
  } catch (error) {
    console.error('Add quote item error:', error);
    res.status(500).json({ success: false, message: 'Failed to add quote item', error: error.message });
  }
};

const deleteQuoteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await QuoteItem.deleteQuoteItem(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Quote item not found.' });
    }
    res.status(200).json({ success: true, message: 'Quote item deleted successfully' });
  } catch (error) {
    console.error('Delete quote item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quote item', error: error.message });
  }
};

const editQuoteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await QuoteItem.editQuoteItem(id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Quote item not found.' });
    }
    res.status(200).json({ success: true, message: 'Quote item edited successfully' });
  } catch (error) {
    console.error('Edit quote item error:', error);
    res.status(500).json({ success: false, message: 'Failed to edit quote item', error: error.message });
  }
};

module.exports = {
  addQuoteItem,
  deleteQuoteItem,
  editQuoteItem,
};
