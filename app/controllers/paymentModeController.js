const PaymentMode = require('../model/PaymentMode');

const createPaymentMode = async (req, res) => {
    try {
        const newPaymentModeId = await PaymentMode.createPaymentMode(req.body);
        res.status(201).json({ success: true, message: 'Payment mode created successfully', paymentModeId: newPaymentModeId });
    } catch (error) {
        console.error('Create payment mode error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment mode', error: error.message });
    }
};

const getAllPaymentModes = async (req, res) => {
    try {
        const paymentModes = await PaymentMode.getAllPaymentModes();
        res.status(200).json({ success: true, paymentModes });
    } catch (error) {
        console.error('Get all payment modes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payment modes', error: error.message });
    }
};

const getPaymentModeById = async (req, res) => {
    const { id } = req.params;
    try {
        const paymentMode = await PaymentMode.getPaymentModeById(id);
        if (!paymentMode) {
            return res.status(404).json({ success: false, message: 'Payment mode not found.' });
        }
        res.status(200).json({ success: true, paymentMode });
    } catch (error) {
        console.error('Get payment mode by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payment mode', error: error.message });
    }
};

const updatePaymentMode = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await PaymentMode.updatePaymentMode(id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Payment mode not found.' });
        }
        res.status(200).json({ success: true, message: 'Payment mode updated successfully' });
    } catch (error) {
        console.error('Update payment mode error:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment mode', error: error.message });
    }
};

const deletePaymentMode = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await PaymentMode.deletePaymentMode(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Payment mode not found.' });
        }
        res.status(200).json({ success: true, message: 'Payment mode deleted successfully' });
    } catch (error) {
        console.error('Delete payment mode error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete payment mode', error: error.message });
    }
};

module.exports = {
    createPaymentMode,
    getAllPaymentModes,
    getPaymentModeById,
    updatePaymentMode,
    deletePaymentMode,
};
