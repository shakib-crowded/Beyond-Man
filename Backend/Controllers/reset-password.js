const { userSignUp } = require("../Models/signUpUser");

module.exports.getResetPassword = async (req, res) => {
  const user = await userSignUp.findOne({
    resetToken: req.params.token,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("../User/reset_password", {
      message: "Invalid or expired token.",
      done: false,
    });
  }

  res.render("../User/reset_password", {
    email: user.email,
    token: req.params.token,
    message: null,
    done: true,
  });
};

module.exports.postResetPassword = async (req, res) => {
  const { password } = req.body;
  const user = await userSignUp.findOne({
    resetToken: req.params.token,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("../User/reset_password", {
      message: "Invalid or expired token.",
      done: false,
    });
  }

  // Update password and remove reset token
  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  await user.save();

  req.flash("success", "Password reset successful! You can now log in.");
  res.redirect("/user-login");
};
