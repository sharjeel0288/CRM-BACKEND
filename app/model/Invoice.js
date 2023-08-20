// app\model\Invoice.js
const connection = require('../../config/DbConfig');
const Payment = require('../model/Payment')
const { calculatePaymentStatus } = require('../utils/helpingFunctions');
const { updateQuoteData } = require('./Quote');
const Employee = require('./Employee')
const Client = require('./Client')

class Invoice {
    static async createInvoice(invoiceData, invoiceItemsData) {
        console.log('invoice')
        console.log(invoiceData)
        console.log('invoiceItem')
        console.log(invoiceItemsData)
        try {
            const clientEmail = invoiceData.client_email;
            const addedByEmployeeEmail = invoiceData.employee_email;

            // Find client and employee IDs using their emails
            const [clientResult, _] = await connection.query('SELECT id FROM client WHERE email = ?', [clientEmail]);
            const clientId = clientResult[0]?.id;

            const [employeeResult, __] = await connection.query('SELECT id FROM employee WHERE email = ?', [addedByEmployeeEmail]);
            const addedByEmployeeId = employeeResult[0]?.id;

            if (!clientId || !addedByEmployeeId) {
                throw new Error('Client or employee not found.');
            }

            // Generate a unique invoice number
            const uniqueInvoiceNumber = generateUniqueInvoiceNumber();

            // Insert invoice data
            const insertInvoiceQuery = 'INSERT INTO invoice SET ?';
            const invoiceDataToInsert = {
                client_id: clientId,
                number: uniqueInvoiceNumber,
                invoice_date: new Date(),
                invoice_current_date: new Date(),
                status: invoiceData.status,
                added_by_employee: addedByEmployeeId,
                expiry_date: invoiceData.expiry_date,
                terms_and_condition: invoiceData.terms_and_condition,
                payment_terms: invoiceData.payment_terms,
                execution_time: invoiceData.execution_time,
                bank_details: invoiceData.bank_details,
                isPerforma: invoiceData.isPerforma,
                payment_mode_id: invoiceData.paymentModeId,

            };
            const [invoiceInsertResult, ___] = await connection.query(insertInvoiceQuery, invoiceDataToInsert);
            const invoiceId = invoiceInsertResult.insertId;

            // Insert invoice items
            for (const invoiceItemData of invoiceItemsData) {
                const insertInvoiceItemQuery = 'INSERT INTO invoice_item SET ?';
                const invoiceItemDataToInsert = {
                    invoice_id: invoiceId,
                    item_name: invoiceItemData.item_name,
                    item_description: invoiceItemData.item_description,
                    item_quantity: invoiceItemData.item_quantity,
                    item_xdim: invoiceItemData.item_xdim,
                    item_ydim: invoiceItemData.item_ydim,
                    item_price: invoiceItemData.item_price,
                    item_subtotal: invoiceItemData.item_subtotal,
                    item_tax: invoiceItemData.item_tax,
                    item_total: invoiceItemData.item_total
                };
                await connection.query(insertInvoiceItemQuery, invoiceItemDataToInsert);
            }

            return invoiceId;
        } catch (error) {
            console.log('Create invoice error:', error);
            throw error;
        }
    }

    static async getAllInvoices() {
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email, e.email AS employee_email
                FROM invoice q
                JOIN client c ON q.client_id = c.id
                JOIN employee e ON q.added_by_employee = e.id
            `;
            const [invoices, fields] = await connection.query(selectQuery);

            const invoicesWithPaymentStatus = [];

            for (const invoice of invoices) {
                const invoiceId = invoice.id;
                const invoicePayments = await Payment.getAllPaymentsByInvoiceId(invoiceId);
                const invoiceItems = await Invoice.getInvoiceItemsByInvoiceId(invoiceId);

                const totalAmountPaid = invoicePayments.reduce((total, payment) => total + payment.amount, 0);

                // Calculate total amount from InvoiceItemsData
                const totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.item_total), 0);
                const paymentStatus = calculatePaymentStatus(totalAmount, totalAmountPaid);
                console.log('totalAmount', totalAmount)

                const invoiceWithPaymentStatus = {
                    ...invoice,
                    payment_status: paymentStatus,
                    total_amount_paid: totalAmountPaid,
                    total_amount: totalAmount,
                };

                invoicesWithPaymentStatus.push(invoiceWithPaymentStatus);
            }

            return invoicesWithPaymentStatus;
        } catch (error) {
            console.error('Get all invoices error:', error);
            throw error;
        }
    }

    static async getInvoiceById(invoiceId) {
        const statusList = ['DRAFT', 'PENDING', 'SENT', 'EXPIRED', 'DECLINE', 'ACCEPTED', 'LOST'];
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email, e.email AS employee_email,
                c.fname AS client_fname, c.lname AS client_lname,
                e.name AS employee_name, e.surname AS employee_surname, c.phone as client_phone
                FROM invoice q
                JOIN client c ON q.client_id = c.id
                JOIN employee e ON q.added_by_employee = e.id
                WHERE q.id = ?;
            `;
            const [invoices, fields] = await connection.query(selectQuery, [invoiceId]);

            if (invoices.length === 0) {
                throw new Error('Invoice not found'); // Throw an error if invoice doesn't exist
            }

            const invoice = invoices[0];

            // Get payments for the invoice
            const invoicePayments = await Payment.getAllPaymentsByInvoiceId(invoiceId);
            const invoiceItems = await Invoice.getInvoiceItemsByInvoiceId(invoiceId);

            const totalAmountPaid = invoicePayments.reduce((total, payment) => total + payment.amount, 0);
            if (invoice.isPerforma == 1) {
                invoice.isPerforma = 'PERFORMA INVOICE'
            }
            else {
                invoice.isPerforma = 'TAX INVOICE'
            }
            invoice.status = statusList[invoice.status - 1]
            // Calculate total amount from InvoiceItemsData
            const totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);

