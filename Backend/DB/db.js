const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("MongoDB Connect");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
