const connection = require('../../config/DbConfig');

class Client {
  static async getAllClients() {
    try {
      const query = 'SELECT * FROM client';
      const [clients, fields] = await connection.query(query);
      return clients;
    } catch (error) {
      throw error;
    }
  }

  static async getClientById(id) {
    try {
      console.log('Trying to get client by ID:', id);
      const query = 'SELECT * FROM client WHERE id = ?';
      const [client, fields] = await connection.query(query, [id]);
      console.log('Found client:', client);
      return client[0];
    } catch (error) {
      console.error('Error in getClientById:', error);
      throw error;
    }
  }
  

  static async addClient(clientData) {
    try {
      // Check if the email already exists in the database
      const emailExistsQuery = 'SELECT id FROM client WHERE email = ?';
      const [existingClients, _] = await connection.query(emailExistsQuery, [clientData.email]);

      if (existingClients.length > 0) {
        throw new Error('A client with the provided email already exists.');
      }

      // If email is unique, insert the new client
      const insertQuery = 'INSERT INTO client SET ?';
      const [result, fields] = await connection.query(insertQuery, [clientData]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateClient(id, clientData) {
    try {
      if (!clientData || Object.keys(clientData).length === 0) {
        throw new Error('Please provide data to modify the client.');
      }
  
      // Check if the email already exists for another client
      if (clientData.email) {
        const emailExistsQuery = 'SELECT id FROM client WHERE email = ? AND id != ?';
        const [existingClients, _] = await connection.query(emailExistsQuery, [clientData.email, id]);
  
        if (existingClients.length > 0) {
          throw new Error('A client with the provided email already exists.');
        }
      }
  
      const updateQuery = 'UPDATE client SET ? WHERE id = ?';
      const [result, fields] = await connection.query(updateQuery, [clientData, id]);
  
      if (result.affectedRows === 0) {
        throw new Error('Client not found. No changes made.');
      }
  
      return 'Client updated successfully.';
    } catch (error) {
      console.error(error); // Log the error for debugging
      throw new Error('Failed to update the client.');
    }
  }
  



  static async deleteClient(id) {
    try {
      const query = 'DELETE FROM client WHERE id = ?';
      const [result, fields] = await connection.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async getClientByNameOrEmail(fname, email) {
    try {
      let query = 'SELECT * FROM client WHERE ';
      const queryParams = [];

      if (fname) {
        query += 'fname = ?';
        queryParams.push(fname);
      }

      if (email) {
        if (fname) {
          query += ' OR ';
        }
        query += 'email = ?';
        queryParams.push(email);
      }

      if (!fname && !email) {
        throw new Error('Please provide fname or email');
      }

      const [client, fields] = await connection.query(query, queryParams);

      if (!client || client.length === 0) {
        return null; // Return null if the client is not found
      }

      return client[0];
    } catch (error) {
      throw error;
    }
  }

}

module.exports = Client;
