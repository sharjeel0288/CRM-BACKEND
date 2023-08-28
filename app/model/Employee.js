// app\model\Employee.js
const connection = require('../../config/DbConfig');
const jwtUtils = require('../utils/jwtUtils'); // Import the jwtUtils module
const bcrypt = require('bcrypt');
const Quote = require('./Quote');

class Employee {
    static async getEmployeeByEmail(email) {
        const query = 'SELECT * FROM employee WHERE email = ?';
        const [employees, _] = await connection.query(query, [email]);
        return employees[0];
    }
    static async getEmployeeById(employeeId) {
        // Implement your logic to fetch an employee by ID from the database
        const query = 'SELECT * FROM employee WHERE id = ?';
        const [rows] = await db.query(query, [employeeId]);
        return rows[0];
      }
    static async login(email, password) {
        try {
            const query = 'SELECT * FROM employee WHERE email = ?';
            const [employees, _] = await connection.query(query, [email]);

            if (employees.length === 0) {
                throw new Error('User not found with the provided email.');
            }

            const user = employees[0];

            const isPasswordValid = await bcrypt.compare(password, user.password); // Compare passwords
            console.log('isPasswordValid: ', isPasswordValid)
            if (!isPasswordValid) {
                throw new Error('Incorrect password.');
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name + ' ' + user.surname,
                department: user.department,
                authToken: jwtUtils.generateToken({ id: user.id, email: user.email, department: user.department }),
            };
        } catch (error) {
            throw error;
        }
    }


    static async getQuotesByEmployeeId(employeeId) {
        try {
            const selectQuery = `
                SELECT q.id AS quote_id, q.client_id, q.number AS quote_number, q.quote_current_date AS quote_date, 
                       q.status, q.expiry_date AS valid_until, q.terms_and_condition, q.payment_terms, q.execution_time,
                       q.bank_details,
                       qi.id AS item_id, qi.item_name, qi.item_description, qi.item_quantity, qi.item_xdim, 
                       qi.item_ydim, qi.item_price, qi.item_subtotal, qi.item_tax, qi.item_total
                FROM quote q
                JOIN quote_item qi ON q.id = qi.quote_id
                WHERE q.added_by_employee = ?;
            `;

            const [quotesAndItems, fields] = await connection.query(selectQuery, [employeeId]);

            const formattedData = [];

            for (const row of quotesAndItems) {
                const existingQuote = formattedData.find(item => item.quote_id === row.quote_id);

                if (existingQuote) {
                    existingQuote.items.push({
                        item_id: row.item_id,
                        item_name: row.item_name,
                        item_description: row.item_description,
                        item_quantity: row.item_quantity,
                        item_price: row.item_price,
                        item_subtotal: row.item_subtotal,
                        item_tax: row.item_tax,
                        item_total: row.item_total,
                    });

                    // Update the total amount of the quote
                    existingQuote.total_amount += row.item_total;
                } else {
                    formattedData.push({
                        quote_id: row.quote_id,
                        client_id: row.client_id,
                        quote_number: row.quote_number,
                        quote_date: row.quote_date,
                        status: row.status,
                        valid_until: row.valid_until,
                        terms_and_condition: row.terms_and_condition,
                        payment_terms: row.payment_terms,
                        execution_time: row.execution_time,
                        bank_details: row.bank_details,
                        total_amount: row.item_total, // Initialize with the first item's total
                        items: [
                            {
                                item_id: row.item_id,
                                item_name: row.item_name,
                                item_description: row.item_description,
                                item_quantity: row.item_quantity,
                                item_price: row.item_price,
                                item_subtotal: row.item_subtotal,
                                item_tax: row.item_tax,
                                item_total: row.item_total,
                            }
                        ],
                    });
                }
            }

            return formattedData;
        } catch (error) {
            console.error('Get all quotes by employee ID error:', error);
            throw new Error('Failed to fetch quotes for the provided employee ID.');
        }
    }

