const { isCompleteProfile } = require("../middleware");

module.exports.sign_up_form = (req, res) => {
  return res.send(
    "Underconstruction! Contact With Site Owner : beyondman.dev@gmail.com"
  );
  // res.render("../Admin/adminSignUp.ejs");
};

module.exports.sign_up = async (req, res, next) => {
  return res.send(
    "Underconstruction! Contact With Site Owner : beyondman.dev@gmail.com"
  );
  // const { name, username, email, password, about_admin } = req.body;

  // // Check for existing username
  // const existingAdmin = await adminSignUp.findOne({ username });
  // if (existingAdmin) {
  //   req.flash("error", "Username already taken.");
  //   return res.redirect("/admin/signup");
  // }

  // // Create a new admin
  // const admin = new adminSignUp({
  //   name,
  //   username,
  //   email,
  //   password,
  //   about_admin,
  // });
  // await admin.save();
  // req.login(admin, (err) => {
  //   if (err) return next(err);
  //   res.redirect("/admin/dashboard");
  // });
};

module.exports.login_form = (req, res) => {
  res.render("../Admin/adminLogin.ejs");
};

module.exports.login = (req, res) => {
  req.session.user = {
    id: req.user._id,
    username: req.user.username,
    role: "admin",
  };
  isCompleteProfile, req.flash("success", "Welcome back to the Admin Panel");
  res.redirect("/admin/profile");
};
