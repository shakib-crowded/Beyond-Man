const Comment = require("../Models/Comment");
const Blog = require("../Models/Blog");
// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { content, blogId, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validate blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Create comment
    const commentData = {
      content,
      blog: blogId,
      author: userId,
    };
    let comment;

    // If it's a reply
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }

      commentData.parentComment = parentCommentId;

      comment = await Comment.create(commentData);

      // Add reply to parent comment
      parentComment.replies.push(comment._id);
      await parentComment.save();
    } else {
      // Top-level comment
      comment = await Comment.create(commentData);

      // Add comment to blog
      blog.comments.push(comment._id);
      await blog.save();
    }

    // Populate author details for response
    const newComment = await Comment.findById(comment._id)
      .populate({
        path: "author",
        select: "name username profile avatar",
      })
      .lean();

    res.status(201).json({
      success: true,
      message: parentCommentId ? "Reply added" : "Comment added",
      comment: newComment,
    });
  } catch (error) {
    console.log("This is error: ", error);
    // console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// Get comments for a blog with pagination
exports.getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;
    const userId = req.user?.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    let sortOption = { createdAt: -1 }; // newest first by default
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popular") sortOption = { likeCount: -1 };

    // Get top-level comments
    const comments = await Comment.find({
      blog: blogId,
      parentComment: null,
      isDeleted: false,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "author",
        select: "name username profile avatar",
      })
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: {
          path: "author",
          select: "name username profile avatar",
        },
        options: { sort: { createdAt: 1 } },
        perDocumentLimit: 5, // Limit replies per comment
      })
      .lean();

    // Mark if user liked each comment
    if (userId) {
      comments.forEach((comment) => {
        comment.isLiked = comment.likes.some(
          (like) => like.toString() === userId
        );
        // Process replies
        comment.replies?.forEach((reply) => {
          reply.isLiked = reply.likes.some(
            (like) => like.toString() === userId
          );
        });
      });
    }

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({
      blog: blogId,
      parentComment: null,
      isDeleted: false,
    });

    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / parseInt(limit)),
        totalComments,
        hasMore: totalComments > skip + comments.length,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    // Check if comment is deleted
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit deleted comment",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(commentId).populate({
      path: "author",
      select: "name username profile avatar",
    });

    res.json({
      success: true,
      message: "Comment updated",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

// Delete comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check ownership (or admin role)
    const isOwner = comment.author.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Soft delete the comment
    await comment.softDelete();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

// Like/Unlike comment
exports.toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const likeIndex = comment.likes.indexOf(userId);
    let action = "";

    if (likeIndex === -1) {
      // Like
      comment.likes.push(userId);
      action = "liked";
    } else {
      // Unlike
      comment.likes.splice(likeIndex, 1);
      action = "unliked";
    }

    await comment.save();

    res.json({
      success: true,
      message: `Comment ${action}`,
      likes: comment.likes.length,
      isLiked: action === "liked",
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
    });
  }
};

// Get more replies
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "author",
        select: "name username profile avatar",
      })
      .lean();

    // Mark if user liked each reply
    if (userId) {
      replies.forEach((reply) => {
        reply.isLiked = reply.likes.some((like) => like.toString() === userId);
      });
    }

    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
      isDeleted: false,
    });

    res.json({
      success: true,
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReplies / parseInt(limit)),
        totalReplies,
        hasMore: totalReplies > skip + replies.length,
      },
    });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
    });
  }
};
