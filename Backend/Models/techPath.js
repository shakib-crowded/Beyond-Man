const mongoose = require("mongoose");

const techIconSchema = new mongoose.Schema({
  order: Number,
  name: String,
  path: String,
  iconUrl: String,
  altText: String,
  title: String,
  metaDescription: String,
});

const categorySchema = new mongoose.Schema({
  title: String,
  techIcons: [techIconSchema],
});

module.exports = mongoose.model("TechPath", categorySchema);
