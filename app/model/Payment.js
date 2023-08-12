const connection = require('../../config/DbConfig');

class Payment {
    static async createPayment(paymentData) {
        try {
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
    
    
    static async getAllPaymentsByInvoiceId (invoiceId) {
        try {
            const selectQuery = 'SELECT * FROM payment WHERE invoice_id = ?';
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
