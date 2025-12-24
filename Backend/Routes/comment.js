const express = require("express");
const router = express.Router();
const { userAuth } = require("../middleware");
const commentController = require("../Controllers/comment");

// All comment routes require authentication
router.use(userAuth);

// Comment CRUD operations
router.post("/", commentController.createComment);
router.get("/blog/:blogId", commentController.getComments);
router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);
router.post("/:commentId/like", commentController.toggleLike);
router.get("/:commentId/replies", commentController.getReplies);

module.exports = router;
