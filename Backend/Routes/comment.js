const express = require("express");
const {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  replyToComment,
  updateReply,
  deleteReply,
} = require("../Controllers/comment");
const { isUserLoggedIn } = require("../middleware");

const router = express.Router();

router.post("/", isUserLoggedIn, createComment); // Create a comment
router.get("/", getComments); // Get all comments
router.put("/:id", isUserLoggedIn, updateComment); // Update a comment
router.delete("/:id", isUserLoggedIn, deleteComment); // Delete a comment
router.post("/:id/like", isUserLoggedIn, likeComment); // Like a comment
router.post("/:id/dislike", isUserLoggedIn, dislikeComment); // Dislike a comment
router.post("/:id/reply", isUserLoggedIn, replyToComment); // Reply to a comment
router.put("/:commentId/:replyId", isUserLoggedIn, updateReply);
router.delete("/:commentId/:replyId", isUserLoggedIn, deleteReply);
module.exports = router;
