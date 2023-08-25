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

            // Find client ID using client's email
            const [clientResult, _] = await connection.query('SELECT id FROM client WHERE email = ?', [clientEmail]);
            const clientId = clientResult[0]?.id;

            // Find employee ID using employee's email
            const [employeeResult] = await connection.query('SELECT id FROM employee WHERE email = ?', [addedByEmployeeEmail]);
            const addedByEmployeeId = employeeResult[0]?.id;

            // Find admin ID using admin's email
            const [adminResult] = await connection.query('SELECT id FROM admin WHERE email = ?', [addedByEmployeeEmail]);
            const addedByAdminId = adminResult[0]?.id;

            if (!clientId) {
                throw new Error('Client not found.');
            }
            if (!addedByEmployeeId && !addedByAdminId) {
                throw new Error('Admin or employee not found.');
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
                added_by_employee: addedByEmployeeId || addedByAdminId,
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
                SELECT q.*, c.email AS client_email
                FROM invoice q
                JOIN client c ON q.client_id = c.id
                ORDER BY invoice_date DESC
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
                // console.log('totalAmount', totalAmount)

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
                SELECT q.*, c.email AS client_email,
                c.fname AS client_fname, c.lname AS client_lname,
                c.phone as client_phone
                FROM invoice q
                JOIN client c ON q.client_id = c.id
                WHERE q.id = ?;
            `;
            const [invoices, fields] = await connection.query(selectQuery, [invoiceId]);

            if (invoices.length === 0) {
                throw new Error('Invoice not found');
            }

            const invoice = invoices[0];

            // Fetch the creator (employee or admin) information
            let addedByInfo = {
                employee_name: '',
                employee_surname: '',
            };

            const addedByEmployeeQuery = `SELECT * FROM employee WHERE id = ?`;
            const [employeeResult, _] = await connection.query(addedByEmployeeQuery, [invoice.added_by_employee]);

            if (employeeResult.length > 0) {
                addedByInfo = {
                    employee_name: employeeResult[0].name,
                    employee_surname: employeeResult[0].surname,
                    employee_email: employeeResult[0].email
                };
            } else {
                const addedByAdminQuery = `SELECT * FROM admin WHERE id = ?`;
                const [adminResult, __] = await connection.query(addedByAdminQuery, [invoice.added_by_employee]);

                if (adminResult.length > 0) {
                    addedByInfo = {
                        employee_name: '',
                        employee_surname: adminResult[0].lname, // Using lname field for admin's name
                        employee_email: adminResult[0].email
                    };
                }
            }

            // Get payments for the invoice
            const invoicePayments = await Payment.getAllPaymentsByInvoiceId(invoiceId);
            const invoiceItems = await Invoice.getInvoiceItemsByInvoiceId(invoiceId);

            const totalAmountPaid = invoicePayments.reduce((total, payment) => total + payment.amount, 0);
            const isPerforma = invoice.isPerforma === 1 ? 'PERFORMA INVOICE' : 'TAX INVOICE';
            const invoiceStatus = statusList[invoice.status - 1];
            const totalAmount = invoiceItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);
            const paymentStatus = calculatePaymentStatus(totalAmount, totalAmountPaid);

            const invoiceWithPaymentStatus = {
                ...invoice,
                payment_status: paymentStatus,
                total_amount_paid: totalAmountPaid,
                total_amount: totalAmount,
                isPerforma: isPerforma,
                status: invoiceStatus,
                employee_name: addedByInfo.employee_name,
                employee_surname: addedByInfo.employee_surname,
                employee_email: addedByInfo.email
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
        console.log("updatedInvoiceData:", updatedInvoiceData)
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
                note: updatedInvoiceData.note || existingInvoiceData.note

            };
            // Convert the provided expiry_date string to a JavaScript Date object
            // const expiryDate = new Date(updatedInvoiceData.expiry_date);

            // // If the conversion is successful, update the newInvoiceData object
            // if (!isNaN(expiryDate)) {
            //     newInvoiceData.expiry_date = expiryDate;
            // }
            console.log("newInvoiceData:", newInvoiceData)
            console.log("existingInvoiceData:", existingInvoiceData)

            // If client email is provided, update the client_id
            if (updatedInvoiceData.client_email) {
                const [clientResult, __] = await connection.query('SELECT id FROM client WHERE email = ?', [updatedInvoiceData.client_email]);
                const clientId = clientResult[0]?.id;
                if (clientId) {
                    newInvoiceData.client_id = clientId;
                }
            }

            const updateInvoiceQuery = 'UPDATE invoice SET ? WHERE id = ?';
            const res = await connection.query(updateInvoiceQuery, [newInvoiceData, invoiceId]);
            console.log(res)
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
