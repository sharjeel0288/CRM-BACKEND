const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfController = require('../controllers/PDFController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/send-pdf', upload.single('pdfFile'), pdfController.sendPdfByEmail);

module.exports = router;
