const Comment = require("../Models/comments");
const { userSignUp } = require("../Models/signUpUser");
const Blog = require("../Models/blogs");
const { adminSignUp } = require("../Models/signUpAdmin");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { content, blogId } = req.body;

    const userId = req.user.id; // Assuming user is attached in middleware

    const user = await userSignUp.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const username = user.username;

    const comment = new Comment({
      content,
      username,
      user: userId,
      name: user.name,
    });
    await comment.save();

    // Find the blog and push the comment ID into the comments array
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    blog.comments.push(comment._id);
    await blog.save(); // Save the updated blog with new comment

    res.status(201).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating comment" });
  }
};
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "name email") // Populate user in main comments
      .populate("replies.user", "name email"); // Populate user for only first-level replies

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    await Comment.findByIdAndUpdate(id, { content, update_at: new Date() });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await comment.save();

    res.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      userLiked: comment.likes.includes(userId),
      userDisliked: comment.dislikes.includes(userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Dislike a comment
exports.dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);
    const hasDisliked = comment.dislikes.includes(userId);

    if (hasDisliked) {
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    await comment.save();

    res.json({
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      userLiked: comment.likes.includes(userId),
      userDisliked: comment.dislikes.includes(userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reply to a comment
exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;

    const userId = req.user.id;
    const user =
      (await userSignUp.findById(userId)) ||
      (await adminSignUp.findById(userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const parentComment = await Comment.findById(req.params.id);
    if (!parentComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const name = user.role === "admin" ? `${user.name} (Author)` : user.name;

    const reply = new Comment({
      content,
      user: user._id,
      username: user.username,
      name,
    });
    await reply.save();
    if (!parentComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: "Error replying to comment" });
  }
};

exports.updateReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Find the reply inside the comment
    const reply = comment.replies.find(
      (reply) => reply._id.toString() === replyId
    );
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    reply.content = content;
    reply.updated_at = new Date();

    await comment.save();
    res
      .status(200)
      .json({ success: true, message: "Reply updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error while updating reply" });
  }
};
exports.deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Remove the reply from the array
    comment.replies = comment.replies.filter(
      (reply) => reply._id.toString() !== replyId
    );
    await comment.save();

    res
      .status(200)
      .json({ success: true, message: "Reply deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error while deleting reply" });
  }
};
