// app\utils\helpingFunctions.js
const { body } = require('express-validator');

function calculatePaymentStatus(totalAmount, totalAmountPaid) {
    if (totalAmountPaid === 0) {
        return 'Unpaid';
    } else if (totalAmountPaid < totalAmount) {
        return 'Partially Paid';
    } else {
        return 'Paid';
    }
}

module.exports = {
    calculatePaymentStatus,
}