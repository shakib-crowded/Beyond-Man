const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User" },
  name: { type: String, required: true },
  content: { type: String, required: true },
  username: { type: String, required: true }, // Ensure username is stored
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  dislikes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware to update `updated_at`
CommentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.updated_at = Date.now();
  }
  next();
});

module.exports = mongoose.model("Comment", CommentSchema);
