// app\utils\helpingFunctions.js
const { body } = require('express-validator');

function calculatePaymentStatus(totalAmount, totalAmountPaid) {
    if (totalAmountPaid === 0) {
        return 'UNPAID';
    } else if (totalAmountPaid < totalAmount) {
        return 'PARTIALLY PAID';
    } else {
        return 'PAID';
    }
}

module.exports = {
    calculatePaymentStatus,
}