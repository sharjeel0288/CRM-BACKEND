// app\controllers\authController.js

const Employee = require('../model/Employee');
const Admin = require('../model/Admin');
const jwtUtils = require('../utils/jwtUtils');

class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;

        try {
            let user = await Admin.login(email, password); // Try admin login
            console.log(user)
            if (user == null) {
                user = await Employee.login(email, password); // If admin login fails, try employee login
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            return res.status(200).json({ success: true, message: 'Login successful', user });
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Login failed', error: error.message });
        }
    }
    static async logout(req, res) {
        const authToken = req.header('Authorization');

        if (!authToken) {
            return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
        }

        try {
            const token = authToken.split(' ')[1]; // Splitting the token
            jwtUtils.addToBlacklist(token); // Add the token to the blacklist

            // Respond with a success message
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({ success: false, message: 'Failed to log out', error: error.message });
        }
    }
}

module.exports = AuthController;
