const connection = require('../../config/DbConfig');

class PaymentMode {
    static async createPaymentMode(paymentModeData) {
        try {
            const insertQuery = 'INSERT INTO payment_mode SET ?';
            const [result, fields] = await connection.query(insertQuery, [paymentModeData]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async getAllPaymentModes() {
        try {
            const selectQuery = 'SELECT * FROM payment_mode';
            const [paymentModes, fields] = await connection.query(selectQuery);
            return paymentModes;
        } catch (error) {
            throw error;
        }
    }

    static async getPaymentModeById(paymentModeId) {
        try {
            const selectQuery = 'SELECT * FROM payment_mode WHERE id = ?';
            const [paymentModes, fields] = await connection.query(selectQuery, [paymentModeId]);
            return paymentModes[0];
        } catch (error) {
            throw error;
        }
    }

    static async updatePaymentMode(paymentModeId, paymentModeData) {
        try {
            const updateQuery = 'UPDATE payment_mode SET ? WHERE id = ?';
            const [result, fields] = await connection.query(updateQuery, [paymentModeData, paymentModeId]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async deletePaymentMode(paymentModeId) {
        try {
            const deleteQuery = 'DELETE FROM payment_mode WHERE id = ?';
            const [result, fields] = await connection.query(deleteQuery, [paymentModeId]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PaymentMode;
