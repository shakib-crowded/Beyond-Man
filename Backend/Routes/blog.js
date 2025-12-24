const express = require("express");
const router = express.Router({ mergeParams: true });
const blogController = require("../Controllers/blog");

router.get("/search", blogController.searchBlogs);
router.get("/:path/:slug", blogController.getBlogBySlug);
module.exports = router;
