const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null for top-level comments
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Hide sensitive data if comment is deleted
        if (ret.isDeleted) {
          ret.content = "This comment has been deleted";
          ret.author = null;
          ret.likes = [];
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
CommentSchema.index({ blog: 1, parentComment: 1, createdAt: -1 });
CommentSchema.index({ createdAt: -1 });

// Virtual for reply count
CommentSchema.virtual("replyCount").get(function () {
  return this.replies.length;
});

// Virtual for like count
CommentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual to check if current user liked the comment
CommentSchema.virtual("isLiked").get(function () {
  // This will be populated in controller
  return false;
});

// Method to soft delete comment
CommentSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Comment", CommentSchema);