            const paymentStatus = calculatePaymentStatus(totalAmount, totalAmountPaid);

            const invoiceWithPaymentStatus = {
                ...invoice,
                payment_status: paymentStatus,
                total_amount_paid: totalAmountPaid,
                total_amount: totalAmount,

            };

            return invoiceWithPaymentStatus;
        } catch (error) {
            console.error('Get invoice by ID error:', error);
            throw error;
        }
    }





    static async getInvoiceItemsByInvoiceId(invoiceId) {
        try {
            const selectQuery = 'SELECT * FROM invoice_item WHERE invoice_id = ?';
            const [rows] = await connection.query(selectQuery, [invoiceId]);
            return rows;
        } catch (error) {
            console.error('Get invoice items by invoice ID error:', error);
            throw error;
        }

    }

    static async deleteInvoiceItems(invoiceId) {
        try {
            const deleteItemsQuery = 'DELETE FROM invoice_item WHERE invoice_id = ?';
            await connection.query(deleteItemsQuery, [invoiceId]);
        } catch (error) {
            console.error('Delete invoice items error:', error);
            throw error;
        }
    }

    static async deleteInvoice(invoiceId) {
        try {
            const deleteInvoiceQuery = 'DELETE FROM invoice WHERE id = ?';
            await connection.query(deleteInvoiceQuery, [invoiceId]);
        } catch (error) {
            console.error('Delete invoice error:', error);
            throw error;
        }
    }

    static async updateInvoiceData(invoiceId, updatedInvoiceData) {
        try {
            // Fetch the existing invoice data
            const selectExistingInvoiceQuery = 'SELECT * FROM invoice WHERE id = ?';
            const [existingInvoiceRows, _] = await connection.query(selectExistingInvoiceQuery, [invoiceId]);
            const existingInvoiceData = existingInvoiceRows[0];

            // If provided, update the values; otherwise, keep the existing values
            const newInvoiceData = {
                status: (updatedInvoiceData.status && updatedInvoiceData.status >= 1 && updatedInvoiceData.status <= 7)
                    ? updatedInvoiceData.status
                    : existingInvoiceData.status,
                expiry_date: updatedInvoiceData.expiry_date || existingInvoiceData.expiry_date,
                terms_and_condition: updatedInvoiceData.terms_and_condition || existingInvoiceData.terms_and_condition,
                payment_terms: updatedInvoiceData.payment_terms || existingInvoiceData.payment_terms,
                execution_time: updatedInvoiceData.execution_time || existingInvoiceData.execution_time,
                bank_details: updatedInvoiceData.bank_details || existingInvoiceData.bank_details,
                added_by_employee: existingInvoiceData.added_by_employee,
                isPerforma: updatedInvoiceData.isPerforma || existingInvoiceData.isPerforma,
                payment_mode_id: updateQuoteData.paymentModeId || existingQuoteData.payment_mode_id
            };

            // If client email is provided, update the client_id
            if (updatedInvoiceData.client_email) {
                const [clientResult, __] = await connection.query('SELECT id FROM client WHERE email = ?', [updatedInvoiceData.client_email]);
                const clientId = clientResult[0]?.id;
                if (clientId) {
                    newInvoiceData.client_id = clientId;
                }
            }

            const updateInvoiceQuery = 'UPDATE invoice SET ? WHERE id = ?';
            await connection.query(updateInvoiceQuery, [newInvoiceData, invoiceId]);

            return { success: true, message: 'Invoice data updated successfully' };
        } catch (error) {
            console.error('Update invoice data error:', error);
            throw { success: false, message: 'Failed to update invoice data', error: error.message };
        }
    }
}

function generateUniqueInvoiceNumber() {
    // Implement your logic here to generate a unique invoice number
    // For example: use a combination of date and a random number
    const uniqueNumber = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return uniqueNumber;
}

module.exports = Invoice;
