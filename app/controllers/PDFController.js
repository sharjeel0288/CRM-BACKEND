const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generateQRCode } = require('../utils/generateQRCode');
const Client = require('../model/Client')
const Quote = require('../model/Quote')
const Invoice = require('../model/Invoice')
const Setting = require('../model/Setting')
const Employee = require('../model/Employee');
const PaymentMode = require('../model/PaymentMode');
const Admin = require('../model/Admin');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const connection = require('../../config/DbConfig');


const getEmployeeOrAdminById = async (id) => {
    const employeeQuery = 'SELECT * FROM employee WHERE id = ?';
    const [employeeRows] = await connection.query(employeeQuery, [id]);

    if (employeeRows.length > 0) {
        return employeeRows[0];
    } else {
        const adminQuery = 'SELECT * FROM admin WHERE email = ?';
        const [adminRows] = await connection.query(adminQuery, [id]);
        return adminRows[0];
    }
}

const GetQuotePdfDetails = async (req, res) => {
    try {
        const quoteId = req.params.id;

        // Fetch quote data using the provided quoteId
        const quoteData = await Quote.getQuoteById(quoteId);

        // Fetch quote items associated with the quoteId
        const quoteItems = await Quote.getQuoteItemsByQuoteId(quoteId);

        // Fetch application settings
        const settings = await Setting.getSetting();

        // Fetch client data based on the client ID in quoteData
        const client = await Client.getClientById(quoteData.client_id);

        // Fetch employee data based on the employee ID in quoteData
        const employee = await getEmployeeOrAdminById(quoteData.added_by_employee);

        // List of possible status values
        const statusList = ['Draft', 'Pending', 'Sent', 'Expired', 'Declined', 'Accepted', 'Lost'];


        // Assign the calculated status to quoteData
        quoteData.status = statusList[quoteData.status - 1];

        const paymentMode = await PaymentMode.getPaymentModeById(quoteData.payment_mode_id)

        // At this point, you have fetched and calculated all the necessary data
        // You can now use this data to generate a PDF or perform any other required tasks
        let subtotal = 0
        for (const item of quoteItems) {
            subtotal += item.item_total
        }
        const vatRate = 0.1; // 10% VAT rate
        const tax = subtotal * vatRate;
        const total = subtotal + tax;
        // Placeholder response indicating success
        res.status(200).json({
            success: true, message: 'Quote PDF details generated successfully', data: {
                quoteData,
                quoteItems,
                settings,
                client,
                employee,
                paymentMode,
                Summarry: { subtotal, vatRate, tax, total }
            }
        });
    } catch (error) {
        console.error('Generate quote PDF error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while generating PDF', error: error.message });
    }
};

const GetInvoicePdfDetails = async (req, res) => {
    try {
        const invoiceID = req.params.id;

        // Fetch quote data using the provided quoteId
        const invoiceData = await Invoice.getInvoiceById(invoiceID);

        // Fetch quote items associated with the quoteId
        const invoiceItems = await Invoice.getInvoiceItemsByInvoiceId(invoiceID);

        // Fetch application settings
        const settings = await Setting.getSetting();

        // Fetch client data based on the client ID in quoteData
        const client = await Client.getClientById(invoiceData.client_id);

        // Fetch employee data based on the employee ID in quoteData
        const employee = await getEmployeeOrAdminById(invoiceData.added_by_employee);

        // List of possible status values
        const statusList = ['Draft', 'Pending', 'Sent', 'Expired', 'Declined', 'Accepted', 'Lost'];
        invoiceData.status = statusList[invoiceData.status - 1];

        // Calculate the quote status based on the status value in quoteData
        if (invoiceData.isPerforma == 1) {
            invoiceData.isPerforma = "Performa Invoice"
        }
        else {
            invoiceData.isPerforma = "Data Invoice"
        }
        const paymentMode = await PaymentMode.getPaymentModeById(invoiceData.payment_mode_id)

        // At this point, you have fetched and calculated all the necessary data
        // You can now use this data to generate a PDF or perform any other required tasks
        let subtotal = 0
        for (const item of invoiceItems) {
            subtotal += item.item_total
        }
        const vatRate = 0.1; // 10% VAT rate
        const tax = subtotal * vatRate;
        const total = subtotal + tax;
        // Placeholder response indicating success
        res.status(200).json({
            success: true, message: 'Invoice PDF details generated successfully', data: {
                invoiceData,
                invoiceItems,
                settings,
                client,
                employee,
                paymentMode,
                Summarry: { subtotal, vatRate, tax, total }
            }
        });
    } catch (error) {
        console.error('Generate Invoice PDF error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while generating PDF', error: error.message });
    }
};


const sendPdfByEmail = async (req, res) => {
    try {
        const id = req.body.employeeId;
        const clientId = req.body.clientId
        const userPassword = req.body.employeePassword
        const employee = await Employee.getEmployeeById(id);
        const admin = await Admin.getAdminById(id);
        const client = await Client.getClientById(clientId)


        if (!employee && !admin) {
            throw new Error('User not found');
        }
        if (!client) {
            throw new Error("Client not found")
        }


        const user = employee || admin;
        console.log("user", user)
        console.log("client", client)
        const isPasswordValid = await bcrypt.compare(userPassword, user.password); // Compare passwords
        console.log('isPasswordValid: ', isPasswordValid)
        if (!isPasswordValid) {
            throw new Error('Incorrect password.');
        }


        const mailOptions = {
            from: user.email, // Use the fetched user's email as the sender
            to: client.email,
            subject: 'PDF Attachment',
            text: 'PDF file attached.',
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer,
                },
            ],
        };
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Replace with your email service
            auth: {
                user: user.email, // Use the fetched user's email as the sender
                pass: userPassword, // Use the fetched user's password as the password
            },
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                res.status(500).json({ success: false, message: 'An error occurred while sending email', error: error.message });
            } else {
                console.log('Email sent:', info.response);
                res.status(200).json({ success: true, message: 'Email sent successfully' });
            }
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
    }
};


module.exports = {
    GetQuotePdfDetails,
    GetInvoicePdfDetails,
    sendPdfByEmail
};