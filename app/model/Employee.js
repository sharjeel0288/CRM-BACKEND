// app\model\Employee.js
const connection = require('../../config/DbConfig');
const jwtUtils = require('../utils/jwtUtils'); // Import the jwtUtils module
const bcrypt = require('bcrypt');

class Employee {
    static async getEmployeeByEmail(email) {
        const query = 'SELECT * FROM employee WHERE email = ?';
        const [employees, _] = await connection.query(query, [email]);
        return employees[0];
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
          console.log('isPasswordValid: ',isPasswordValid)
          if (!isPasswordValid) {
              throw new Error('Incorrect password.');
          }
  
          return {
              id: user.id,
              email: user.email,
              department: user.department,
              authToken: jwtUtils.generateToken({ id: user.id, email: user.email, department: user.department }),
          };
      } catch (error) {
          throw error;
      }
  }
  
  
  
  
}

module.exports = Employee;
