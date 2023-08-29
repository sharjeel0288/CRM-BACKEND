// app/models/Admin.js

const connection = require('../../config/DbConfig');
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwtUtils'); // Import the jwtUtils module
const { calculatePaymentStatus } = require('../utils/helpingFunctions'); // Update the path accordingly
const Quote = require('./Quote');


class Admin {
    static async createAdmin(adminData) {
        try {
            const hashedPassword = await bcrypt.hash(adminData.password, 10); // Hash the password
            adminData.password = hashedPassword;

            // Check if the email already exists in the admin table
            const emailExistsQueryAdmin = 'SELECT id FROM admin WHERE email = ?';
            const [existingAdmins, _] = await connection.query(emailExistsQueryAdmin, [adminData.email]);

            if (existingAdmins.length > 0) {
                throw new Error('An admin with the provided email already exists.');
            }

            // Check if the email already exists in the employee table
            const emailExistsQueryEmployee = 'SELECT id FROM employee WHERE email = ?';
            const [existingEmployees, __] = await connection.query(emailExistsQueryEmployee, [adminData.email]);

            if (existingEmployees.length > 0) {
                throw new Error('An employee with the provided email already exists.');
            }

            // If email is unique, insert the new admin
            const insertQuery = 'INSERT INTO admin SET ?';
            const [result, fields] = await connection.query(insertQuery, [adminData]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async getAdminByEmail(email) {
        const query = 'SELECT * FROM admin WHERE email = ?';
        const [admins, _] = await connection.query(query, [email]);
        return admins[0];
    }
    static async getAdminById(id) {
        const query = 'SELECT * FROM admin WHERE email = ?';
        const [admins, _] = await connection.query(query, [id]);
        return admins[0];
    }
    static async login(email, password) {
        try {
            const query = 'SELECT * FROM admin WHERE email = ?';
            const [admins, _] = await connection.query(query, [email]);

            if (admins.length === 0) {
                return null
            }

            const user = admins[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new Error('Incorrect password.');
            }

            return {
                id: user.id,
                email: user.email,
                department: 'admin',
                name: user.fname + ' ' + user.lname,
                authToken: jwtUtils.generateToken({ id: user.id, email: user.email, department: 'admin' }),
            };
        } catch (error) {
            throw error;
        }
    }
    static async createEmployee(employeeData) {
        try {
            // Check if the email already exists in the admin table
            const adminEmailExistsQuery = 'SELECT id FROM admin WHERE email = ?';
            const [existingAdmins, _] = await connection.query(adminEmailExistsQuery, [employeeData.email]);

            if (existingAdmins.length > 0) {
                throw new Error('An admin with the provided email already exists.');
            }

            // Check if the email already exists in the employee table
            const employeeEmailExistsQuery = 'SELECT id FROM employee WHERE email = ?';
            const [existingEmployees, __] = await connection.query(employeeEmailExistsQuery, [employeeData.email]);

            if (existingEmployees.length > 0) {
                throw new Error('An employee with the provided email already exists.');
            }

            // Hash the employee's password before storing it
            const hashedPassword = await bcrypt.hash(employeeData.password, 10);
            employeeData.password = hashedPassword;


            console.log('final insert: ', employeeData)

            // Create the employee
            // You should validate and sanitize the employeeData here
            const insertQuery = 'INSERT INTO employee SET ?, is_deleted = 0';
            const [result, fields] = await connection.query(insertQuery, [employeeData]);
            return result.insertId;
        } catch (error) {
            console.error('Create employee error:', error);
            throw error;
        }
    }
    static async editEmployee(employeeId, updatedEmployeeData) {
        console.log("Sfsfsfsffs")
        try {
            // Check if the email already exists in the employee table (excluding the current employee)
            const employeeEmailExistsQuery = 'SELECT id FROM employee WHERE email = ? AND id != ?';
            const [existingEmployees, __] = await connection.query(employeeEmailExistsQuery, [updatedEmployeeData.email, employeeId]);

            if (existingEmployees.length > 0) {
                throw new Error('An employee with the provided email already exists.');
            }

            // Hash the updated employee's password before storing it
            if (updatedEmployeeData.password) { // Check if the password is provided and not null
                if (updatedEmployeeData.password !== null) {
                    // Hash the updated password
                    const hashedPassword = await bcrypt.hash(updatedEmployeeData.password, 10);
                    updatedEmployeeData.password = hashedPassword;
                } else {
                    // If password is null, remove it from the updatedEmployeeData
                    delete updatedEmployeeData.password;
                }
            }
            // Update the employee's information
            const updateQuery = 'UPDATE employee SET ? WHERE id = ?';
            const [result, fields] = await connection.query(updateQuery, [updatedEmployeeData, employeeId]);

            console.log('Edit employee result:', result); // Log the result


            return result;
        } catch (error) {
            console.error('Edit employee error:', error);
            console.log(error)
            throw error;
        }
    }

    static async deleteEmployeeById(employeeId) {
        try {
            const updateQuery = 'UPDATE employee SET is_deleted = 1 WHERE id = ?';
            const [result, fields] = await connection.query(updateQuery, [employeeId]);

            return result;
        } catch (error) {
            console.error('Delete employee error:', error);
            throw error;
        }
    }

    static async getAllEmployees() {
        try {
            const selectQuery = 'SELECT * FROM employee WHERE is_deleted = 0';
            const [employees, fields] = await connection.query(selectQuery);
            return employees;
        } catch (error) {
            console.error('Get all employees error:', error);
            throw error;
        }
    }

    static async getEmployeeById(employeeId) {
        try {
            const selectQuery = 'SELECT * FROM employee WHERE id = ? AND is_deleted = 0';
            const [employees, fields] = await connection.query(selectQuery, [employeeId]);
            return employees[0];

        } catch (error) {
            console.error('Get employee by ID error:', error);
            throw error;
        }
    }




    static async createAnnouncement(announcementData) {
        try {
            const employeeEmail = announcementData.email; // Extract employee's email from announcementData
            delete announcementData.email; // Remove the email field from announcementData

            // Find the employee's ID using the provided email
            const findEmployeeIdQuery = 'SELECT id FROM employee WHERE email = ?';
            const [employeeResult, _] = await connection.query(findEmployeeIdQuery, [employeeEmail]);
            const employeeId = employeeResult[0]?.id;

            if (!employeeId) {
                throw new Error('Employee with the provided email not found.');
            }

            // Insert the announcement with the employee's ID
            const insertQuery = 'INSERT INTO announcement SET ?';
            const [result, fields] = await connection.query(insertQuery, { ...announcementData, employee_id: employeeId });
            return result.insertId;
        } catch (error) {
            console.error('Create announcement error:', error);
            throw error;
        }
    }



    static async deleteAnnouncementById(announcementId) {
        try {
            const deleteQuery = 'DELETE FROM announcement WHERE id = ?';
            const [result, fields] = await connection.query(deleteQuery, [announcementId]);
            return result;
        } catch (error) {
            console.error('Delete announcement error:', error);
            throw error;
        }
    }

    static async getAllAnnouncements() {
        try {
            const selectQuery = 'SELECT * FROM announcement';
            const [announcements, fields] = await connection.query(selectQuery);
            return announcements;
        } catch (error) {
            console.error('Get all announcements error:', error);
            throw error;
        }
    }

    static async getAnnouncementById(announcementId) {
        try {
            const selectQuery = 'SELECT * FROM announcement WHERE id = ?';
            const [announcements, fields] = await connection.query(selectQuery, [announcementId]);
            return announcements[0];
        } catch (error) {
            console.error('Get announcement by ID error:', error);
            throw error;
        }
    }
    static async getAllLostQuotes() {
        try {

            const selectQuery = 'SELECT * FROM lost_quote';
            const [lostQuotes, _] = await connection.query(selectQuery);

            // Fetch employee data for each lost quote
            const lostQuotesWithEmployeeInfo = await Promise.all(lostQuotes.map(async (lostQuote) => {
                const employeeId = lostQuote.assigned_to_employee;
                const [employeeData] = await connection.query('SELECT * FROM employee WHERE id = ?', [employeeId]);

                // Combine employee's first name and last name
                const employeeName = `${employeeData[0].name} ${employeeData[0].surname}`;

                return { ...lostQuote, assigned_to_employee: employeeName };
            }));

            // Fetch quote details for each lost quote
            const lostQuotesWithQuoteInfo = await Promise.all(lostQuotesWithEmployeeInfo.map(async (lostQuote) => {
                const quoteId = lostQuote.quote_id;
                const quoteDetails = await Quote.getQuoteById(quoteId);

                return { ...lostQuote, quoteDetails };
            }));

            return lostQuotesWithQuoteInfo;
        } catch (error) {
            console.error('Get lost quotes by admin error:', error);
            throw error;
        }
    }

    static async deleteLostQuoteById(lostQuoteId) {
        try {
            const deleteQuery = 'DELETE FROM lost_quote WHERE id = ?';
            const [result, _] = await connection.query(deleteQuery, [lostQuoteId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Delete lost quote error:', error);
            throw error;
        }
    }
    static async getAllQuotesWithItemsByEmployeeId(employeeId) {
        try {
            const selectQuery = `
            SELECT q.id AS quote_id, q.client_id, CONCAT(c.fname, ' ', c.lname) AS client_name, 
                   q.number AS quote_number, q.quote_current_date AS quote_date, 
                   q.status, q.expiry_date AS valid_until, q.terms_and_condition, q.payment_terms, q.execution_time,
                   q.bank_details,
                   qi.id AS item_id, qi.item_name, qi.item_description, qi.item_quantity, qi.item_xdim, 
                   qi.item_ydim, qi.item_price, qi.item_subtotal, qi.item_tax, qi.item_total
            FROM quote q
            JOIN quote_item qi ON q.id = qi.quote_id
            JOIN client c ON q.client_id = c.id
            WHERE q.added_by_employee = ?;
        `;

            const [quotesAndItems, fields] = await connection.query(selectQuery, [employeeId]);

            if (quotesAndItems.length === 0) {
                throw new Error('No quotes found for the provided employee ID.');
            }

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
                        client_name: row.client_name,
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



    static async getAllInvoicesWithItemsByEmployeeId(employeeId) {
        try {
            const selectQuery = `
            SELECT i.id AS invoice_id, i.client_id, CONCAT(c.fname, ' ', c.lname) AS client_name,
                   i.isPerforma, i.number, i.invoice_current_date, i.status,
                   i.expiry_date, i.terms_and_condition, i.payment_terms, i.execution_time, i.bank_details,
                   ii.id AS item_id, ii.item_name, ii.item_description, ii.item_quantity, ii.item_xdim, 
                   ii.item_ydim, ii.item_price, ii.item_subtotal, ii.item_tax, ii.item_total,
                   p.amount AS payment_amount
            FROM invoice i
            JOIN invoice_item ii ON i.id = ii.invoice_id
            LEFT JOIN payment p ON i.id = p.invoice_id
            JOIN client c ON i.client_id = c.id
            WHERE i.added_by_employee = ?;
        `;

            const [invoicesAndItems, fields] = await connection.query(selectQuery, [employeeId]);

            if (invoicesAndItems.length === 0) {
                throw new Error('No invoices found for the provided employee ID.');
            }

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
                        client_name: row.client_name,

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
                        ],
                        payment_amount: row.payment_amount || 0, // Default to 0 if payment_amount is null
                    });
                }
            }

            return formattedData;
        } catch (error) {
            console.error('Get all invoices, items, and amount by employee ID error:', error);
            throw new Error('Failed to fetch invoices, items, and amount for the provided employee ID.');
        }
    }






}





module.exports = Admin;
