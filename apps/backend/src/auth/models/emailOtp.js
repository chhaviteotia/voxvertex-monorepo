import mongoose from "mongoose";

// Email OTP Schema - Fallback storage when Redis is not available
// This ensures AWS compatibility and works in all environments
const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true,
    trim: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for cleanup and performance
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailOtpSchema.index({ email: 1, createdAt: -1 });

// Method to check if OTP is valid and not expired
emailOtpSchema.methods.isValid = function() {
  return !this.isVerified && this.expiresAt > new Date() && this.attempts < 3;
};

// Method to increment attempts
emailOtpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to mark as verified
emailOtpSchema.methods.markAsVerified = function() {
  this.isVerified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const EmailOtp = mongoose.models.EmailOtp || mongoose.model("EmailOtp", emailOtpSchema);
export default EmailOtp;

