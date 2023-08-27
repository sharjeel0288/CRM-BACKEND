// app/controllers/adminController.js

const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');

// Admin signup
const adminSignup = async (req, res) => {
    try {
        const newAdminId = await Admin.createAdmin(req.body);
        res.status(201).json({ success: true, message: 'Admin signed up successfully', adminId: newAdminId });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};






// EMPLOYEE FUNCTIONS
// Create employee
const createEmployee = async (req, res) => {
    // const { department } = req.user;

    // if (department !== 'admin') {
    //     return res.status(403).json({ success: false, message: 'Only admins are allowed to create employees.' });
    // }

    try {
        console.log('Creating employee with data:', req.body);
        // Hash the employee's password before storing it

        const newEmployeeId = await Admin.createEmployee(req.body);
        res.status(201).json({ success: true, message: 'Employee created successfully', employeeId: newEmployeeId });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ success: false, message: 'Failed to create employee', error: error.message });
    }
};

const editEmployee = async (req, res, next) => {
    const employeeId = req.params.id;
    const updatedEmployeeData = req.body;
console.log(updatedEmployeeData)
    try {
        const result = await Admin.editEmployee(employeeId, updatedEmployeeData);
        console.log('Controller result:', result); // Log the result
        res.status(200).json({ message: 'Employee updated successfully.' });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ error: 'Failed to update employee.' });
    }
}

// Delete employee by ID
const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        // const department = req.user.department;
        // if (department !== 'admin') {
        //     return res.status(403).json({ success: false, message: 'Only admins are allowed to delete employees.' });
        // }

        const result = await Admin.deleteEmployeeById(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
    }
};


// Get all employees
const getAllEmployees = async (req, res) => {
    // const department = req.user.department;
    // if (department !== 'admin') {
    //     return res.status(403).json({ success: false, message: 'Only admins are allowed to access employee list.' });
    // }

    try {
        const employees = await Admin.getAllEmployees();
        res.status(200).json({ success: true, employees });
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({ success: false, message: 'Failed to get employees', error: error.message });
    }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    const department = req.user.department;

    if (department !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins are allowed to access employee details.' });
    }

    try {
        const employee = await Admin.getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found.' });
        }

        res.status(200).json({ success: true, employee });
    } catch (error) {
        console.error('Get employee by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get employee', error: error.message });
    }
};



// Create announcement
const createAnnouncement = async (req, res) => {
    // const { department } = req.user; // Extract employee's email from req.user

    // if (department !== 'admin') {
    //     return res.status(403).json({ success: false, message: 'Only admins are allowed to create announcements.' });
    // }
console.log("asfasf")
    try {
        const newAnnouncementId = await Admin.createAnnouncement(req.body);
        res.status(201).json({ success: true, message: 'Announcement created successfully', announcementId: newAnnouncementId });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to create announcement', error: error.message });
    }
};


// Delete announcement by ID
const deleteAnnouncement = async (req, res) => {
    const { announcementId } = req.params;
    const department = req.user.department;

    if (department !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins are allowed to delete announcements.' });
    }

    try {
        const result = await Admin.deleteAnnouncementById(announcementId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement', error: error.message });
    }
};
// Get all announcements
const getAllAnnouncements = async (req, res) => {
    const { department } = req.user;

    if (department !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins are allowed to access announcements.' });
    }

    try {
        const announcements = await Admin.getAllAnnouncements();
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error('Get all announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to get announcements', error: error.message });
    }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
    const { announcementId } = req.params;
    const department = req.user.department;

    if (department !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins are allowed to access announcements.' });
    }

    try {
        const announcement = await Admin.getAnnouncementById(announcementId);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        res.status(200).json({ success: true, announcement });
    } catch (error) {
        console.error('Get announcement by ID error:', error);
        res.status(500).json({ success: false, message: 'Failed to get announcement', error: error.message });
    }
};
const getAllLostQuotes= async (req, res) => {
    try {
        // const employeeId= 1000001
        const lostQuotes = await Admin.getAllLostQuotes();

        res.status(200).json({ success: true, lostQuotes });
    } catch (error) {
        console.error('Get lost quotes by admin error:', error);
        res.status(500).json({ success: false, message: 'Failed to get lost quotes', error: error.message });
    }
};
const getAllQuotesByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const quotes = await Admin.getAllQuotesWithItemsByEmployeeId(employeeId);
        res.status(200).json({ success: true, quotes });
    } catch (error) {
        console.error('Get all quotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quotes', error: error.message });
    }
};

const getAllInvoicesAndItemsByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const invoicesAndItems = await Admin.getAllInvoicesWithItemsByEmployeeId(employeeId);
        res.status(200).json({ success: true, invoicesAndItems });
    } catch (error) {
        console.error('Get all invoices and items error:', error);
        res.status(500).json({ success: false, message: 'Failed to get invoices and items', error: error.message });
    }
};
const deleteLostQuote = async(req, res) =>{
    const { lostQuoteId } = req.params;

    try {
        const result = await Admin.deleteLostQuoteById(lostQuoteId);
        if (result) {
            return res.status(200).json({ success: true, message: 'Lost quote deleted successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Lost quote not found.' });
        }
    } catch (error) {
        console.error('Delete lost quote controller error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
module.exports = {
    adminSignup,
    createEmployee,
    editEmployee,
    deleteEmployee,
    getAllEmployees,
    getEmployeeById,
    createAnnouncement,
    deleteAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    getAllQuotesByEmployeeId,
    getAllInvoicesAndItemsByEmployeeId,
    getAllLostQuotes,
    deleteLostQuote,
};