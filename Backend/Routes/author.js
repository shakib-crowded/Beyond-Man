const express = require("express");
const router = express.Router();
const authorController = require("../Controllers/author");

router.get("/:username", authorController.authorProfile);

module.exports = router;
