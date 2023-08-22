const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const settingController = require('../controllers/SettingController');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');


// File storage setup for multer
const storelogo = multer.diskStorage({
    destination: function (req, file, cb) {
        const directory = 'uploads/logo';

        // Remove all existing files from the directory
        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
            cb(null, directory);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename without any modifications
    }
});

const storestamp = multer.diskStorage({
    destination: function (req, file, cb) {
        const directory = 'uploads/stamp';

        // Remove all existing files from the directory
        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
            cb(null, directory);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename without any modifications
    }
});

// Create multer middleware instances
const uploadLogo = multer({ storage: storelogo }).single('logo');
const uploadStamp = multer({ storage: storestamp }).single('stamp');



// Logo routes
router.post('/logo/add-or-update', uploadLogo, settingController.addOrUpdateLogo);

// Stamp logo routes
router.post('/stamp/add-or-update', uploadStamp, settingController.addOrUpdateStampLogo);

// Address and VAT number routes
router.post('/address/add-or-update', settingController.addOrUpdateAddress);
router.post('/vat-no/add-or-update', settingController.addOrUpdateVatNo);
router.post('/name/add-or-update', settingController.addOrUpdateName);

// Get settings route
router.get('/get-settings', settingController.getSettings);

module.exports = router;
