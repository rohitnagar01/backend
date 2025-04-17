const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profile: {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    pincode: String,
    studentType: {
      type: String,
      enum: ['school', 'college', 'institute']
    },
    schoolName: String,
    collegeName: String,
    instituteName: String,
    className: String,
    aadharCard: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String
    },
    marksheet: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);