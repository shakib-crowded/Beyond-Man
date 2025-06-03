const express = require("express");
const router = express.Router();
const pathController = require("../Controllers/path");

router.get("/:path", pathController.path);

module.exports = router;
