const express = require("express");
const router = express.Router();
const softwareDevController = require("../Controllers/software-dev");

router.get("/:topic", softwareDevController.search_software_dev);

module.exports = router;
