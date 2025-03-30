const express = require("express");
const router = express.Router();
const imageController = require("../Controllers/imageController");

router.get("/blog_image_id/:imageUrl", imageController.loadImage);
module.exports = router;
