const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync");
const { userAuth } = require("../middleware");
const indexController = require("../Controllers/index");
const courses = require("../Models/courses");

// Render Home Page
router.get("/", indexController.home);
router.get("/courses", indexController.courses);
router.get("/nav_courses", indexController.nav_course);
// Render About Page
router.get("/about", indexController.about);
router
  .route("/contact")
  .get(indexController.contactPage)
  .post(userAuth, wrapAsync(indexController.submitQueryForm));
router.get("/privacy-policy", indexController.privacyAndPolicy);
router.get("/terms-and-conditions", indexController.termsAndConditions);
router.get("/sitemap.xml", indexController.sitemap);

module.exports = router;
