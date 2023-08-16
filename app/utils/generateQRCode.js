// app\utils\generateQRCode.js
const QRCode = require('qrcode');
const path = require('path');

// Function to generate a QR code
const generateQRCode = async (data) => {
  try {
    const qrCodeOptions = {
      errorCorrectionLevel: 'H', // High error correction level
      type: 'image/png', // Output format
      quality: 0.92, // Quality factor for PNG
      margin: 1, // Margin around the QR code
    };

    // Generate the QR code image as a Buffer
    const qrCodeBuffer = await QRCode.toBuffer(data, qrCodeOptions);

    return qrCodeBuffer;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
};
