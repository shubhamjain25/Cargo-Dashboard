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


// Verify the JWT Token
const verifyToken = (req, res, next) => {
    // Expecting the token in the header as: "Bearer <token>"
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token against the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded payload (which contains the user's ID and role) to the request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { verifyToken, requireAdmin };