const { userSignUp } = require("../Models/signUpUser");
const sendResetEmail = require("../Utils/mailer");
const crypto = require("crypto");

module.exports.showForgotPasswordForm = (req, res) => {
  res.render("../User/forget_password", { message: null });
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userSignUp.findOne({ email: email });

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

  await sendResetEmail(email, token);
  res.render("../User/forget_password", {
    message: "Password reset link has been sent to your email.",
    done: true,
  });
};
