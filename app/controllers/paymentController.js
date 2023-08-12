const Payment = require('../model/Payment');

const makePayment = async (req, res) => {
    console.log(req.body)
    try {
        const paymentData = req.body;
        const paymentId = await Payment.createPayment(paymentData);
        res.status(201).json({ success: true, message: 'Payment created successfully', paymentId });
    } catch (error) {
        console.error('Create Payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create Payment', error: error.message });
    }
};

const getAllPaymentsForInvoice = async (req, res) => {
    const invoiceId = req.params.invoiceId;

    try {
        const payments = await Payment.getAllPaymentsByInvoiceId(invoiceId);
        if (payments.length === 0) {
            return res.status(404).json({ success: false, message: 'No payments found for the provided invoice' });
        }
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error('Get all Payments for invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to get Payments for invoice', error: error.message });
    }
};


const getPaymentById = async (req, res) => {
    const paymentId = req.params.id;

    try {
        const payment = await Payment.getPaymentById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error('Get Payment by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get Payment', error: error.message });
    }
};

const editPaymentData = async (req, res) => {
    const paymentId = req.params.id;
    const updatedPaymentData = req.body;

    try {
        const existingPayment = await Payment.getPaymentById(paymentId);
        if (!existingPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        await Payment.updatePaymentData(paymentId, updatedPaymentData);

        res.status(200).json({ success: true, message: 'Payment data updated successfully' });
    } catch (error) {
        console.error('Edit Payment data error:', error);
        res.status(500).json({ success: false, message: 'Failed to update Payment data', error: error.message });
    }
};

const deletePayment = async (req, res) => {
    const paymentId = req.params.id;

    try {
        const existingPayment = await Payment.getPaymentById(paymentId);
        if (!existingPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        await Payment.deletePayment(paymentId);

        res.status(200).json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Delete Payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete Payment', error: error.message });
    }
};

module.exports = {
    makePayment,
    getAllPaymentsForInvoice,
    getPaymentById,
    editPaymentData,
    deletePayment,
};
