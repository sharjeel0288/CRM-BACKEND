// app/models/Admin.js

const connection = require('../../config/DbConfig');
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwtUtils'); // Import the jwtUtils module


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
            const insertQuery = 'INSERT INTO employee SET ?';
            const [result, fields] = await connection.query(insertQuery, [employeeData]);
            return result.insertId;
        } catch (error) {
            console.error('Create employee error:', error);
            throw error;
        }
    }


    static async deleteEmployeeById(employeeId) {
        try {
            const deleteQuery = 'DELETE FROM employee WHERE id = ?';
            const [result, fields] = await connection.query(deleteQuery, [employeeId]);
            return result;
        } catch (error) {
            console.error('Delete employee error:', error);
            throw error;
        }
    }

    static async getAllEmployees() {
        try {
            const selectQuery = 'SELECT * FROM employee';
            const [employees, fields] = await connection.query(selectQuery);
            return employees;
        } catch (error) {
            console.error('Get all employees error:', error);
            throw error;
        }
    }

    static async getEmployeeById(employeeId) {
        try {
            const selectQuery = 'SELECT * FROM employee WHERE id = ?';
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


}





module.exports = Admin;
