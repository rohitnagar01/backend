const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const FailedLogin = require('../../models/FailedLogin');
const { generateOTP, getOTPExpiry } = require('../../services/otpService');
const { sendOTPEmail, sendLockoutEmail, sendUnauthorizedAccessEmail } = require('../../services/emailService');
const { JWT_SECRET } = require('../../config/constants');
const ApiError = require('../../utils/errorHandler');
const { logger, logFailedAttempt } = require('../../utils/logger');
const apiResponse = require('../../utils/apiResponse');

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logFailedAttempt(email, req.ip);
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Check if account is locked
    if (admin.isLocked()) {
      throw new ApiError(403, 'Account is temporarily locked. Please try again later.');
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await admin.incrementLoginAttempts();
      logFailedAttempt(email, req.ip);
      
      // Check if account should be locked now
      const updatedAdmin = await Admin.findOne({ email });
      if (updatedAdmin.isLocked()) {
        await sendLockoutEmail(email);
      }
      
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    // Save OTP to admin record
    admin.otp = { code: otp, expiresAt: otpExpiry };
    await admin.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp);
    
    // Reset login attempts
    await admin.resetLoginAttempts();
    
    apiResponse(res, 200, true, 'OTP sent to your email');
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }
    
    // Check if OTP exists and matches
    if (!admin.otp || admin.otp.code !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }
    
    // Check if OTP is expired
    if (new Date() > admin.otp.expiresAt) {
      throw new ApiError(400, 'OTP has expired');
    }
    
    // Clear OTP
    admin.otp = undefined;
    admin.isVerified = true;
    await admin.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    apiResponse(res, 200, true, 'Login successful', { token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  verifyOTP
};