const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { validateAdminSignUpPage } = require("../middleware");
const wrapAsync = require("../Utils/wrapAsync");
const adminEnterController = require("../Controllers/adminEnter");
const { loginLimiter } = require("../middleware");

router
  .route("/signup")
  .get(adminEnterController.sign_up_form)
  .post(validateAdminSignUpPage, wrapAsync(adminEnterController.sign_up));

router
  .route("/login")
  .get(adminEnterController.login_form)
  .post(
    loginLimiter,
    passport.authenticate("admin", {
      failureRedirect: "/admin/login",
      failureFlash: true,
    }),
    adminEnterController.login
  );

module.exports = router;
