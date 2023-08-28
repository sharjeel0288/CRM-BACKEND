// app/models/Report.js

const connection = require('../../config/DbConfig');

class Report {
    static async getTotalRevenue() {
        try {
            const query = 'SELECT SUM(amount) AS total_revenue FROM payment';
            const [result, _] = await connection.query(query);
            return result[0].total_revenue || 0;
        } catch (error) {
            console.error('Get total revenue error:', error);
            throw error;
        }
    }
    static async getSalesReport(employeeId) {
        console.log('ID ', employeeId)
        try {
            const query = `
                SELECT
                    (SELECT COUNT(*) FROM quote WHERE status = 1 AND added_by_employee = ?) AS quote_draft_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 2 AND added_by_employee = ?) AS quote_pending_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 3 AND added_by_employee = ?) AS quote_sent_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 4 AND added_by_employee = ?) AS quote_expired_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 5 AND added_by_employee = ?) AS quote_declined_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 6 AND added_by_employee = ?) AS quote_accepted_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 7 AND added_by_employee = ?) AS quote_lost_count,
                    (SELECT COUNT(*) FROM quote WHERE added_by_employee = ?) AS total_quotes_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 1 AND added_by_employee = ?) AS quote_draft_count,
                    (SELECT COUNT(*) FROM quote WHERE status = 6 AND added_by_employee = ?) AS quote_approved_count
            `;
            const [result, _] = await connection.query(query, Array(11).fill(employeeId));
            console.log(result[0])

            const quoteSet = result[0].total_quotes_count || 0;
            const quoteDraft = result[0].quote_draft_count || 0;
            const quoteApproved = result[0].quote_approved_count || 0;

            const percentages = {};
            for (const status in result[0]) {
                percentages[status.replace('quote_', '').toLowerCase()] = ((result[0][status] / quoteSet) * 100).toFixed(2);
            }

            return {
                quoteSet,
                quoteDraft,
                quoteApproved,
                percentages
            };
        } catch (error) {
            console.error('Get sales report error:', error);
            throw error;
        }
    }
    static async getAccountsReport(employeeId) {
        console.log('ID asasasf', employeeId)
        try {
            const query = `
                SELECT
                    (SELECT COUNT(*) FROM invoice WHERE status = 1 AND added_by_employee = ?) AS invoice_draft_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 2 AND added_by_employee = ?) AS invoice_pending_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 3 AND added_by_employee = ?) AS invoice_sent_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 4 AND added_by_employee = ?) AS invoice_expired_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 5 AND added_by_employee = ?) AS invoice_declined_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 6 AND added_by_employee = ?) AS invoice_accepted_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 7 AND added_by_employee = ?) AS invoice_lost_count,
                    (SELECT COUNT(*) FROM invoice WHERE added_by_employee = ?) AS total_invoice_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 1 AND added_by_employee = ?) AS invoice_draft_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 6 AND added_by_employee = ?) AS invoice_approved_count
            `;
            const [result, _] = await connection.query(query, Array(11).fill(employeeId));
            console.log(result)
            const invoiceSet = result[0].total_invoice_count || 0;
            const invoiceDraft = result[0].invoice_draft_count || 0;
            const invoiceApproved = result[0].invoice_approved_count || 0;

            const percentages = {};
            for (const status in result[0]) {
                percentages[status.replace('invoice_', '').toLowerCase()] = ((result[0][status] / invoiceSet) * 100).toFixed(2);
            }

            return {
                invoiceSet,
                invoiceDraft,
                invoiceApproved,
                percentages
            };
        } catch (error) {
            console.error('Get sales report error:', error);
            throw error;
        }
    }
    static async getInvoiceStatusPercentages() {
        try {
            const query = `
                SELECT
                    (SELECT COUNT(*) FROM invoice WHERE status = 1) AS invoice_draft_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 2) AS invoice_pending_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 3) AS invoice_sent_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 4) AS invoice_expired_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 5) AS invoice_declined_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 6) AS invoice_accepted_count,
                    (SELECT COUNT(*) FROM invoice WHERE status = 7) AS invoice_lost_count
                    
            `;
            const [result, _] = await connection.query(query);
            const totalCount = Object.values(result[0]).slice(0, -2).reduce((acc, count) => acc + count, 0); // Exclude the total_invoice_amount and total_amount_paid from the count
            const percentages = {};
            for (const status in result[0]) {
                percentages[status.replace('invoice_', '').toLowerCase()] = ((result[0][status] / totalCount) * 100).toFixed(2);
            }

            return percentages;
        } catch (error) {
            console.error('Get invoice status percentages error:', error);
            throw error;
        }
    }

