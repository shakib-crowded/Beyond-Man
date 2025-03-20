const express = require("express");
const forgotPasswordController = require("../Controllers/forgot-password");
const router = express.Router();

// Render forget password form
router.get("/", forgotPasswordController.showForgotPasswordForm);

router.post("/", forgotPasswordController.forgotPassword);

module.exports = router;
