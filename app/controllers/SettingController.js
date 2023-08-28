const connection = require('../../config/DbConfig');

const addOrUpdateLogo = async (req, res) => {
    const idToOperate = 1; // ID to operate on

    // Check if a logo image already exists
    const [existingLogoRows, _] = await connection.query('SELECT id, logo_img FROM setting WHERE id = ?', [idToOperate]);
    const logoImg = req.file ? req.file.filename : null;

    try {
        if (!logoImg) {
            // If logoImg is empty or null, return an error response
            console.log("img not provided")
            return res.status(400).json({ success: false, message: 'Logo image is empty or not provided' });
        }

        if (existingLogoRows.length > 0) {
            // Update the existing logo image
            const updateQuery = 'UPDATE setting SET logo_img = ? WHERE id = ?';
            await connection.query(updateQuery, [logoImg, idToOperate]);
            res.status(200).json({ success: true, message: 'Logo image updated successfully' });
        } else {
            // Insert a new logo image with the specified ID
            const insertQuery = 'INSERT INTO setting (id, logo_img) VALUES (?, ?)';
            await connection.query(insertQuery, [idToOperate, logoImg]);
            res.status(201).json({ success: true, message: 'Logo image added successfully' });
        }
    } catch (error) {
        console.error('Add or update logo image error:', error);
        res.status(500).json({ success: false, message: 'Failed to add or update logo image', error: error.message });
    }
};




const addOrUpdateStampLogo = async (req, res) => {
    const idToOperate = 1; // ID to operate on

    // Check if a logo image already exists
    const [existingStampRows, _] = await connection.query('SELECT id, stamp_img FROM setting WHERE id = ?', [idToOperate]);
    const stampImg = req.file ? req.file.filename : null;

    try {
        if (existingStampRows.length > 0) {
            // Update the existing logo image
            const updateQuery = 'UPDATE setting SET stamp_img = ? WHERE id = ?';
            await connection.query(updateQuery, [stampImg, idToOperate]);
            res.status(200).json({ success: true, message: 'stamp image updated successfully' });
        } else {
            // Insert a new logo image with the specified ID
            const insertQuery = 'INSERT INTO setting (id, stamp_img) VALUES (?, ?)';
            await connection.query(insertQuery, [idToOperate, stampImg]);
            res.status(201).json({ success: true, message: 'stamp image added successfully' });
        }
    } catch (error) {
        console.error('Add or update stamp image error:', error);
        res.status(500).json({ success: false, message: 'Failed to add or update stamp image', error: error.message });
    }
};

const addOrUpdateAddress = async (req, res) => {
    const idToOperate = 1; // ID to operate on
    const { address } = req.body;

    // Validate the address field
    if (!address) {
        return res.status(400).json({ success: false, message: 'Address is required' });
    }

    try {
        const updateQuery = 'UPDATE setting SET address = ? WHERE id = ?';
        const [updateResult] = await connection.query(updateQuery, [address, idToOperate]);

        if (updateResult.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Address updated successfully' });
        } else {
            // If no rows were affected, insert a new row with the specified ID and address
            const insertQuery = 'INSERT INTO setting (id, address) VALUES (?, ?)';
            await connection.query(insertQuery, [idToOperate, address]);
            res.status(201).json({ success: true, message: 'Address added successfully' });
        }
    } catch (error) {
        console.error('Add or update address error:', error);
        res.status(500).json({ success: false, message: 'Failed to add or update address', error: error.message });
    }
};

const addOrUpdateVatNo = async (req, res) => {
    const idToOperate = 1; // ID to operate on
    const { vat_no } = req.body;

    // Validate the vat_no field
    if (!vat_no) {
        return res.status(400).json({ success: false, message: 'VAT number is required' });
    }

    try {
        const updateQuery = 'UPDATE setting SET vat_no = ? WHERE id = ?';
        const [updateResult] = await connection.query(updateQuery, [vat_no, idToOperate]);

        if (updateResult.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'VAT number updated successfully' });
        } else {
            // If no rows were affected, insert a new row with the specified ID and VAT number
            const insertQuery = 'INSERT INTO setting (id, vat_no) VALUES (?, ?)';
            await connection.query(insertQuery, [idToOperate, vat_no]);
            res.status(201).json({ success: true, message: 'VAT number added successfully' });
        }
    } catch (error) {
        console.error('Add or update VAT number error:', error);
        res.status(500).json({ success: false, message: 'Failed to add or update VAT number', error: error.message });
    }
};


const addOrUpdateName = async (req, res) => {
    const idToOperate = 1; // ID to operate on
    const { name } = req.body;

    // Validate the vat_no field
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    try {
        const updateQuery = 'UPDATE setting SET name = ? WHERE id = ?';
        const [updateResult] = await connection.query(updateQuery, [name, idToOperate]);

        if (updateResult.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'name updated successfully' });
        } else {
            // If no rows were affected, insert a new row with the specified ID and VAT number
            const insertQuery = 'INSERT INTO setting (id, name) VALUES (?, ?)';
            await connection.query(insertQuery, [idToOperate, name]);
            res.status(201).json({ success: true, message: 'name added successfully' });
        }
    } catch (error) {
        console.error('Add or update name error:', error);
        res.status(500).json({ success: false, message: 'Failed to add or update name', error: error.message });
    }
};

const getSettings = async (req, res) => {
    try {
        const selectQuery = 'SELECT * FROM setting WHERE id = 1';
        const [settingRows, _] = await connection.query(selectQuery);

        if (settingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        const settings = settingRows[0];
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to get settings', error: error.message });
    }
};

module.exports = {
    addOrUpdateLogo,
    addOrUpdateAddress,
    addOrUpdateStampLogo,
    addOrUpdateVatNo,
    getSettings,
    addOrUpdateName,
};
