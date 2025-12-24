const User = require("../Models/User");
const { sendResetPasswordEmail } = require("../Utils/mailer");
const crypto = require("crypto");

module.exports.showForgotPasswordForm = (req, res) => {
  res.render("../User/forget_password", { message: null });
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("../User/forget_password", {
        message: "User Does Not Exists.",
        done: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000; // 1 Hour
    await user.save();

    await sendResetPasswordEmail(email, token);

    res.render("../User/forget_password", {
      message: "Password reset link has been sent to your email.",
      done: true,
    });
  } catch (error) {
    res.render("error.ejs", {
      message: "An error occurred while Forgot Password. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
