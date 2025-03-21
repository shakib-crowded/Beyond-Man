const mongoose = require("mongoose");
const { Schema } = mongoose;

// Function to convert title into a slug
const slugify = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

const blogSchema = new Schema({
  title: { type: String, required: true, maxlength: 250, minlength: 10 },
  slug: { type: String, unique: true },
  description: { type: String, required: true, maxlength: 120, minlength: 10 },
  content: { type: String, required: true },
  author: { type: String, maxlength: 40, minlength: 0 },
  category: { type: String, required: true },
  tags: { type: [String] },
  image: {
    url: String,
    filename: String,
  },
  created_date: { type: Date, default: Date.now }, // Automatically add the current date
  updated_date: { type: Date },
  admin: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

blogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

module.exports = blogSchema;
