const mongoose = require("mongoose");

const AuthorProfile = new mongoose.Schema({
  education: {
    type: String,
    required: true,
  },
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
