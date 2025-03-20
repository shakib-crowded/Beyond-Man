const mongoose = require("mongoose");
const blogSchema = require("./blogSchema"); // Import blogSchema directly

module.exports = mongoose.model("Blog", blogSchema);