    static async getTotalQuotesSent() {
        try {
            const query = 'SELECT COUNT(*) AS total_quotes_sent FROM quote WHERE status = 3';
            const [result, _] = await connection.query(query);
            return result[0].total_quotes_sent || 0;
        } catch (error) {
            console.error('Get total quotes sent error:', error);
            throw error;
        }
    }

    static async getTotalQuoteDrafts() {
        try {
            const query = 'SELECT COUNT(*) AS total_quote_drafts FROM quote WHERE status = 1';
            const [result, _] = await connection.query(query);
            return result[0].total_quote_drafts || 0;
        } catch (error) {
            console.error('Get total quote drafts error:', error);
            throw error;
        }
    }

    static async getTotalQuoteApproved() {
        try {
            const query = 'SELECT COUNT(*) AS total_quote_approved FROM quote WHERE status = 6';
            const [result, _] = await connection.query(query);
            return result[0].total_quote_approved || 0;
        } catch (error) {
            console.error('Get total quote approved error:', error);
            throw error;
        }
    }

    static async getPaymentModes() {
        try {
            const query = 'SELECT id, name FROM payment_mode WHERE is_enabled = 1';
            const [paymentModes, _] = await connection.query(query);
            return paymentModes;
        } catch (error) {
            console.error('Get payment modes error:', error);
            throw error;
        }
    }

    static async getCustomerAddedThisMonthPercentage() {
        try {
            const query = `
                SELECT COUNT(*) AS total_customers
                FROM client
                WHERE YEAR(date) = YEAR(CURRENT_DATE()) AND MONTH(date) = MONTH(CURRENT_DATE())
            `;
            const [result, _] = await connection.query(query);
            const totalCustomers = result[0].total_customers || 0;

            const totalCustomersLastMonth = await this.getTotalCustomersLastMonth();

            if (totalCustomersLastMonth === 0) {
                return 100; // First month, consider 100% increase
            }

            const percentageIncrease = ((totalCustomers - totalCustomersLastMonth) / totalCustomersLastMonth) * 100;
            return Math.round(percentageIncrease);
        } catch (error) {
            console.error('Get customer added this month percentage error:', error);
            throw error;
        }
    }

    static async getTotalCustomersLastMonth() {
        try {
            const query = `
                SELECT COUNT(*) AS total_customers_last_month
                FROM client
                WHERE YEAR(date) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
                    AND MONTH(date) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
            `;
            const [result, _] = await connection.query(query);
            return result[0].total_customers_last_month || 0;
        } catch (error) {
            console.error('Get total customers last month error:', error);
            throw error;
        }
    }

    static async getRecentQuotes(limit) {
        try {
            const query = `
                SELECT CONCAT(c.fname, ' ', c.lname) AS client_name,
                       q.quote_current_date AS quote_date, q.status,
                       q.terms_and_condition, q.payment_terms,
                       SUM(qi.item_total) AS total_amount,
                       q.added_by_employee
                FROM quote q
                LEFT JOIN quote_item qi ON q.id = qi.quote_id
                LEFT JOIN client c ON q.client_id = c.id
                GROUP BY q.id
                ORDER BY q.quote_current_date DESC
                LIMIT ?;
            `;
            const [quotes, _] = await connection.query(query, [limit]);

            const recentQuotesWithEmployeeInfo = [];

            for (const quote of quotes) {
                const addedByInfo = {
                    employee_name: '',
                    employee_surname: '',
                };

                const addedByEmployeeQuery = `SELECT * FROM employee WHERE id = ?`;
                const [employeeResult] = await connection.query(addedByEmployeeQuery, [quote.added_by_employee]);

                if (employeeResult.length > 0) {
                    addedByInfo.employee_name = employeeResult[0].name;
                    addedByInfo.employee_surname = employeeResult[0].surname;
                } else {
                    const addedByAdminQuery = `SELECT * FROM admin WHERE id = ?`;
                    const [adminResult] = await connection.query(addedByAdminQuery, [quote.added_by_employee]);

                    if (adminResult.length > 0) {
                        addedByInfo.employee_surname = adminResult[0].lname; // Using lname field for admin's name
                    }
                }

                const quoteWithInfo = {
                    ...quote,
                    employee_name: addedByInfo.employee_name,
                    employee_surname: addedByInfo.employee_surname,
                };

                recentQuotesWithEmployeeInfo.push(quoteWithInfo);
            }

            return recentQuotesWithEmployeeInfo;
        } catch (error) {
            console.error('Get recent quotes error:', error);
            throw error;
        }
    }


