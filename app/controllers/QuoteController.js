// app\controllers\QuoteController.js
const Client = require('../model/Client');
const Invoice = require('../model/Invoice');
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
const updateApprovalStatus = async (req, res) => {
    try {
        const { quoteId } = req.params;
        const { is_approved_by_admin } = req.body;
        console.log("is_approved_by_admin: controller : ", is_approved_by_admin)
        const result = await Quote.updateApprovalStatus(quoteId, is_approved_by_admin);
        console.log("result: ", result)
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
}
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
const getAllAssignedQuotes = async (req, res) => {
    try {
        const EmployeeId = req.params.employeeId; // Assuming the employeeId is in the request parameters
        const assignedQuotes = await Quote.getAllAssignedQuotes(EmployeeId);

        res.status(200).json({ success: true, assignedQuotes });
    } catch (error) {
        console.error('Get all assigned quotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get assigned quotes', error: error.message });
    }
};
const getAllApprovedByClientQuotes = async (req, res) => {
    try {
        const quotes = await Quote.getAllApprovedByClientQuotes();
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
const getAllQuotesWithAdminStatus = async (req, res) => {
    try {
        const isApprovedStatus = req.params.status; // Read the query parameter
        console.log(isApprovedStatus)
        const quotesWithDetails = await Quote.getAllQuotesWithStatusOfAdmin(isApprovedStatus);

        res.status(200).json({ success: true, quotes: quotesWithDetails });
    } catch (error) {
        console.error('Get all quotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quotes', error: error.message });
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

async function updateApprovedByClient(req, res) {
    try {
        const { quoteId } = req.params;
        const { isApprovedByClient } = req.body;

        // Validate the input value
        if (![0, 1].includes(isApprovedByClient)) {
            return res.status(400).json({ success: false, message: 'Invalid value for isApprovedByClient' });
        }

        // Update the approval status in the database
        const result = await Quote.updateApprovalStatusByClient(quoteId, isApprovedByClient);

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Approval status updated successfully' });
        } else {
            return res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Update approval status by client error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

async function convertQuoteToInvoice(req, res) {
    try {
        const { quoteId, employeeEmail } = req.body;

        // Fetch the quote by ID
        const quote = await Quote.getQuoteById(quoteId);

        if (!quote) {
            return res.status(404).json({ success: false, message: 'Quote not found' });
        }

        // Check if the quote has already been converted to an invoice
        if (quote.is_converted_to_invoice) {
            return res.status(400).json({ success: false, message: 'Quote is already converted to an invoice' });
        }
        const client = await Client.getClientById(quote.client_id)

        // Create an invoice based on the quote data
        const invoiceData = {
            client_email: client.email,
            isPerforma: 0, // You may need to set this value as per your application logic
            number: quote.number, // You can implement a function to generate invoice numbers
            invoice_current_date: new Date(), // Use the current date for invoice creation
            status: 0, // You may need to set the initial status as per your application logic
            expiry_date: quote.expiry_date,
            terms_and_condition: quote.terms_and_condition,
            note: quote.note,
            payment_terms: quote.payment_terms,
            execution_time: quote.execution_time,
            bank_details: quote.bank_details,
            // added_by_employee: employeeId, // Set the employee ID who added the invoice
            employee_email: employeeEmail,
        };

        const invoiceItemsData = quote.quoteItems; // You already have the quote items
        console.log("client: ", client)
        // Create the invoice
        const invoiceId = await Invoice.createInvoice(invoiceData, invoiceItemsData);

        // Update the added-by employee to the specified employee ID
        // await Invoice.updateInvoiceData(invoiceId, { added_by_employee: employeeId });

        // Mark the quote as converted to an invoice
        await Quote.updateQuoteData(quoteId, { is_converted_to_invoice: true });

        res.status(200).json({ success: true, message: 'Quote converted to invoice successfully', invoiceId });
    } catch (error) {
        console.error('Convert quote to invoice error:', error);
        res.status(500).json({ success: false, message: 'Failed to convert quote to invoice', error: error.message });
    }
};

module.exports = {
    createQuote,
    getAllQuotes,
    getQuoteById,
    editQuoteData,
    deleteQuote,
    updateApprovalStatus,
    getAllQuotesWithAdminStatus,
    updateApprovedByClient,
    convertQuoteToInvoice,
    getAllApprovedByClientQuotes,
    getAllAssignedQuotes,
};
