const express = require("express");
const router = express.Router();
const androidDevController = require("../Controllers/android-dev");

router.get("/:topic", androidDevController.search_android_dev);

module.exports = router;
