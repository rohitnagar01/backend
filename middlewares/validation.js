const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/errorHandler');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => err.msg);
    next(new ApiError(400, errorMessages[0]));
  };
};

// Admin login validation
const validateAdminLogin = validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
]);

// OTP validation
const validateOTP = validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
]);

// User signup validation
const validateUserSignup = validate([
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('middleName').trim().notEmpty().withMessage('Middle name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
]);

// User login validation
const validateUserLogin = validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
]);

// Forgot password validation
const validateForgotPassword = validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format')
]);

// Location validation
const validateLocation = validate([
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('type').isIn(['country', 'state', 'city']).withMessage('Invalid location type'),
  body('parentId').optional().isMongoId().withMessage('Invalid parent ID')
]);

// Student type validation
const validateStudentType = validate([
  body('type').isIn(['school', 'college']).withMessage('Invalid student type'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
]);




module.exports = {
  validateAdminLogin,
  validateOTP,
  validateUserSignup,
  validateUserLogin,
  validateForgotPassword,
  validateLocation,
  validateStudentType
};