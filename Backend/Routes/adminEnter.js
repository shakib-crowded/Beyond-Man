const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const {
  validateAdminSignUpPage,
  redirectAdminIfAuthenticated,
} = require("../middleware");
const wrapAsync = require("../Utils/wrapAsync");
const adminEnterController = require("../Controllers/adminEnter");
const { loginLimiter } = require("../middleware");

router
  .route("/register")
  .get(redirectAdminIfAuthenticated, adminEnterController.register_form);

router
  .route("/login")
  .get(redirectAdminIfAuthenticated, adminEnterController.login_form)
  .post(redirectAdminIfAuthenticated, adminEnterController.login);

router.post("/logout", adminEnterController.logout);
module.exports = router;
