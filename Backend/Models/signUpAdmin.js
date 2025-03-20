const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ExpressError } = require("../Utils/ExpressError");

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9._@-]+$/, // Only lowercase letters
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
  about_admin: {
    type: String,
    minlength: 30,
    maxlength: 500,
  },
  role: {
    type: String,
    default: "admin", // Set default role for admins
  },
});

const saltRounds = 10;

signupSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash password if it's modified
  try {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err); // Pass error if hashing fails
  }
});

// Method to compare password during login
signupSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new ExpressError(401, "Error comparing passwords");
  }
};

const adminSignUp = mongoose.model("Admin", signupSchema);

module.exports = { adminSignUp };
