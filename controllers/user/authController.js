const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { JWT_SECRET } = require('../../config/constants');
const { generateOTP } = require('../../services/otpService');
const { sendPasswordResetEmail } = require('../../services/emailService');
const ApiError = require('../../utils/errorHandler');
const apiResponse = require('../../utils/apiResponse');

const signup = async (req, res, next) => {
  try {
    const { firstName, middleName, lastName, mobileNumber, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingUser) {
      throw new ApiError(400, 'User with this email or mobile number already exists');
    }
    
    // Create new user
    const user = new User({
      firstName,
      middleName,
      lastName,
      mobileNumber,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    apiResponse(res, 201, true, 'User registered successfully', { token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    apiResponse(res, 200, true, 'Login successful', { token });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User with this email does not exist');
    }
    
    // Generate temporary password
    const tempPassword = generateOTP();
    
    // Set temporary password (in a real app, you'd want to expire this)
    user.password = tempPassword;
    await user.save();
    
    // Send email with temporary password
    await sendPasswordResetEmail(email, tempPassword);
    
    apiResponse(res, 200, true, 'Please check your email for a temporary password');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  forgotPassword
};