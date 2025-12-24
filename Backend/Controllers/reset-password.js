const User = require("../Models/User");

module.exports.getResetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
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
  } catch (error) {
    res.render("error.ejs", {
      message: "An error occurred while Forgot Password. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};

module.exports.postResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({
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

    res.redirect("/login");
  } catch (error) {
    res.render("error.ejs", {
      message: "An error occurred while Forgot Password. Please try again.",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
