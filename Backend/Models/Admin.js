const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ExpressError } = require("../Utils/ExpressError");

const EducationSchema = new mongoose.Schema({
  degreeName: {
    type: String,
    required: true,
    trim: true,
  },
  universityName: {
    type: String,
    required: true,
    trim: true,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  endingDate: {
    type: Date,
    default: null,
  },
});

const AdminProfileSchema = new mongoose.Schema({
  education: [EducationSchema], // Now stores an array of education objects
  location: {
    type: String,
    required: true,
  },
  hobbies: {
    type: [String],
  },
  profile_image: {
    url: String,
    filename: String,
  },
  instagram_profile: {
    type: String,
  },
  linkedin_profile: {
    type: String,
  },
  x_profile: {
    type: String,
  },
  about_admin: {
    type: String,
    minlength: 30,
    maxlength: 500,
  },
});

const AdminSchema = new mongoose.Schema({
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
  role: {
    type: String,
    default: "admin", // Set default role for admins
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  profile: AdminProfileSchema,
});

const saltRounds = 10;

AdminSchema.pre("save", async function (next) {
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
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new ExpressError(401, "Error comparing passwords");
  }
};

module.exports = mongoose.model("Admin", AdminSchema);
