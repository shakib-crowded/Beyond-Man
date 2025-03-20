const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContactSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Plase enter a Subject.\n"],
    },
    message: {
      type: String,
      required: [true, "Please enter a Message.\n"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
