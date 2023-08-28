// app.js

const express = require('express');
const cors = require('cors');
const clientRoutes = require('./app/routes/clientRoutes');
const errorHandler = require('./app/middleware/errorHandler');
const connection = require('./config/DbConfig'); // Import the database connection
const paymentModeRoute = require('./app/routes/paymentModeRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const authRoutes = require('./app/routes/authRoutes');
const quoteRoutes = require('./app/routes/QuoteRoutes');
const invoiceRoutes = require('./app/routes/invoiceRoutes');
const employeeRoutes = require('./app/routes/employeeRoutes');
const settingRoutes = require('./app/routes/SettingRoutes');
const bodyParser = require('body-parser');
const reportRoutes = require('./app/routes/reportRoutes');
const sendPdf = require('./app/routes/pdfEmail')
const path = require('path');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:3001', // Change this to the correct origin of your frontend
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads/stamp', express.static(path.join(__dirname, 'uploads', 'stamp')));
app.use('/uploads/logo', express.static(path.join(__dirname, 'uploads', 'logo')));

// Routes
app.use('/api', reportRoutes);
app.use('/api', clientRoutes);
app.use('/api', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api', quoteRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paymentModeRoute);
app.use('/api', employeeRoutes);
app.use('/api', settingRoutes)
app.use('/api', sendPdf)

// Schedule the function to run on the 1st day of each month
const { assignLostQuotesToSalesEmployees } = require('./app/scheduler/lostQuote'); // Import the function
const schedule = require('node-schedule');
const monthlySchedule = '0 0 1 * *';
// const minuteSchedule = '* * * * *'; // Run every minute
schedule.scheduleJob(monthlySchedule, () => {
  assignLostQuotesToSalesEmployees();
  console.log('Scheduled task executed at:', new Date());
});
// assignLostQuotesToSalesEmployees()

// Error handler
app.use(errorHandler);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});