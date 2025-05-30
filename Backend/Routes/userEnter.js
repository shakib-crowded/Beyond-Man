const express = require("express");
const wrapAsync = require("../Utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { validateUserSignUpPage, isUserNotLoggedIn } = require("../middleware");
const userEnterController = require("../Controllers/userEnter");

router
  .route("/register")
  .get(userEnterController.sign_up_form)
  .post(validateUserSignUpPage, wrapAsync(userEnterController.sign_up));

router
  .route("/login")
  .get(isUserNotLoggedIn, userEnterController.login_form)
  .post(
    isUserNotLoggedIn,
    passport.authenticate("user", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userEnterController.login
  );

router.get("/verify/:token", userEnterController.verifyUser);

router.post("/logout", userEnterController.logout);

module.exports = router;
