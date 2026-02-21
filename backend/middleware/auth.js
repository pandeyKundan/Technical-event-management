const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token and attach user to request
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // Get user from token (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Auth error:', error);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Authorize based on user roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Role ${req.user.role} is not authorized to access this resource` 
            });
        }
        next();
    };
};

// Optional auth - doesn't require token but attaches user if present
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Ignore token errors for optional auth
            console.log('Optional auth failed:', error.message);
        }
    }
    next();
};

// Check if user is owner of resource or admin
const checkOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Admin can access any resource
            if (req.user.role === 'admin') {
                return next();
            }

            const resourceUserId = await getResourceUserId(req);
            
            if (resourceUserId && resourceUserId.toString() === req.user.id) {
                return next();
            }

            return res.status(403).json({ message: 'Not authorized to access this resource' });
        } catch (error) {
            console.error('Ownership check error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = { 
    protect, 
    authorize, 
    optionalAuth,
    checkOwnership 
};