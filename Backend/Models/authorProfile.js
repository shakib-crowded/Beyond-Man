const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
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

const AuthorProfile = new mongoose.Schema({
  education: [educationSchema], // Now stores an array of education objects
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
  about_author: {
    type: String,
    required: true,
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
  isCompletedProfile: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("AuthorProfile", AuthorProfile);
