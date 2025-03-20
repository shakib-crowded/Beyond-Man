const express = require("express");
const { submitQuery } = require("../Controllers/query");

const router = express.Router();

router.post("/", submitQuery);

module.exports = router;
