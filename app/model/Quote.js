// app\model\Quote.js
const connection = require('../../config/DbConfig');

class Quote {
    static async createQuote(quoteData, quoteItemsData) {
        try {
            const clientEmail = quoteData.client_email;
            const addedByEmployeeEmail = quoteData.employee_email;

            // Find client and employee IDs using their emails
            const [clientResult, _] = await connection.query('SELECT id FROM client WHERE email = ?', [clientEmail]);
            const clientId = clientResult[0]?.id;

            const [employeeResult, __] = await connection.query('SELECT id FROM employee WHERE email = ?', [addedByEmployeeEmail]);
            const addedByEmployeeId = employeeResult[0]?.id;

            if (!clientId || !addedByEmployeeId) {
                throw new Error('Client or employee not found.');
            }

            // Generate a unique quote number
            const uniqueQuoteNumber = generateUniqueQuoteNumber();

            // Insert quote data
            const insertQuoteQuery = 'INSERT INTO quote SET ?';
            const quoteDataToInsert = {
                client_id: clientId,
                number: uniqueQuoteNumber,
                quote_current_date: new Date(),
                status: quoteData.status,
                added_by_employee: addedByEmployeeId,
                expiry_date: quoteData.expiry_date,
                terms_and_condition: quoteData.terms_and_condition,
                payment_terms: quoteData.payment_terms,
                execution_time: quoteData.execution_time,
                bank_details: quoteData.bank_details,
                payment_mode_id: paymentModeId,
            };
            const [quoteInsertResult, ___] = await connection.query(insertQuoteQuery, quoteDataToInsert);
            const quoteId = quoteInsertResult.insertId;

            // Insert quote items
            for (const quoteItemData of quoteItemsData) {
                const insertQuoteItemQuery = 'INSERT INTO quote_item SET ?';
                const quoteItemDataToInsert = {
                    quote_id: quoteId,
                    item_name: quoteItemData.item_name,
                    item_description: quoteItemData.item_description,
                    item_quantity: quoteItemData.item_quantity,
                    item_xdim: quoteItemData.item_xdim,
                    item_ydim: quoteItemData.item_ydim,
                    item_price: quoteItemData.item_price,
                    item_subtotal: quoteItemData.item_subtotal,
                    item_tax: quoteItemData.item_tax,
                    item_total: quoteItemData.item_total
                };
                await connection.query(insertQuoteItemQuery, quoteItemDataToInsert);
            }

            return quoteId;
        } catch (error) {
            console.error('Create quote error:', error);
            throw error;
        }
    }
    static async getAllQuotes() {
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email, e.email AS employee_email
                FROM quote q
                JOIN client c ON q.client_id = c.id
                JOIN employee e ON q.added_by_employee = e.id
            `;
            const [quotes, fields] = await connection.query(selectQuery);

            const QouteDetailsWithStatus = [];

            for (const quote of quotes) {
                const quoteId = quote.id;
                const quoteItems = await Quote.getQuoteItemsByQuoteId(quoteId);

                const totalAmount = quoteItems.reduce((total, item) => total + parseFloat(item.item_total), 0);

                const QouteDetails = {
                    ...quote,
                };

                QouteDetailsWithStatus.push(QouteDetails);
            }

            return QouteDetailsWithStatus;
        } catch (error) {
            console.error('Get all invoices error:', error);
            throw error;
        }
    }

    static async getQuoteById(quoteId) {
        const statusList = ['DRAFT', 'PENDING', 'SENT', 'EXPIRED', 'DECLINE', 'ACCEPTED', 'LOST'];
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email, e.email AS employee_email,
                c.fname AS client_fname, c.lname AS client_lname,
                e.name AS employee_name, e.surname AS employee_surname
                FROM quote q
                JOIN client c ON q.client_id = c.id
                JOIN employee e ON q.added_by_employee = e.id
                WHERE q.id = ?;
            `;
            const [quotes, fields] = await connection.query(selectQuery, [quoteId]);

            if (quotes.length === 0) {
                throw new Error('Invoice not found'); // Throw an error if invoice doesn't exist
            }

            const invoice = quotes[0];

            // Get payments for the invoice
            const quoteItems = await Quote.getQuoteItemsByQuoteId(quoteId);

            invoice.status = statusList[invoice.status - 1];

            // Calculate total amount from InvoiceItemsData
            const totalAmount = quoteItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);
            const SubTotal = quoteItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);
            const tax = 0.5;

            const QouteDetails = {
                ...invoice, // Use invoice object instead of quotes object
                total_amount: totalAmount,
                SubTotal: SubTotal,
                tax: tax
            };

            return QouteDetails;
        } catch (error) {
            console.error('Get invoice by ID error:', error);
            throw error;
        }
    }


    static async getQuoteItemsByQuoteId(quoteId) {
        try {
            const selectQuery = 'SELECT * FROM quote_item WHERE quote_id = ?';
            const [quoteItems, fields] = await connection.query(selectQuery, [quoteId]);
            return quoteItems;
        } catch (error) {
            console.error('Get quote items by quote ID error:', error);
            throw error;
        }
    }
    static async deleteQuoteItems(quoteId) {
        try {
            const deleteItemsQuery = 'DELETE FROM quote_item WHERE quote_id = ?';
            await connection.query(deleteItemsQuery, [quoteId]);
        } catch (error) {
            console.error('Delete quote items error:', error);
            throw error;
        }
    }

    static async deleteQuote(quoteId) {
        try {
            const deleteQuoteQuery = 'DELETE FROM quote WHERE id = ?';
            await connection.query(deleteQuoteQuery, [quoteId]);
        } catch (error) {
            console.error('Delete quote error:', error);
            throw error;
        }
    }

    static async updateQuoteData(quoteId, updatedQuoteData) {
        try {
            // Fetch the existing quote data
            const selectExistingQuoteQuery = 'SELECT * FROM quote WHERE id = ?';
            const [existingQuoteRows, _] = await connection.query(selectExistingQuoteQuery, [quoteId]);
            const existingQuoteData = existingQuoteRows[0];

            // If provided, update the values; otherwise, keep the existing values
            const newQuoteData = {
                status: (updatedQuoteData.status && updatedQuoteData.status >= 1 && updatedQuoteData.status <= 7)
                    ? updatedQuoteData.status
                    : existingQuoteData.status,
                expiry_date: updatedQuoteData.expiry_date || existingQuoteData.expiry_date,
                terms_and_condition: updatedQuoteData.terms_and_condition || existingQuoteData.terms_and_condition,
                payment_terms: updatedQuoteData.payment_terms || existingQuoteData.payment_terms,
                execution_time: updatedQuoteData.execution_time || existingQuoteData.execution_time,
                bank_details: updatedQuoteData.bank_details || existingQuoteData.bank_details,
                added_by_employee: existingQuoteData.added_by_employee,
                payment_mode_id: updatedQuoteData.paymentModeId || existingQuoteData.payment_mode_id
            };

            // If client email is provided, update the client_id
            if (updatedQuoteData.client_email) {
                const [clientResult, __] = await connection.query('SELECT id FROM client WHERE email = ?', [updatedQuoteData.client_email]);
                const clientId = clientResult[0]?.id;
                if (clientId) {
                    newQuoteData.client_id = clientId;
                }
            }

            const updateQuoteQuery = 'UPDATE quote SET ? WHERE id = ?';
            await connection.query(updateQuoteQuery, [newQuoteData, quoteId]);

            return { success: true, message: 'Quote data updated successfully' };
        } catch (error) {
            console.error('Update quote data error:', error);
            throw { success: false, message: 'Failed to update quote data', error: error.message };
        }
    }

    static async updateQuotePDFFileName(quoteId, fileName) {
        try {
            const updateFileNameQuery = 'UPDATE quote SET pdf_file_name = ? WHERE id = ?';
            await connection.query(updateFileNameQuery, [fileName, quoteId]);
            return { success: true, message: 'Quote PDF file name updated successfully' };
        } catch (error) {
            console.error('Update quote PDF file name error:', error);
            throw { success: false, message: 'Failed to update quote PDF file name', error: error.message };
        }
    }


}

function generateUniqueQuoteNumber() {
    // Implement your logic here to generate a unique quote number
    // For example: use a combination of date and a random number
    const uniqueNumber = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return uniqueNumber;
}


module.exports = Quote;
