const { body, validationResult } = require('express-validator');
const validator = require('validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        req.flash.error(errorMessages.join(', '));
        return res.redirect('back');
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('firstName')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('First name can only contain letters'),
    
    body('lastName')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Last name can only contain letters'),
    
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
    
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Event creation/update validation
const validateEvent = [
    body('title')
        .trim()
        .escape()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('category')
        .isIn(['Outdoor', 'Indoor', 'Water Sports', 'Winter Sports', 'Other'])
        .withMessage('Please select a valid category'),
    
    body('host')
        .trim()
        .escape()
        .isLength({ min: 2, max: 100 })
        .withMessage('Host name must be between 2 and 100 characters'),
    
    body('location')
        .trim()
        .escape()
        .isLength({ min: 3, max: 200 })
        .withMessage('Location must be between 3 and 200 characters'),
    
    body('startDateTime')
        .isISO8601()
        .withMessage('Please provide a valid start date and time')
        .isAfter()
        .withMessage('Start date must be in the future'),
    
    body('endDateTime')
        .isISO8601()
        .withMessage('Please provide a valid end date and time')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDateTime)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    body('details')
        .trim()
        .escape()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Details must be between 10 and 2000 characters'),
    
    handleValidationErrors
];

// RSVP validation
const validateRSVP = [
    body('status')
        .isIn(['YES', 'NO', 'MAYBE'])
        .withMessage('RSVP status must be YES, NO, or MAYBE'),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateEvent,
    validateRSVP,
    handleValidationErrors
};