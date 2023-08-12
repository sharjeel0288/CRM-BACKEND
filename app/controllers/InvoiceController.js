// app\controllers\InvoiceController.js
const Invoice = require('../model/Invoice');

const createInvoice = async (req, res) => {
    try {
        const InvoiceData = req.body.invoiceData;
        const InvoiceItemsData = req.body.invoiceItemsData;
        console.log(InvoiceData)
        const newInvoiceId = await Invoice.createInvoice(InvoiceData, InvoiceItemsData);
        res.status(201).json({ success: true, message: 'Invoice created successfully', InvoiceId: newInvoiceId });
    } catch (error) {
        console.error('Create Invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to create Invoice', error: error.message });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.getAllInvoices();
        const InvoiceWithDetails = [];

        for (const invoice of invoices) {
            const InvoiceData = await Invoice.getInvoiceById(invoice.id);
            const InvoiceItemsData = await Invoice.getInvoiceItemsByInvoiceId(invoice.id);

            InvoiceWithDetails.push({
                InvoiceData,
                InvoiceItemsData
            });
        }

        res.status(200).json({ success: true, Invoice: InvoiceWithDetails });
    } catch (error) {
        console.error('Get all Invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to get Invoice', error: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    const InvoiceId = req.params.id;

    try {
        const InvoiceData = await Invoice.getInvoiceById(InvoiceId);
        if (!InvoiceData) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const InvoiceItemsData = await Invoice.getInvoiceItemsByInvoiceId(InvoiceId);

        // Get payments for the invoice
        const invoicePayments = await Payment.getPaymentsByInvoiceId(InvoiceId);

        const totalAmountPaid = invoicePayments.reduce((total, payment) => total + payment.amount, 0);
        const status = calculateInvoiceStatus(InvoiceData.total_amount, totalAmountPaid);

        const InvoiceWithDetails = {
            InvoiceData,
            InvoiceItemsData,
            payments: invoicePayments,
            total_amount_paid: totalAmountPaid,
            status
        };

        res.status(200).json({ success: true, Invoice: InvoiceWithDetails });
    } catch (error) {
        console.error('Get Invoice by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get Invoice', error: error.message });
    }
};

const editInvoiceData = async (req, res) => {
    const InvoiceId = req.params.id;
    const updatedInvoiceData = req.body;

    try {
        const existingInvoice = await Invoice.getInvoiceById(InvoiceId);
        if (!existingInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Update the Invoice data fields
        await Invoice.updateInvoiceData(InvoiceId, updatedInvoiceData);

        res.status(200).json({ success: true, message: 'Invoice data updated successfully' });
    } catch (error) {
        console.error('Edit Invoice data error:', error);
        res.status(500).json({ success: false, message: 'Failed to update Invoice data', error: error.message });
    }
};

const deleteInvoice = async (req, res) => {
    const InvoiceId = req.params.id;

    try {
        const existingInvoice = await Invoice.getInvoiceById(InvoiceId);
        if (!existingInvoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Delete Invoice items first
        await Invoice.deleteInvoiceItems(InvoiceId);

        // Delete the Invoice data
        await Invoice.deleteInvoice(InvoiceId);

        res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Delete Invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete Invoice', error: error.message });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    editInvoiceData,
    deleteInvoice,
};
