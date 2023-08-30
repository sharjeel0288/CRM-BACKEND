const Employee = require('../model/Employee');
const connection = require('../../config/DbConfig');


// Get announcements by employee email
const getAnnouncementsByEmployeeEmail = async (req, res) => {
    try {
        const { email } = req.user; // Extract employee's email from req.user
        const query = 'SELECT * FROM announcement WHERE employee_id = (SELECT id FROM employee WHERE email = ?) AND status = 0';
        const [announcements, _] = await connection.query(query, [email]);
        // Map priority values to corresponding strings
        announcements.forEach(announcement => {
            switch (announcement.priority) {
                case 1:
                    announcement.priority = "LOW";
                    break;
                case 2:
                    announcement.priority = 'MEDIUM';
                    break;
                case 3:
                    announcement.priority = 'HIGH';
                    break;
                default:
                    announcement.priority = '--';
            }
        });
        console.log(announcements)
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error('Get announcements by employee email error:', error);
        res.status(500).json({ success: false, message: 'Failed to get announcements', error: error.message });
    }
};

const changeAnnouncementStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const { email } = req.user; // Extract employee's email from req.user
        const selectQuery = 'SELECT * FROM announcement WHERE id = ? AND employee_id = (SELECT id FROM employee WHERE email = ?)';
        const [announcements] = await connection.query(selectQuery, [id, email]);

        if (announcements.length === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found or not associated with the employee.' });
        }

        const announcement = announcements[0];
        if (announcement.status === 1) {
            return res.status(400).json({ success: false, message: 'Announcement status is already marked as completed.' });
        }

        const updateQuery = 'UPDATE announcement SET status = 1 WHERE id = ? AND employee_id = (SELECT id FROM employee WHERE email = ?)';
        const [result] = await connection.query(updateQuery, [id, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found or not associated with the employee.' });
        }

        res.status(200).json({ success: true, message: 'Announcement status changed successfully' });
    } catch (error) {
        console.error('Change announcement status error:', error);
        res.status(500).json({ success: false, message: 'Failed to change announcement status', error: error.message });
    }
};

const getLostQuotesByEmployee = async (req, res) => {
    try {
        const { id: employeeId } = req.user; // Extract employee's ID from req.user
        // const employeeId= 1000001
        const lostQuotes = await Employee.getLostQuotesByEmployeeId(employeeId);

        res.status(200).json({ success: true, lostQuotes });
    } catch (error) {
        console.error('Get lost quotes by employee error:', error);
        res.status(500).json({ success: false, message: 'Failed to get lost quotes', error: error.message });
    }
};
const markAsDone = async (req, res) => {
    const { lostQuoteId } = req.params;
    const { message } = req.body;

    try {
        const result = await Employee.markAsDone(lostQuoteId, message);
        if (result) {
            return res.status(200).json({ success: true, message: 'Lost quote marked as done successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Lost quote not found.' });
        }
    } catch (error) {
        console.error('Mark lost quote as done controller error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}
// Get quotes or invoices based on the department of the employee
const getDocumentsByDepartment = async (req, res) => {
    try {
        const { id, department } = req.user; // Extract employee's id and department from req.user

        let documents = [];

        if (department === 'sales') {
            documents = await Employee.getQuotesByEmployeeId(id);
        } else if (department === 'accounts') {
            documents = await Employee.getInvoicesByEmployeeId(id);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid department' });
        }

        res.status(200).json({ success: true, documents });
    } catch (error) {
        console.error('Get documents by department error:', error);
        res.status(500).json({ success: false, message: 'Failed to get documents', error: error.message });
    }
};

module.exports = {
    // ... Other functions ...
    getAnnouncementsByEmployeeEmail,
    changeAnnouncementStatus,
    getDocumentsByDepartment,
    getLostQuotesByEmployee,
    markAsDone,
};
