const express = require("express");
const router = express.Router();
const imageController = require("../Controllers/imageController");

router.get("/:folder/:imageUrl", imageController.loadImage);
module.exports = router;
