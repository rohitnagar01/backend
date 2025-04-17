const express = require('express');
const router = express.Router();
const { adminLogin, verifyOTP } = require('../../controllers/admin/authController');
const { validateAdminLogin, validateOTP } = require('../../middlewares/validation');
const loginLimiter = require('../../middlewares/rateLimit');

router.post('/login', loginLimiter, validateAdminLogin, adminLogin);
router.post('/verify-otp', validateOTP, verifyOTP);

module.exports = router;