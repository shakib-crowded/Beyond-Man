const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Valid email format
  },
  queryTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Query", QuerySchema);
