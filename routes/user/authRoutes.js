const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword } = require('../../controllers/user/authController');
const {
  validateUserSignup,
  validateUserLogin,
  validateForgotPassword
} = require('../../middlewares/validation');
const loginLimiter = require('../../middlewares/rateLimit');

router.post('/signup', validateUserSignup, signup);
router.post('/login', loginLimiter, validateUserLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);

module.exports = router;