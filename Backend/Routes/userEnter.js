const express = require("express");
const wrapAsync = require("../Utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const {
  redirectIfAuthenticated,
  requireVerificationSession,
} = require("../middleware");
const userEnterController = require("../Controllers/userEnter");

router
  .route("/register")
  .get(redirectIfAuthenticated, userEnterController.user_register_form)
  .post(wrapAsync(userEnterController.user_register));

router
  .route("/login")
  .get(redirectIfAuthenticated, userEnterController.user_login_form)
  .post(userEnterController.user_login);

router
  .route("/verify-otp")
  .get(
    redirectIfAuthenticated,
    requireVerificationSession,
    userEnterController.verifyOtpPage
  )
  .post(userEnterController.verifyOtp);

router.post("/resend-otp", userEnterController.resendOtp);

router.post("/logout", userEnterController.logout);

module.exports = router;
