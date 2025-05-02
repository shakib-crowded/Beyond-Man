const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ExpressError } = require("../Utils/ExpressError");
const { required } = require("joi");

const userSignUpSchema = new mongoose.Schema({
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
    match: /^[a-z0-9._@-]+$/, // Only Lowercase Letter Allowed
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
  terms: {
    type: Boolean,
    required: true,
  },
  role: {
    type: String,
    default: "user", // Default role for users
  },
  resetToken: { type: String },
  resetTokenExpire: { type: Date },

  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
});

const saltRounds = 10;

userSignUpSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash password if it's modified

  try {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
  } catch (error) {
    next(error);
  }
});

// Method to compare password during login
userSignUpSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new ExpressError(401, "Error comparing passwords");
  }
};

const userSignUp = mongoose.model("User", userSignUpSchema);
module.exports = { userSignUp };
