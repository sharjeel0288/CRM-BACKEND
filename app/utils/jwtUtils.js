// app\utils\jwtUtils.js
const jwt = require('jsonwebtoken');

const secretKey = 'crmzahid';
const tokenBlacklist = new Set(); // Maintain a set to store invalidated tokens

module.exports.generateToken = (payload) => {
  return jwt.sign(payload, secretKey);
};

module.exports.verifyToken = (token) => {
  console.log('Verifying token...');
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token is blacklisted');
    }
    
    const decodedToken = jwt.verify(token, secretKey);
    console.log('Token verification successful:', decodedToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw error;
  }
};

module.exports.addToBlacklist = (token) => {
  tokenBlacklist.add(token);
};
