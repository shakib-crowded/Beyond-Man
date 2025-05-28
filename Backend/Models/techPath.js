const mongoose = require("mongoose");

const techIconSchema = new mongoose.Schema({
  name: String,
  path: String,
  iconUrl: String,
  altText: String,
  title: String,
});

const categorySchema = new mongoose.Schema({
  title: String,
  techIcons: [techIconSchema],
});

module.exports = mongoose.model("TechPath", categorySchema);
