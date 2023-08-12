// app\controllers\invoiceItemController.js

const InvoiceItem = require('../model/InvoiceItem');
const authMiddleware = require('../middleware/authMiddleware');
const validation = require('../utils/validation');

const addInvoiceItem = async (req, res) => {
    try {
        const { invoice_id } = req.params;
        const newItemId = await InvoiceItem.addInvoiceItem(invoice_id, req.body);
        res.status(201).json({ success: true, message: 'Invoice item added successfully', itemId: newItemId });
    } catch (error) {
        console.error('Add Invoice item error:', error);
        res.status(500).json({ success: false, message: 'Failed to add Invoice item', error: error.message });
    }
};

const deleteInvoiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await InvoiceItem.deleteInvoiceItem(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Invoice item not found.' });
        }
        res.status(200).json({ success: true, message: 'Invoice item deleted successfully' });
    } catch (error) {
        console.error('Delete Invoice item error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete Invoice item', error: error.message });
    }
};

const editInvoiceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await InvoiceItem.editInvoiceItem(id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Invoice item not found.' });
        }
        res.status(200).json({ success: true, message: 'Invoice item edited successfully' });
    } catch (error) {
        console.error('Edit Invoice item error:', error);
        res.status(500).json({ success: false, message: 'Failed to edit Invoice item', error: error.message });
    }
};

module.exports = {
    addInvoiceItem,
    deleteInvoiceItem,
    editInvoiceItem,
};
