const express = require('express');
const cors = require('cors');
const clientRoutes = require('./app/routes/clientRoutes');
const errorHandler = require('./app/middleware/errorHandler');
const paymentModeRoute = require('./app/routes/paymentModeRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const authRoutes = require('./app/routes/authRoutes');
const quoteRoutes = require('./app/routes/QuoteRoutes');
const invoiceRoutes = require('./app/routes/invoiceRoutes');
const employeeRoutes = require('./app/routes/employeeRoutes');
const settingRoutes = require('./app/routes/SettingRoutes');
const bodyParser = require('body-parser');
const reportRoutes = require('./app/routes/reportRoutes');
const sendPdf = require('./app/routes/pdfEmail');
const path = require('path');
const fs = require('fs');
const https = require('https');
const port = 3000;

const app = express();
const corsOptions = {
  origin: [
    'https://crm.fourseasonglassrooms.com',
    'https://test.fourseasonglassrooms.com',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
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
app.use('/api', settingRoutes);
app.use('/api', sendPdf);

// Schedule the function to run on the 1st day of each month
const { assignLostQuotesToSalesEmployees } = require('./app/scheduler/lostQuote');
const schedule = require('node-schedule');
const monthlySchedule = '0 0 1 * *';
schedule.scheduleJob(monthlySchedule, () => {
  assignLostQuotesToSalesEmployees();
  console.log('Scheduled task executed at:', new Date());
});

// Error handler
app.use(errorHandler);

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// HTTPS (SSL/TLS) Configuration
const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/backend.fourseasonglassrooms.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/backend.fourseasonglassrooms.com/fullchain.pem')
};

// Create an HTTPS server
const server = https.createServer(httpsOptions, app);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on HTTPS at port ${port}`);
});
