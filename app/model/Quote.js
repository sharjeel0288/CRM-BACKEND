// app\model\Quote.js
const connection = require('../../config/DbConfig');
const Payment = require('../model/Payment')
const { calculatePaymentStatus } = require('../utils/helpingFunctions');
const { updateQuoteData } = require('./Quote');
const Employee = require('./Employee')
const Client = require('./Client')

class Quote {
    static async createQuote(quoteData, quoteItemsData) {
        try {

            const clientEmail = quoteData.client_email;
            const addedByEmployeeEmail = quoteData.employee_email;

            // Find client and employee IDs using their emails
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

            let isApproved = 0
            if (quoteData.status === 3) {
                isApproved = 1
            }
            else isApproved = 0
            // Generate a unique quote number
            const uniqueQuoteNumber = generateUniqueQuoteNumber();

            // Insert quote data
            const insertQuoteQuery = 'INSERT INTO quote SET ?';
            const quoteDataToInsert = {
                client_id: clientId,
                number: uniqueQuoteNumber,
                quote_current_date: new Date(),
                status: quoteData.status,
                added_by_employee: addedByEmployeeId || addedByAdminId,
                expiry_date: quoteData.expiry_date,
                terms_and_condition: quoteData.terms_and_condition,
                payment_terms: quoteData.payment_terms,
                execution_time: quoteData.execution_time,
                bank_details: quoteData.bank_details,
                is_approved_by_admin: isApproved
                // payment_mode_id: paymentModeId,
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
            console.log(quoteData);
            console.error('Create quote error:', error);
            throw error;
        }
    }
    static async getAllQuotes() {
        try {
            const selectQuery = `
            SELECT q.*, c.email AS client_email
            FROM quote q
            JOIN client c ON q.client_id = c.id
            ORDER BY quote_current_date DESC
            
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
    static async getAllQuotesWithStatusOfAdmin(is_approved_status) {
        const statusList = ['DRAFT', 'PENDING', 'SENT', 'EXPIRED', 'DECLINE', 'ACCEPTED', 'LOST'];
        const approvedList = ["NO", "PENDING ", "YES", "REJECTED"]
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email
                FROM quote q
                JOIN client c ON q.client_id = c.id
                WHERE q.is_approved_by_admin = ?
                ORDER BY quote_current_date DESC;
            `;
            const [quotes, fields] = await connection.query(selectQuery, [is_approved_status]);

            const QuotesWithDetails = [];

            for (const quote of quotes) {
                let employee_name = '';
                let employee_surname = '';
                quote.status = statusList[quote.status - 1];
                quote.is_approved_by_admin = approvedList[quote.is_approved_by_admin]
                const addedByQuery = `SELECT * FROM employee WHERE id = ?`;
                const [employee, __] = await connection.query(addedByQuery, [quote.added_by_employee]);

                if (employee.length > 0) {
                    employee_name = employee[0].name;
                    employee_surname = employee[0].surname;
                } else {
                    const adminQuery = `SELECT * FROM admin WHERE id = ?`;
                    const [admin, _] = await connection.query(adminQuery, [quote.added_by_employee]);

                    if (admin.length > 0) {
                        employee_name = '';
                        employee_surname = 'Admin';
                    }
                }

                const clientQuery = `SELECT * FROM client WHERE id = ?`;
                const [client, ___] = await connection.query(clientQuery, [quote.client_id]);

                const quoteId = quote.id;
                const quoteItems = await Quote.getQuoteItemsByQuoteId(quoteId);

                const totalAmount = quoteItems.reduce((total, item) => total + parseFloat(item.item_total), 0);

                const QuoteDetails = {
                    ...quote,
                    employee_name: employee_name,
                    employee_surname: employee_surname,
                    client_fname: client[0].fname, // Assuming there's only one client row
                    client_lname: client[0].lname, // Assuming there's only one client row
                    client_phone: client[0].phone, // Assuming there's only one client row
                    total_amount: totalAmount,
                    quoteItems: quoteItems
                };

                QuotesWithDetails.push(QuoteDetails);
            }

            return QuotesWithDetails;
        } catch (error) {
            console.error('Get all quotes error:', error);
            throw error;
        }
    }



    static async getQuoteById(quoteId) {
        console.log('qqqqqqqqqqqqqqqqqqqq', quoteId)
        const statusList = ['DRAFT', 'PENDING', 'SENT', 'EXPIRED', 'DECLINE', 'ACCEPTED', 'LOST'];
        const approvedList = ["NO", "PENDING ", "YES", "REJECTED"]
        try {
            const selectQuery = `
                SELECT q.*, c.email AS client_email,
               
                c.fname AS client_fname, c.lname AS client_lname,
                c.phone as client_phone
                FROM quote q
                JOIN client c ON q.client_id = c.id
                
                WHERE q.id = ?;
            `;
            const [quotes, fields] = await connection.query(selectQuery, [quoteId]);

            if (quotes.length === 0) {
                throw new Error('quotes not found'); // Throw an error if invoice doesn't exist
            }

            const quote = quotes[0];

            // Fetch the creator (employee or admin) information
            let addedByInfo = {
                employee_name: '',
                employee_surname: '',
                employee_email: ''
            };

            const addedByEmployeeQuery = `SELECT * FROM employee WHERE id = ?`;
            const [employeeResult, _] = await connection.query(addedByEmployeeQuery, [quote.added_by_employee]);
            if (employeeResult.length > 0) {
                addedByInfo = {
                    employee_name: employeeResult[0].name,
                    employee_surname: employeeResult[0].surname,
                    employee_email: employeeResult[0].email
                };
            } else {
                const addedByAdminQuery = `SELECT * FROM admin WHERE id = ?`;
                const [adminResult, __] = await connection.query(addedByAdminQuery, [quote.added_by_employee]);

                if (adminResult.length > 0) {
                    addedByInfo = {
                        employee_name: '',
                        employee_surname: 'admin', // Using lname field for admin's name
                        employee_email: adminResult[0].email
                    };
                }
            }
            // Get payments for the invoice
            const quoteItems = await Quote.getQuoteItemsByQuoteId(quoteId);

            quote.status = statusList[quote.status - 1];
            quote.is_approved_by_admin = approvedList[quote.is_approved_by_admin]
            console.log(quote.is_approved_by_admin)

            // Calculate total amount from InvoiceItemsData
            const totalAmount = quoteItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);
            const SubTotal = quoteItems.reduce((total, item) => total + parseFloat(item.item_total || 0), 0);
            const tax = 0.5;

            const QouteDetails = {
                ...quote, // Use invoice object instead of quotes object
                total_amount: totalAmount,
                quoteItems: quoteItems,
                SubTotal: SubTotal,
                tax: tax,
                employee_name: addedByInfo.employee_name,
                employee_surname: addedByInfo.employee_surname, // Using lname field for admin's name
                employee_email: addedByInfo.email,
                // is_approved_by_admin:quote.is_approved_by_admin
            };

            return QouteDetails;
        } catch (error) {
            console.error('Get invoice by ID error:', error);
            throw error;
        }
    }

    static async updateApprovalStatus(quoteId, isApprovedByAdmin) {
        try {
            // Validate the input value
            if (![2, 3].includes(isApprovedByAdmin)) {
                throw new Error('Invalid value for is_approved_by_admin');
            }

            const updateApprovalQuery = 'UPDATE quote SET is_approved_by_admin = ? WHERE id = ?';
            await connection.query(updateApprovalQuery, [isApprovedByAdmin, quoteId]);

            return { success: true, message: 'Approval status updated successfully' };
        } catch (error) {
            console.error('Update approval status error:', error);
            throw { success: false, message: 'Failed to update approval status', error: error.message };
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
            console.log(existingQuoteData.status)
            let isApproved
            if (existingQuoteData.status === 3) {
                isApproved = 1
            } else isApproved = 0

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
                added_by_employee: updatedQuoteData.added_by_employee || existingQuoteData.added_by_employee,
                is_approved_by_admin: isApproved || existingQuoteData.added_by_employee
                // payment_mode_id: updatedQuoteData.paymentModeId || existingQuoteData.payment_mode_id
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
