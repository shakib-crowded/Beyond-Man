const mongoose = require("mongoose");

const TempUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
  },

  username: {
    type: String,
    required: true,
    lowercase: true,
    minlength: 3,
    maxlength: 40,
    match: /^[a-z0-9._@-]+$/, // Only Lowercase Letters Allowed
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Valid email format
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["unverified"],
    default: "unverified",
  },

  createdAt: {
    type: Date,
    default: Date.now, // Used for auto-delete logic
    expires: 60 * 15, // TTL index → auto-delete in 16 hours
  },
});

// TTL INDEX (MongoDB auto-deletes expired documents)
TempUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 15 });

module.exports = mongoose.model("TempUser", TempUserSchema);
