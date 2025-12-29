const express = require("express");
const wrapAsync = require("../Utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const {
  redirectUserIfAuthenticated,
  requireVerificationSession,
} = require("../middleware");
const userEnterController = require("../Controllers/userEnter");

router
  .route("/register")
  .get(redirectUserIfAuthenticated, userEnterController.user_register_form)
  .post(wrapAsync(userEnterController.user_register));

router
  .route("/login")
  .get(redirectUserIfAuthenticated, userEnterController.user_login_form)
  .post(userEnterController.user_login);

router
  .route("/verify-otp")
  .get(
    redirectUserIfAuthenticated,
    requireVerificationSession,
    userEnterController.verifyOtpPage
  )
  .post(userEnterController.verifyOtp);

router.post("/resend-otp", userEnterController.resendOtp);

router.post("/logout", userEnterController.logout);

module.exports = router;
