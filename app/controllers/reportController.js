// app/controllers/reportController.js

const Report = require('../model/Report');

const getReports = async (req, res) => {
    try {
        const totalRevenue = await Report.getTotalRevenue();
        const totalQuotesSent = await Report.getTotalQuotesSent();
        const totalQuoteDrafts = await Report.getTotalQuoteDrafts();
        const totalQuoteApproved = await Report.getTotalQuoteApproved();
        const paymentModes = await Report.getPaymentModes();
        const customerAddedThisMonthPercentage = await Report.getCustomerAddedThisMonthPercentage();
        const recentQuotes = await Report.getRecentQuotes(5);
        const recentInvoices = await Report.getRecentInvoices(5);
        const invoiceStatusPercentages = await Report.getInvoiceStatusPercentages();
        res.status(200).json({
            success: true,
            invoiceStatusPercentages,
            totalRevenue,
            totalQuotesSent,
            totalQuoteDrafts,
            totalQuoteApproved,
            paymentModes,
            customerAddedThisMonthPercentage,
            recentQuotes,
            recentInvoices,
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to get reports', error: error.message });
    }
};
const getSalesReports = async (req, res) => {
    console.log('asfasfas')
    try {
        const { id } = req.user;
        const salesReport = await Report.getSalesReport(id); // Get sales report for the specific employee

        res.status(200).json({
            success: true,

            salesReport, // Include the sales report data
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to get reports', error: error.message });
    }
};

const getAccountsReports = async (req, res) => {
    try {
        const { id } = req.user;
        const salesReport = await Report.getAccountsReport(id); // Get sales report for the specific employee

        res.status(200).json({
            success: true,

            salesReport, // Include the sales report data
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Failed to get reports', error: error.message });
    }
};

module.exports = {
    getReports,
    getSalesReports,
    getAccountsReports,
};
