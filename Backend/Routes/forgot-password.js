const express = require("express");
const forgotPasswordController = require("../Controllers/forgot-password");
const router = express.Router();

router
  .route("/")
  .get(forgotPasswordController.showForgotPasswordForm)
  .post(forgotPasswordController.forgotPassword);
module.exports = router;
