const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync");
const { isUserLoggedIn } = require("../middleware");
const indexController = require("../Controllers/index");

// Render Home Page
router.get("/", indexController.home);
router.get("/courses", indexController.courses);
// Render About Page
router.get("/about", indexController.about);
router
  .route("/contact")
  .get(indexController.contactPage)
  .post(isUserLoggedIn, wrapAsync(indexController.submitQueryForm));
router.get("/privacy-policy", indexController.privacyAndPolicy);
router.get("/terms-and-conditions", indexController.termsAndConditions);

module.exports = router;
