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


const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:3001', // Change this to the correct origin of your frontend
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
// Routes
app.use('/api', clientRoutes);
app.use('/api', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api', quoteRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', paymentModeRoute);
app.use('/api', employeeRoutes);
app.use('/api',settingRoutes)
// Error handler
app.use(errorHandler);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});