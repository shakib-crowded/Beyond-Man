const express = require("express");
const router = express.Router();
const webDevController = require("../Controllers/web-dev");

router.get("/:topic", webDevController.search_web_dev);

module.exports = router;
