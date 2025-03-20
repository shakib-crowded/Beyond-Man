const express = require("express");
const router = express.Router();
const programmingController = require("../Controllers/programming");
router.get("/:topic", programmingController.search_programming);

module.exports = router;
