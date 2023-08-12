const Employee = require('../model/Employee');
const connection = require('../../config/DbConfig');

// ... Other functions ...

// Get announcements by employee email
const getAnnouncementsByEmployeeEmail = async (req, res) => {
    try {
        const { email } = req.user; // Extract employee's email from req.user
        const query = 'SELECT * FROM announcement WHERE employee_id = (SELECT id FROM employee WHERE email = ?) AND status = 0';
        const [announcements, _] = await connection.query(query, [email]);
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



module.exports = {
    // ... Other functions ...
    getAnnouncementsByEmployeeEmail,
    changeAnnouncementStatus,
};