    static async getInvoicesByEmployeeId(employeeId) {
        try {
            const selectQuery = `
                SELECT i.id AS invoice_id, i.client_id, i.isPerforma, i.number, i.invoice_current_date, i.status,
                       i.expiry_date, i.terms_and_condition, i.payment_terms, i.execution_time, i.bank_details,
                       ii.id AS item_id, ii.item_name, ii.item_description, ii.item_quantity, ii.item_xdim, 
                       ii.item_ydim, ii.item_price, ii.item_subtotal, ii.item_tax, ii.item_total
                FROM invoice i
                JOIN invoice_item ii ON i.id = ii.invoice_id
                WHERE i.added_by_employee = ?;
            `;
            const [invoicesAndItems, fields] = await connection.query(selectQuery, [employeeId]);

            const formattedData = [];

            for (const row of invoicesAndItems) {
                const existingInvoice = formattedData.find(item => item.invoice_id === row.invoice_id);

                if (existingInvoice) {
                    existingInvoice.items.push({
                        item_id: row.item_id,
                        item_name: row.item_name,
                        item_description: row.item_description,
                        item_quantity: row.item_quantity,
                        item_xdim: row.item_xdim,
                        item_ydim: row.item_ydim,
                        item_price: row.item_price,
                        item_subtotal: row.item_subtotal,
                        item_tax: row.item_tax,
                        item_total: row.item_total,
                    });

                    // Update the total amount of the invoice
                    existingInvoice.total_amount += row.item_total;
                } else {
                    formattedData.push({
                        invoice_id: row.invoice_id,
                        client_id: row.client_id,
                        isPerforma: row.isPerforma,
                        number: row.number,
                        invoice_current_date: row.invoice_current_date,
                        status: row.status,
                        expiry_date: row.expiry_date,
                        terms_and_condition: row.terms_and_condition,
                        payment_terms: row.payment_terms,
                        execution_time: row.execution_time,
                        bank_details: row.bank_details,
                        total_amount: row.item_total, // Initialize with the first item's total
                        items: [
                            {
                                item_id: row.item_id,
                                item_name: row.item_name,
                                item_description: row.item_description,
                                item_quantity: row.item_quantity,
                                item_xdim: row.item_xdim,
                                item_ydim: row.item_ydim,
                                item_price: row.item_price,
                                item_subtotal: row.item_subtotal,
                                item_tax: row.item_tax,
                                item_total: row.item_total,
                            }
                        ]
                    });
                }
            }

            return formattedData;
        } catch (error) {
            console.error('Get all invoices and items by employee ID error:', error);
            throw new Error('Failed to fetch invoices and items for the provided employee ID.');
        }
    }
    static async getEmployeeById(employeeId) {
        try {
            const query = 'SELECT * FROM employee WHERE id = ?';
            const [employees, _] = await connection.query(query, [employeeId]);

            if (employees.length === 0) {
                throw new Error(`Employee with ID ${employeeId} not found`);
            }

            return employees[0];
        } catch (error) {
            console.error('Error fetching employee:', error.message);
            throw error;
        }
    }

    static async getLostQuotesByEmployeeId(employeeId) {
        try {
            const selectQuery = 'SELECT * FROM lost_quote WHERE assigned_to_employee = ? AND isDone = 0';
            const [lostQuotes, _] = await connection.query(selectQuery, [employeeId]);

            const lostQuotesWithQuoteInfo = await Promise.all(lostQuotes.map(async (lostQuote) => {
                const quoteId = lostQuote.quote_id;
                const quoteDetails = await Quote.getQuoteById(quoteId);
                return { ...lostQuote, quoteDetails };
            }));

            return lostQuotesWithQuoteInfo;
        } catch (error) {
            console.error('Get lost quotes by employee ID error:', error);
            throw error;
        }
    }

    static async markAsDone(lostQuoteId, message) {
        try {
            const updateQuery = 'UPDATE lost_quote SET isDone = 1, message = ? WHERE id = ?';
            const [result, _] = await connection.query(updateQuery, [message, lostQuoteId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Mark lost quote as done error:', error);
            throw error;
        }
    }

}

module.exports = Employee;
