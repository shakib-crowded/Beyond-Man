const express = require("express");
const wrapAsync = require("../Utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { validateUserSignUpPage, isUserNotLoggedIn } = require("../middleware");
const userEnterController = require("../Controllers/userEnter");

router
  .route("/user-signup")
  .get(userEnterController.sign_up_form)
  .post(validateUserSignUpPage, wrapAsync(userEnterController.sign_up));

router
  .route("/user-login")
  .get(isUserNotLoggedIn, userEnterController.login_form)
  .post(
    isUserNotLoggedIn,
    passport.authenticate("user", {
      failureRedirect: "/user-login",
      failureFlash: true,
    }),
    userEnterController.login
  );

router.get("/verify/:token", userEnterController.verifyUser);

router.get("/logout", userEnterController.logout);

module.exports = router;
