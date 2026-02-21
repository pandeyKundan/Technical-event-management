const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['customer', 'vendor', 'admin'])
        .withMessage('Invalid role specified'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for login
const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for product
const validateProduct = [
    body('name').notEmpty().withMessage('Product name is required').trim(),
    body('price').isNumeric().withMessage('Price must be a number').custom(value => value >= 0),
    body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for order
const validateOrder = [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').isIn(['cash', 'upi', 'card']).withMessage('Invalid payment method'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateRegister,
    validateLogin,
    validateProduct,
    validateOrder
};