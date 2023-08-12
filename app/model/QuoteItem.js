// app/models/QuoteItem.js

const connection = require('../../config/DbConfig');

class QuoteItem {
  static async addQuoteItem(quoteId, itemData) {
    try {
      const insertQuery = 'INSERT INTO quote_item SET ?';
      const [result, fields] = await connection.query(insertQuery, { quote_id: quoteId, ...itemData });
      return result.insertId;
    } catch (error) {
      console.error('Add quote item error:', error);
      throw error;
    }
  }

  static async deleteQuoteItem(quoteItemId) {
    try {
      const deleteQuery = 'DELETE FROM quote_item WHERE id = ?';
      const [result, fields] = await connection.query(deleteQuery, [quoteItemId]);
      return result;
    } catch (error) {
      console.error('Delete quote item error:', error);
      throw error;
    }
  }

  static async editQuoteItem(quoteItemId, updatedItemData) {
    try {
      const updateQuery = 'UPDATE quote_item SET ? WHERE id = ?';
      const [result, fields] = await connection.query(updateQuery, [updatedItemData, quoteItemId]);
      return result;
    } catch (error) {
      console.error('Edit quote item error:', error);
      throw error;
    }
  }
}

module.exports = QuoteItem;
