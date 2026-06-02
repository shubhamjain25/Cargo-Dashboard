const jwt = require('jsonwebtoken');

// Enforce Admin-Only Clearance
const requireAdmin = (req, res, next) => {
    // Check if the decoded user role is anything other than 'Admin'
    if (!req.user || req.user.role !== 'Admin') {
        // Return the exact 403 status and message required for Standard users
        return res.status(403).json({ message: 'Clearance level inadequate.' });
    }
    
    // User is an Admin, allow them to proceed to the upload controller
    next();
};

module.exports = { requireAdmin };