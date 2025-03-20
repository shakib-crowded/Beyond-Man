const express = require("express");
const router = express.Router();
const sitemapController = require("../Controllers/sitemap");

router.get("/", sitemapController.mainSiteMap);
module.exports = router;
