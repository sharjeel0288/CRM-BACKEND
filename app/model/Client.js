const connection = require('../../config/DbConfig');
const Employee = require('./Employee');
// const Employee = require('./Employee');

const getEmployeeOrAdminById = async (id) => {
  const employeeQuery = 'SELECT name as fname, surname as lname FROM employee WHERE id = ?';
  const [employeeRows] = await connection.query(employeeQuery, [id]);
  if (employeeRows.length > 0) {
    console.log('employee found : ', employeeRows[0])
    return employeeRows[0];
  } else {
    const adminQuery = 'SELECT * FROM admin WHERE id = ?';
    const [adminRows] = await connection.query(adminQuery, [id]);
    console.log('admin found : ', adminRows[0])
    return adminRows[0];
  }
}

class Client {
  static async getAllClients() {
    try {
      const query = 'SELECT * FROM client';
      const [clients, fields] = await connection.query(query);

      // Iterate through each client to fetch the employee who added the client
      for (const client of clients) {
        const getEmployeeQuery = 'SELECT name, surname  FROM employee WHERE id = ?';
        const [employeeResults, employeeFields] = await connection.query(getEmployeeQuery, [client.added_by_employee]);

        if (employeeResults.length === 0) {
          client.added_by_employee = 'Admin';
        } else {
          const employee = employeeResults[0];
          client.added_by_employee = `${employee.name} ${employee.surname}`;
        }
      }
      console.log("admin clients", clients)

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
      // Check if the email or phone number already exists in the database
      const emailExistsQuery = 'SELECT * FROM client WHERE email = ? OR phone = ? or company_name = ?';
      const [existingClients, _] = await connection.query(emailExistsQuery, [clientData.email, clientData.phone, clientData.company_name]);

      if (existingClients.length > 0) {
        const user = await getEmployeeOrAdminById(existingClients[0].added_by_employee);
        throw new Error(`A client with the provided email, phone number, or company_name  already exists. Added by: ${user.fname} ${user.lname}`);
      }

      // If email and phone number are unique, insert the new client
      const insertQuery = 'INSERT INTO client SET ?';
      const [result, fields] = await connection.query(insertQuery, [clientData]);

      if (result.affectedRows === 1) {
        return result.insertId;
      } else {
        throw new Error('Client registration failed.');
      }
    } catch (error) {
      console.error(error);
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
        const [existingClientsWithEmail, _] = await connection.query(emailExistsQuery, [clientData.email, id]);

        if (existingClientsWithEmail.length > 0) {
          throw new Error('A client with the provided email already exists.');
        }
      }

      // Check if the number already exists for another client
      if (clientData.number) {
        const numberExistsQuery = 'SELECT id FROM client WHERE phone = ? AND id != ?';
        const [existingClientsWithNumber, _] = await connection.query(numberExistsQuery, [clientData.number, id]);

        if (existingClientsWithNumber.length > 0) {
          throw new Error('A client with the provided number already exists.');
        }
      }
      if (clientData.company_name) {
        const company_nameExistsQuery = 'SELECT id FROM client WHERE company_name = ? AND id != ?';
        const [existingClientsWithCompany_name, _] = await connection.query(company_nameExistsQuery, [clientData.company_name, id]);

        if (existingClientsWithCompany_name.length > 0) {
          throw new Error('A client with the provided company_name already exists.');
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
      throw error; // Throw the original error, don't wrap it in a new error message
    }

  }





  static async deleteClient(id) {
    try {
      console.log(id)
      console.log('************************************************************')
      const query = 'DELETE FROM client WHERE id = ?';
      const [result, fields] = await connection.query(query, [id]);
      console.log(result)
      return result.affectedRows;
    } catch (error) {
      console.log(error)
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
