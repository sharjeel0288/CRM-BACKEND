// app\middleware\authMiddleware.js
const jwtUtils = require('../utils/jwtUtils');
const Admin = require('../model/Admin');
const Employee = require('../model/Employee');



module.exports.authenticateAdmin = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);

    const admin = await Admin.getAdminByEmail(decodedToken.email);
    if (!admin) {
      throw new Error('User is not authorized as an admin.');
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid admin authentication.' });
  }
};
module.exports.authenticateEmployee = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);

    const emp = await Employee.getEmployeeByEmail(decodedToken.email);
    if (!emp) {
      throw new Error('User is not authorized as an Employee.');
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid admin authentication.' });
  }
};
module.exports.authenticateSalesEmployee = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);

    const employee = await Employee.getEmployeeByEmail(decodedToken.email);
    if (!employee || employee.department.toLowerCase() !== 'sales') {
      throw new Error('User is not authorized as a Sales employee.');
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Sales employee authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Sales employee authentication.' });
  }
};



module.exports.authenticateAccountsEmployee = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);

    const employee = await Employee.getEmployeeByEmail(decodedToken.email);
    if (!employee || employee.department.toLowerCase() !== 'accounts') {
      throw new Error('User is not authorized as a Accounts employee.');
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Accounts employee authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Accounts employee authentication.' });
  }
};


module.exports.authAdminSales = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);
    if (decodedToken.department.toLowerCase() == 'admin') {
      const admin = await Admin.getAdminByEmail(decodedToken.email);
      if (!admin) {
        throw new Error('User is not authorized as an admin.');
      }
    }
    else if(decodedToken.department.toLowerCase() == 'sales'){
      console.log(decodedToken)
      const sales = await Employee.getEmployeeByEmail(decodedToken.email);
      if (!sales) {
        throw new Error('User is not authorized as an Sales.');
      }
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Sales admin authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Sales admin authentication.' });
  }
};

module.exports.authAdminAccounts = async (req, res, next) => {
  const authToken = req.header('Authorization');

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Access denied. Missing authentication token.' });
  }

  try {
    const token = authToken.split(' ')[1]; // Splitting the token
    const decodedToken = jwtUtils.verifyToken(token);
    if (decodedToken.department.toLowerCase() == 'admin') {
      const admin = await Admin.getAdminByEmail(decodedToken.email);
      if (!admin) {
        throw new Error('User is not authorized as an admin.');
      }
    }
    else if(decodedToken.department.toLowerCase() == 'accounts'){
      console.log(decodedToken)
      const accounts = await Employee.getEmployeeByEmail(decodedToken.email);
      if (!accounts) {
        throw new Error('User is not authorized as an Accounts.');
      }
    }


    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Accounts admin authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Accounts admin authentication.' });
  }
};

