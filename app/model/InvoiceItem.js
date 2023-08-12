// app\model\InvoiceItem.js


const connection = require('../../config/DbConfig');

class InvoiceItem {
    static async addInvoiceItem(invoiceId, itemData) {
        try {
            const insertQuery = 'INSERT INTO invoice_item SET ?';
            const [result] = await connection.query(insertQuery, { invoice_id: invoiceId, ...itemData });
            return result.insertId;
        } catch (error) {
            console.error('Add invoice item error:', error);
            throw error;
        }
    }

    static async deleteInvoiceItem(item_id) {
        try {
            const deleteQuery = 'DELETE FROM invoice_item WHERE id = ?';
            const [result] = await connection.query(deleteQuery, [item_id]);
            return result;
        } catch (error) {
            console.error('Delete invoice item error:', error);
            throw error;
        }
    }

    static async editInvoiceItem(item_id, updatedItemData) {
        try {
            const updateQuery = 'UPDATE invoice_item SET ? WHERE id = ?';
            const [result] = await connection.query(updateQuery, [updatedItemData, item_id]);
            return result;
        } catch (error) {
            console.error('Edit invoice item error:', error);
            throw error;
        }
    }
}

module.exports = InvoiceItem;
