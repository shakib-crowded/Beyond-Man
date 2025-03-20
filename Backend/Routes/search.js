const express = require("express");
const router = express.Router({ mergeParams: true });
const searchController = require("../Controllers/search");

router.get("/", searchController.searchAll);

router.get("/:slug", searchController.searchSpecific);

module.exports = router;
