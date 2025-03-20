const express = require("express");
const router = express.Router({ mergeParams: true });
const blogController = require("../Controllers/blog");

router.get("/:slug", blogController.blogs);
module.exports = router;