    static async getRecentQuotesOfEmployee(id) {
        try {
            const query = `
                SELECT CONCAT(c.fname, ' ', c.lname) AS client_name,
                       q.quote_current_date AS quote_date, q.status,
                       q.terms_and_condition, q.payment_terms,
                       SUM(qi.item_total) AS total_amount,
                       q.added_by_employee
                FROM quote q
                LEFT JOIN quote_item qi ON q.id = qi.quote_id
                LEFT JOIN client c ON q.client_id = c.id
                WHERE q.added_by_employee = ?
                GROUP BY q.id
                ORDER BY q.quote_current_date DESC
                LIMIT 5;
            `;
            const [quotes, _] = await connection.query(query, [id]);
            if (quotes.total_amount === null) {
                quotes.total_amount = 0
            }
            const recentQuotesWithEmployeeInfo = [];

            for (const quote of quotes) {
                const addedByInfo = {
                    employee_name: '',
                    employee_surname: '',
                };

                const addedByEmployeeQuery = `SELECT * FROM employee WHERE id = ?`;
                const [employeeResult] = await connection.query(addedByEmployeeQuery, [quote.added_by_employee]);

                if (employeeResult.length > 0) {
                    addedByInfo.employee_name = employeeResult[0].name;
                    addedByInfo.employee_surname = employeeResult[0].surname;
                } else {
                    const addedByAdminQuery = `SELECT * FROM admin WHERE id = ?`;
                    const [adminResult] = await connection.query(addedByAdminQuery, [quote.added_by_employee]);

                    if (adminResult.length > 0) {
                        addedByInfo.employee_surname = adminResult[0].lname; // Using lname field for admin's name
                    }
                }

                const quoteWithInfo = {
                    ...quote,
                    employee_name: addedByInfo.employee_name,
                    employee_surname: addedByInfo.employee_surname,
                };

                recentQuotesWithEmployeeInfo.push(quoteWithInfo);
            }

            return recentQuotesWithEmployeeInfo;
        } catch (error) {
            console.error('Get recent quotes error:', error);
            throw error;
        }
    }


    static async getRecentInvoices(limit) {
        try {
            const query = `
                SELECT CONCAT(c.fname, ' ', c.lname) AS client_name,
                       i.invoice_current_date AS invoice_date, i.status,
                       i.terms_and_condition, i.payment_terms,
                       SUM(ii.item_total) AS total_amount
                FROM invoice i
                LEFT JOIN invoice_item ii ON i.id = ii.invoice_id
                LEFT JOIN client c ON i.client_id = c.id
                GROUP BY i.id
                ORDER BY i.invoice_current_date DESC
                LIMIT ?;
            `;
            const [invoices, _] = await connection.query(query, [limit]);
            return invoices;
        } catch (error) {
            console.error('Get recent invoices error:', error);
            throw error;
        }
    }
    static async getRecentInvoicesOfEmployee(id) {
        try {
            const query = `
                SELECT CONCAT(c.fname, ' ', c.lname) AS client_name,
                       i.invoice_current_date AS invoice_date, i.status,
                       i.terms_and_condition, i.payment_terms,
                       SUM(ii.item_total) AS total_amount
                FROM invoice i
                LEFT JOIN invoice_item ii ON i.id = ii.invoice_id
                LEFT JOIN client c ON i.client_id = c.id
                WHERE i.added_by_employee = ?
                GROUP BY i.id
                ORDER BY i.invoice_current_date DESC
                LIMIT 5;
            `;
            const [invoices, _] = await connection.query(query, [id]);
            return invoices;
        } catch (error) {
            console.error('Get recent invoices error:', error);
            throw error;
        }
    }


}

module.exports = Report;
