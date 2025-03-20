const express = require("express");
const router = express.Router();
const resetPasswordController = require("../Controllers/reset-password");

router.get("/:token", resetPasswordController.getResetPassword);

router.post("/:token", resetPasswordController.postResetPassword);

module.exports = router;
