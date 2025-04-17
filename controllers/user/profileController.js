const User = require('../../models/User');
const Location = require('../../models/Location');
const StudentType = require('../../models/StudentType');
const ApiError = require('../../utils/errorHandler');
const apiResponse = require('../../utils/apiResponse');

const completeProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      countryId,
      stateId,
      cityId,
      pincode,
      studentType,
      schoolName,
      collegeName,
      instituteName,
      className
    } = req.body;
    
    // Validate location IDs if provided
    if (countryId) {
      const country = await Location.findById(countryId);
      if (!country || country.type !== 'country') {
        throw new ApiError(400, 'Invalid country ID');
      }
    }
    
    if (stateId) {
      const state = await Location.findById(stateId);
      if (!state || state.type !== 'state') {
        throw new ApiError(400, 'Invalid state ID');
      }
    }
    
    if (cityId) {
      const city = await Location.findById(cityId);
      if (!city || city.type !== 'city') {
        throw new ApiError(400, 'Invalid city ID');
      }
    }
    
    // Validate pincode if provided
    if (pincode && !/^\d+$/.test(pincode)) {
      throw new ApiError(400, 'Invalid pincode');
    }
    
    // Validate student type if provided
    if (studentType && !['school', 'college', 'institute'].includes(studentType)) {
      throw new ApiError(400, 'Invalid student type');
    }
    
    // Handle file uploads (simplified - in practice you'd use multer or similar)
    const aadharCard = req.files?.aadharCard?.[0];
    const marksheet = req.files?.marksheet?.[0];
    
    // Validate file types and sizes
    if (aadharCard) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(aadharCard.mimetype)) {
        throw new ApiError(400, 'Aadhar card must be PDF, JPG or PNG');
      }
      if (aadharCard.size > 100000) { // 100KB
        throw new ApiError(400, 'Aadhar card file size must not exceed 100KB');
      }
    }
    
    if (marksheet) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(marksheet.mimetype)) {
        throw new ApiError(400, 'Marksheet must be PDF, JPG or PNG');
      }
      if (marksheet.size > 100000) { // 100KB
        throw new ApiError(400, 'Marksheet file size must not exceed 100KB');
      }
    }
    
    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    user.profile = {
      country: countryId,
      state: stateId,
      city: cityId,
      pincode,
      studentType,
      schoolName,
      collegeName,
      instituteName,
      className,
      aadharCard: aadharCard ? {
        filename: aadharCard.originalname,
        path: aadharCard.path,
        size: aadharCard.size,
        mimetype: aadharCard.mimetype
      } : undefined,
      marksheet: marksheet ? {
        filename: marksheet.originalname,
        path: marksheet.path,
        size: marksheet.size,
        mimetype: marksheet.mimetype
      } : undefined
    };
    
    user.profileCompleted = true;
    await user.save();
    
    apiResponse(res, 200, true, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeProfile
};