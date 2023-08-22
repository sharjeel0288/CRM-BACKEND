const connection = require('../../config/DbConfig');

class Payment {
    static async createPayment(paymentData) {
        try {
            const { invoice_id, amount } = paymentData;

            // Calculate total amount from invoice items
            const selectInvoiceItemsQuery = 'SELECT SUM(item_total) AS total_amount FROM invoice_item WHERE invoice_id = ?';
            const [invoiceItemsTotalRows] = await connection.query(selectInvoiceItemsQuery, [invoice_id]);
            const totalInvoiceAmount = invoiceItemsTotalRows[0]?.total_amount || 0;

            // Calculate total amount paid for the invoice
            const selectTotalPaidQuery = 'SELECT SUM(amount) AS total_paid FROM payment WHERE invoice_id = ?';
            const [totalPaidRows] = await connection.query(selectTotalPaidQuery, [invoice_id]);
            const totalPaidAmount = totalPaidRows[0]?.total_paid || 0;

            // Check if the payment amount exceeds the total invoice amount
            const calculatedAmount = totalInvoiceAmount - (parseFloat(amount) + totalPaidAmount);

            // Check if the calculated amount is less than 0, indicating that the payment amount exceeds the total invoice amount
            if (calculatedAmount < 0) {
                throw new Error('Total paid amount exceeds total invoice amount');
            }

            const insertPaymentQuery = `
                INSERT INTO payment 
                (invoice_id, date, amount, payment_mode_id, reference, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const values = [
                paymentData.invoice_id,
                paymentData.date,
                paymentData.amount,
                paymentData.payment_mode_id,
                paymentData.reference,
                paymentData.description
            ];

            const [insertResult, _] = await connection.query(insertPaymentQuery, values);
            return insertResult.insertId;
        } catch (error) {
            console.error('Create payment error:', error);
            throw error;
        }
    }



    static async getAllPaymentsByInvoiceId(invoiceId) {
        try {
            const selectQuery = `SELECT p.*, pm.name AS payment_mode_name
            FROM payment p
            JOIN payment_mode pm ON p.payment_mode_id = pm.id
            WHERE p.invoice_id = ?;
            `;
            const [payments, fields] = await connection.query(selectQuery, [invoiceId]);
            return payments;
        } catch (error) {
            console.error('Get all payments for invoice error:', error);
            throw error;
        }
    }

    static async getPaymentById(paymentId) {
        try {
            const selectQuery = 'SELECT * FROM payment WHERE id = ?';
            const [payments, fields] = await connection.query(selectQuery, [paymentId]);
            return payments[0];
        } catch (error) {
            console.error('Get payment by ID error:', error);
            throw error;
        }
    }

    static async updatePaymentData(paymentId, updatedPaymentData) {
        try {
            const updateQuery = 'UPDATE payment SET ? WHERE id = ?';
            await connection.query(updateQuery, [updatedPaymentData, paymentId]);
        } catch (error) {
            console.error('Update payment data error:', error);
            throw error;
        }
    }

    static async deletePayment(paymentId) {
        try {
            const deleteQuery = 'DELETE FROM payment WHERE id = ?';
            await connection.query(deleteQuery, [paymentId]);
        } catch (error) {
            console.error('Delete payment error:', error);
            throw error;
        }
    }
}

module.exports = Payment;
